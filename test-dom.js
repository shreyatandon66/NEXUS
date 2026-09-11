/* ============================================================
   NEXUS Discovery — DOM Layer Verification Harness (Node only)
   Mocks a minimal DOM, loads data + filter + search scripts,
   and verifies rendering, event wiring, and UI updates.
   Run: node test-dom.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ============================================================
// Minimal DOM mock
// ============================================================
class MockClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  toggle(cls, force) {
    const has = this.set.has(cls);
    const shouldHave = force === undefined ? !has : Boolean(force);
    if (shouldHave) this.set.add(cls);
    else this.set.delete(cls);
    return shouldHave;
  }
  add(cls) { this.set.add(cls); }
  remove(cls) { this.set.delete(cls); }
  contains(cls) { return this.set.has(cls); }
}

class MockElement {
  constructor(tagName) {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = {};
    this.classList = new MockClassList(this);
    this.listeners = {};
    this.hidden = false;
    this.value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.checked = false;
    this.disabled = false;
    this.isContentEditable = false;
    this.firstChild = null;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return name in this.attributes ? this.attributes[name] : null; }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    if (!this.firstChild) this.firstChild = child;
    return child;
  }
  insertBefore(child, ref) {
    child.parentNode = this;
    const idx = ref ? this.children.indexOf(ref) : -1;
    if (idx >= 0) this.children.splice(idx, 0, child);
    else this.children.push(child);
    if (!this.firstChild) this.firstChild = child;
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    if (this.firstChild === child) this.firstChild = this.children[0] || null;
    child.parentNode = null;
    return child;
  }
  querySelector(sel) {
    if (sel === '.nav__search-clear') {
      return this.children.find((c) => c.className === 'nav__search-clear') || null;
    }
    if (sel === '.category-chip__count') {
      return this.children.find((c) => c.className === 'category-chip__count') || null;
    }
    return null;
  }
  querySelectorAll(sel) {
    if (sel === '.nav__search-clear') {
      return this.children.filter((c) => c.className === 'nav__search-clear');
    }
    return [];
  }
  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  dispatch(type, event) {
    const ev = event || { target: this, currentTarget: this, preventDefault() {} };
    (this.listeners[type] || []).forEach((fn) => fn(ev));
    // Bubble up to parent (simplified DOM event propagation)
    if (this.parentNode) {
      this.parentNode.dispatch(type, ev);
    }
  }
  focus() { this.focused = true; }
  select() { this.selected = true; }
  closest(sel) {
    if (sel === '.video-card' && this.className && String(this.className).indexOf('video-card') !== -1) {
      return this;
    }
    return null;
  }
}

class MockDocument {
  constructor() {
    this.readyState = 'complete';
    this.listeners = {};
    this.elements = {};
    this.body = new MockElement('body');
  }
  getElementById(id) { return this.elements[id] || null; }
  querySelectorAll(sel) {
    const results = [];
    const all = Object.values(this.elements);
    if (sel === '#search-input, #search-input-mobile') {
      return all.filter((el) => el.id === 'search-input' || el.id === 'search-input-mobile');
    }
    if (sel === '.nav__search-form') {
      return all.filter((el) => el.className && String(el.className).indexOf('nav__search-form') !== -1);
    }
    if (sel === '.category-chip[data-category]') {
      return all.filter((el) => el.className && String(el.className).indexOf('category-chip') !== -1 && el.getAttribute('data-category'));
    }
    if (sel === '.nav__search-clear') {
      // Search the actual DOM tree (forms contain the clear buttons)
      const found = [];
      all.forEach((el) => {
        if (el.children) {
          el.children.forEach((child) => {
            if (child.className === 'nav__search-clear') found.push(child);
          });
        }
      });
      return found;
    }
    return results;
  }
  createElement(tag) { return new MockElement(tag); }
  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  dispatch(type, event) {
    (this.listeners[type] || []).forEach((fn) => fn(event || { target: this.body }));
  }
}

// ============================================================
// Build the page structure
// ============================================================
const doc = new MockDocument();

function makeInput(id) {
  const el = new MockElement('input');
  el.id = id;
  el.type = 'search';
  el.value = '';
  return el;
}

function makeForm(id) {
  const form = new MockElement('form');
  form.className = 'nav__search-form';
  form.id = id;
  return form;
}

function makeChip(category) {
  const chip = new MockElement('button');
  chip.className = 'category-chip';
  chip.setAttribute('data-category', category);
  chip.setAttribute('role', 'tab');
  chip.setAttribute('aria-selected', 'false');
  return chip;
}

function makeSelect(id) {
  const sel = new MockElement('select');
  sel.id = id;
  sel.value = 'all';
  return sel;
}

// Nav search (desktop)
const searchFormDesktop = makeForm('search-form-desktop');
const searchInputDesktop = makeInput('search-input');
searchFormDesktop.appendChild(searchInputDesktop);
doc.elements['search-input'] = searchInputDesktop;
doc.elements['search-form-desktop'] = searchFormDesktop;

// Nav search (mobile)
const searchFormMobile = makeForm('search-form-mobile');
const searchInputMobile = makeInput('search-input-mobile');
searchFormMobile.appendChild(searchInputMobile);
doc.elements['search-input-mobile'] = searchInputMobile;
doc.elements['search-form-mobile'] = searchFormMobile;

// Category chips
const chipCategories = ['all', 'technology', 'photography', 'food', 'travel', 'art-design', 'science', 'music', 'fitness', 'lifestyle', 'gaming', 'education', 'news', 'film'];
const chips = {};
chipCategories.forEach((cat) => {
  const chip = makeChip(cat);
  chips[cat] = chip;
  doc.elements['chip-' + cat] = chip;
});

// Filter selects
const dateSelect = makeSelect('filter-date');
const durationSelect = makeSelect('filter-duration');
const typeSelect = makeSelect('filter-type');
doc.elements['filter-date'] = dateSelect;
doc.elements['filter-duration'] = durationSelect;
doc.elements['filter-type'] = typeSelect;

// Reset + status + grid + empty + related
const resetBtn = new MockElement('button');
resetBtn.id = 'filter-reset';
doc.elements['filter-reset'] = resetBtn;

const status = new MockElement('p');
status.id = 'discovery-status';
doc.elements['discovery-status'] = status;

const grid = new MockElement('div');
grid.id = 'video-grid';
doc.elements['video-grid'] = grid;

const empty = new MockElement('div');
empty.id = 'discovery-empty';
empty.hidden = true;
doc.elements['discovery-empty'] = empty;

const emptyMessage = new MockElement('p');
emptyMessage.id = 'discovery-empty-message';
doc.elements['discovery-empty-message'] = emptyMessage;

const emptyReset = new MockElement('button');
emptyReset.id = 'discovery-empty-reset';
doc.elements['discovery-empty-reset'] = emptyReset;

const relatedSection = new MockElement('section');
relatedSection.id = 'related-videos';
relatedSection.hidden = true;
doc.elements['related-videos'] = relatedSection;

const relatedGrid = new MockElement('div');
relatedGrid.id = 'related-grid';
doc.elements['related-grid'] = relatedGrid;

const relatedHeading = new MockElement('h2');
relatedHeading.id = 'related-videos-heading';
doc.elements['related-videos-heading'] = relatedHeading;

// ============================================================
// Sandbox with DOM + browser mocks
// ============================================================
const storage = {};
const localStorageMock = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const urlSearchParamsMock = function (input) {
  const params = new Map();
  if (input) {
    const q = String(input).replace(/^\?/, '');
    if (q) {
      q.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        params.set(
          decodeURIComponent(k.replace(/\+/g, ' ')),
          decodeURIComponent((v || '').replace(/\+/g, ' '))
        );
      });
    }
  }
  return {
    get: (key) => (params.has(key) ? params.get(key) : null),
    set: (key, value) => { params.set(key, String(value)); },
    toString: () => Array.from(params.entries())
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&')
  };
};

const windowMock = {
  location: { search: '', pathname: '/index.html', hash: '', href: 'http://localhost/index.html' },
  history: {
    replaceState: (data, title, url) => {
      windowMock.location.href = url;
      const qIndex = url.indexOf('?');
      windowMock.location.search = qIndex >= 0 ? url.slice(qIndex) : '';
    }
  },
  URLSearchParams: urlSearchParamsMock,
  localStorage: localStorageMock,
  NEXUS_VIDEOS: [],
  setTimeout: (fn, ms) => { fn(); return 0; },
  clearTimeout: () => {},
  addEventListener: () => {}
};

const sandbox = {
  window: windowMock,
  document: doc,
  localStorage: localStorageMock,
  URLSearchParams: urlSearchParamsMock,
  console: console,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  JSON: JSON,
  isFinite: isFinite,
  isNaN: isNaN,
  Math: Math,
  setTimeout: (fn, ms) => { fn(); return 0; },
  clearTimeout: () => {}
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// ============================================================
// Load scripts
// ============================================================
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
  vm.runInContext(code, sandbox, { filename: relPath });
}

loadScript('data/videos.js');
loadScript('js/filter.js');
loadScript('js/search.js');

const discovery = sandbox.window.NexusDiscovery;
if (!discovery) {
  console.error('FAIL: NexusDiscovery not exposed');
  process.exit(1);
}

// ============================================================
// Test helpers
// ============================================================
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    passed += 1;
    console.log('  PASS: ' + label);
  } else {
    failed += 1;
    failures.push(label);
    console.log('  FAIL: ' + label);
  }
}

function cardCount() {
  return grid.children.filter((c) => c.className && String(c.className).indexOf('video-card') !== -1).length;
}

// ============================================================
// 1. Initial render
// ============================================================
console.log('\n1. Initial render');
assert(cardCount() === 12, '12 cards rendered on load');
assert(grid.hidden === false, 'grid visible on load');
assert(empty.hidden === true, 'empty state hidden on load');
assert(status.textContent.indexOf('12 videos') !== -1, 'status shows "12 videos"');

// ============================================================
// 2. Search input → debounced render
// ============================================================
console.log('\n2. Search input');
searchInputDesktop.value = 'neural';
searchInputDesktop.dispatch('input', { target: searchInputDesktop });
assert(cardCount() === 1, 'search "neural" renders 1 card');
assert(grid.children[0].getAttribute('data-video-id') === 'v001', 'rendered card is v001');
assert(searchInputMobile.value === 'neural', 'mobile input synced');
assert(status.textContent.indexOf('1 video') !== -1, 'status shows "1 video"');

// ============================================================
// 3. Clear-search button
// ============================================================
console.log('\n3. Clear-search button');
const clearBtnDesktop = searchFormDesktop.querySelector('.nav__search-clear');
assert(clearBtnDesktop !== null, 'clear button created in desktop form');
assert(clearBtnDesktop.hidden === false, 'clear button visible when query present');
clearBtnDesktop.dispatch('click', { target: clearBtnDesktop, currentTarget: clearBtnDesktop });
assert(searchInputDesktop.value === '', 'clear button empties input');
assert(cardCount() === 12, 'clear button restores full feed');
assert(clearBtnDesktop.hidden === true, 'clear button hidden after clearing');

// ============================================================
// 4. Category chip click
// ============================================================
console.log('\n4. Category chip click');
chips.technology.dispatch('click', { target: chips.technology, currentTarget: chips.technology });
assert(cardCount() === 2, 'technology chip renders 2 cards');
assert(chips.technology.classList.contains('category-chip--active'), 'technology chip active');
assert(chips.technology.getAttribute('aria-selected') === 'true', 'technology chip aria-selected=true');
assert(chips.all.classList.contains('category-chip--active') === false, 'All chip no longer active');

// ============================================================
// 5. Filter selects
// ============================================================
console.log('\n5. Filter selects');
dateSelect.value = 'older';
dateSelect.dispatch('change', { target: dateSelect, currentTarget: dateSelect });
assert(cardCount() === 2, 'technology + date=older still 2 cards (both older)');

durationSelect.value = 'medium';
durationSelect.dispatch('change', { target: durationSelect, currentTarget: durationSelect });
assert(cardCount() === 2, 'technology + older + medium → 2 cards (v001,v009)');

typeSelect.value = 'lecture';
typeSelect.dispatch('change', { target: typeSelect, currentTarget: typeSelect });
assert(cardCount() === 2, 'technology + older + medium + lecture → 2 cards (v001,v009)');

// ============================================================
// 6. Reset button
// ============================================================
console.log('\n6. Reset button');
resetBtn.dispatch('click', { target: resetBtn, currentTarget: resetBtn });
assert(cardCount() === 12, 'reset restores 12 cards');
assert(dateSelect.value === 'all' && durationSelect.value === 'all' && typeSelect.value === 'all',
  'reset restores select values');
assert(chips.all.classList.contains('category-chip--active'), 'reset restores All chip active');
assert(searchInputDesktop.value === '', 'reset clears search input');

// ============================================================
// 7. Zero-result empty state
// ============================================================
console.log('\n7. Zero-result empty state');
searchInputDesktop.value = 'zzzz-no-such-video';
searchInputDesktop.dispatch('input', { target: searchInputDesktop });
assert(cardCount() === 0, 'zero cards for nonsense query');
assert(grid.hidden === true, 'grid hidden on zero results');
assert(empty.hidden === false, 'empty state visible on zero results');
assert(emptyMessage.textContent.indexOf('zzzz-no-such-video') !== -1, 'empty message includes query');

// Clear via empty-state reset
emptyReset.dispatch('click', { target: emptyReset, currentTarget: emptyReset });
assert(cardCount() === 12, 'empty-state reset restores feed');

// ============================================================
// 8. Related videos
// ============================================================
console.log('\n8. Related videos');
const firstCard = grid.children[0];
firstCard.dispatch('click', { target: firstCard, currentTarget: firstCard });
assert(relatedSection.hidden === false, 'related section visible after card click');
assert(relatedGrid.children.length > 0, 'related grid has cards');
assert(relatedHeading.textContent.indexOf('Related to') !== -1, 'related heading set');

// Click again to deselect (re-query — grid was re-rendered)
const firstCardAfter = grid.children[0];
firstCardAfter.dispatch('click', { target: firstCardAfter, currentTarget: firstCardAfter });
assert(relatedSection.hidden === true, 'related section hidden after deselect');

// ============================================================
// 9. Filter counts on chips
// ============================================================
console.log('\n9. Filter counts');
const allChipCount = chips.all.querySelector('.category-chip__count');
assert(allChipCount !== null, 'All chip has count badge');
assert(allChipCount.textContent === '12', 'All chip count = 12');
const techChipCount = chips.technology.querySelector('.category-chip__count');
assert(techChipCount.textContent === '2', 'Technology chip count = 2');

// ============================================================
// 10. "/" keyboard shortcut
// ============================================================
console.log('\n10. "/" keyboard shortcut');
searchInputDesktop.focused = false;
doc.dispatch('keydown', { key: '/', target: doc.body, preventDefault() {} });
assert(searchInputDesktop.focused === true, '"/" focuses search input');

// Should NOT trigger while typing in an input
searchInputDesktop.focused = false;
doc.dispatch('keydown', { key: '/', target: searchInputDesktop, preventDefault() {} });
assert(searchInputDesktop.focused === false, '"/" does not trigger while typing in input');

// ============================================================
// 11. URL state sync
// ============================================================
console.log('\n11. URL state sync');
chips.science.dispatch('click', { target: chips.science, currentTarget: chips.science });
assert(windowMock.location.search.indexOf('category=science') !== -1, 'URL contains category=science');

// ============================================================
// Summary
// ============================================================
console.log('\n========================================');
console.log('PASSED: ' + passed);
console.log('FAILED: ' + failed);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('ALL DOM TESTS PASSED');