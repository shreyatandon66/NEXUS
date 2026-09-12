/* ============================================================
   NEXUS Discovery — Logic Verification Harness (Node only)
   Mocks window/localStorage/URLSearchParams, loads the real
   data + filter pipeline, and asserts expected behavior.
   Run: node test-discovery.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- Minimal browser mocks ---
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
        // Real URLSearchParams decodes "+" as a space.
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
  location: {
    search: '',
    pathname: '/index.html',
    hash: '',
    href: 'http://localhost/index.html'
  },
  history: {
    replaceState: (data, title, url) => {
      windowMock.location.href = url;
      const qIndex = url.indexOf('?');
      windowMock.location.search = qIndex >= 0 ? url.slice(qIndex) : '';
    }
  },
  URLSearchParams: urlSearchParamsMock,
  localStorage: localStorageMock,
  NEXUS_VIDEOS: []
};

const sandbox = {
  window: windowMock,
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
  Math: Math
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// --- Load real data + filter pipeline ---
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
  vm.runInContext(code, sandbox, { filename: relPath });
}

loadScript('data/videos.js');
loadScript('js/filter.js');

const discovery = sandbox.window.NexusDiscovery;
if (!discovery) {
  console.error('FAIL: NexusDiscovery not exposed on window');
  process.exit(1);
}

// --- Test helpers ---
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

function reset() {
  discovery.resetFilters();
}

function ids(videos) {
  return videos.map((v) => (typeof v === 'string' ? v : v.id)).sort();
}

function expectIds(actual, expected, label) {
  const a = ids(actual);
  const e = ids(expected);
  assert(JSON.stringify(a) === JSON.stringify(e), label + ' → got [' + a.join(',') + ']');
}

// ============================================================
// 1. Baseline — all videos
// ============================================================
console.log('\n1. Baseline');
reset();
const all = discovery.getFilteredVideos();
assert(all.length === 12, 'all 12 videos returned with no filters');

// ============================================================
// 2. Search — real dataset values
// ============================================================
console.log('\n2. Search');
reset();
discovery.setFilter('search', 'neural');
expectIds(discovery.getFilteredVideos(), ['v001'], 'search "neural" → v001');

reset();
discovery.setFilter('search', 'photography');
expectIds(discovery.getFilteredVideos(), ['v002'], 'search "photography" (category) → v002');

reset();
discovery.setFilter('search', 'CodeCraft');
expectIds(discovery.getFilteredVideos(), ['v001'], 'search "CodeCraft" (channel) → v001');

reset();
discovery.setFilter('search', 'black holes');
expectIds(discovery.getFilteredVideos(), ['v006'], 'search "black holes" (partial title) → v006');

// ============================================================
// 3. Empty search input
// ============================================================
console.log('\n3. Empty search');
reset();
discovery.setFilter('search', '   ');
assert(discovery.getFilteredVideos().length === 12, 'whitespace-only search returns all videos');

// ============================================================
// 4. Zero-result search
// ============================================================
console.log('\n4. Zero-result search');
reset();
discovery.setFilter('search', 'zzzz-no-such-video');
assert(discovery.getFilteredVideos().length === 0, 'no results for nonsense query');

// ============================================================
// 5. Category filter
// ============================================================
console.log('\n5. Category filter');
reset();
discovery.setFilter('category', 'technology');
expectIds(discovery.getFilteredVideos(), ['v001', 'v009'], 'category technology → v001,v009');

reset();
discovery.setFilter('category', 'art-design');
expectIds(discovery.getFilteredVideos(), ['v005'], 'category art-design → v005');

// ============================================================
// 6. Upload-date filter
// ============================================================
console.log('\n6. Upload-date filter');
reset();
discovery.setFilter('date', 'week');
const weekVideos = discovery.getFilteredVideos();
assert(weekVideos.length > 0, 'date=week returns some videos');
weekVideos.forEach((v) => {
  const days = Math.round((Date.now() - new Date(v.uploadDate).getTime()) / 86400000);
  assert(days >= 0 && days <= 7, 'date=week video ' + v.id + ' is within 7 days');
});

reset();
discovery.setFilter('date', 'month');
const monthVideos = discovery.getFilteredVideos();
assert(monthVideos.length > 0, 'date=month returns some videos');
monthVideos.forEach((v) => {
  const d = new Date(v.uploadDate);
  const now = new Date();
  assert(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(),
    'date=month video ' + v.id + ' is in current month');
});

reset();
discovery.setFilter('date', 'older');
const olderVideos = discovery.getFilteredVideos();
assert(olderVideos.length > 0, 'date=older returns some videos');
olderVideos.forEach((v) => {
  const d = new Date(v.uploadDate);
  const now = new Date();
  assert(d.getFullYear() < now.getFullYear() ||
    (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth()),
    'date=older video ' + v.id + ' is from a previous month');
});

// ============================================================
// 7. Duration filter
// ============================================================
console.log('\n7. Duration filter');
reset();
discovery.setFilter('duration', 'short');
const shortVideos = discovery.getFilteredVideos();
assert(shortVideos.length > 0, 'duration=short returns some videos');
shortVideos.forEach((v) => {
  assert(v.durationSeconds < 900, 'duration=short video ' + v.id + ' is under 15 min');
});

reset();
discovery.setFilter('duration', 'medium');
const mediumVideos = discovery.getFilteredVideos();
assert(mediumVideos.length > 0, 'duration=medium returns some videos');
mediumVideos.forEach((v) => {
  assert(v.durationSeconds >= 900 && v.durationSeconds <= 1800,
    'duration=medium video ' + v.id + ' is 15–30 min');
});

reset();
discovery.setFilter('duration', 'long');
const longVideos = discovery.getFilteredVideos();
assert(longVideos.length > 0, 'duration=long returns some videos');
longVideos.forEach((v) => {
  assert(v.durationSeconds > 1800, 'duration=long video ' + v.id + ' is over 30 min');
});

// ============================================================
// 8. Content-type filter
// ============================================================
console.log('\n8. Content-type filter');
reset();
discovery.setFilter('type', 'lecture');
const lectureVideos = discovery.getFilteredVideos();
assert(lectureVideos.length > 0, 'type=lecture returns some videos');
lectureVideos.forEach((v) => {
  assert(discovery.getContentType(v) === 'lecture', 'type=lecture video ' + v.id + ' is lecture');
});

reset();
discovery.setFilter('type', 'tutorial');
const tutorialVideos = discovery.getFilteredVideos();
assert(tutorialVideos.length > 0, 'type=tutorial returns some videos');
tutorialVideos.forEach((v) => {
  assert(discovery.getContentType(v) === 'tutorial', 'type=tutorial video ' + v.id + ' is tutorial');
});

// ============================================================
// 9. Combined filtering (AND pipeline)
// ============================================================
console.log('\n9. Combined filtering');
reset();
discovery.setFilter('search', 'electric');
discovery.setFilter('category', 'technology');
discovery.setFilter('duration', 'medium');
expectIds(discovery.getFilteredVideos(), ['v009'],
  'search "electric" + category technology + duration medium → v009');

reset();
discovery.setFilter('category', 'science');
discovery.setFilter('type', 'lecture');
discovery.setFilter('duration', 'medium');
expectIds(discovery.getFilteredVideos(), ['v006', 'v011'],
  'category science + type lecture + duration medium → v006,v011');

reset();
discovery.setFilter('search', 'lo-fi');
discovery.setFilter('category', 'music');
discovery.setFilter('duration', 'long');
expectIds(discovery.getFilteredVideos(), ['v007'],
  'search "lo-fi" + category music + duration long → v007');

// ============================================================
// 10. Filters do not overwrite each other
// ============================================================
console.log('\n10. Filter independence');
reset();
discovery.setFilter('category', 'travel');
discovery.setFilter('date', 'all');
discovery.setFilter('duration', 'all');
discovery.setFilter('type', 'all');
expectIds(discovery.getFilteredVideos(), ['v004', 'v012'],
  'category travel persists after setting other filters to all');

// ============================================================
// 11. Reset
// ============================================================
console.log('\n11. Reset');
reset();
discovery.setFilter('search', 'neural');
discovery.setFilter('category', 'technology');
discovery.setFilter('date', 'week');
discovery.setFilter('duration', 'short');
discovery.setFilter('type', 'lecture');
discovery.resetFilters();
const state = discovery.getState();
assert(state.search === '' && state.category === 'all' && state.date === 'all' &&
  state.duration === 'all' && state.type === 'all' && state.selectedVideoId === null,
  'reset clears all filter state');
assert(discovery.getFilteredVideos().length === 12, 'reset restores full feed');

// ============================================================
// 12. Related videos
// ============================================================
console.log('\n12. Related videos');
reset();
const related = discovery.getRelatedVideos('v001', 4);
assert(related.length > 0, 'related videos exist for v001');
assert(related.every((v) => v.id !== 'v001'), 'related videos exclude source');
const sourceVideo = discovery.getVideoById('v001');
const sourceSlug = discovery.categoryToSlug(sourceVideo.category);
const sourceType = discovery.getContentType(sourceVideo);
assert(related.every((v) =>
  discovery.categoryToSlug(v.category) === sourceSlug ||
  discovery.getContentType(v) === sourceType
), 'related videos share category or content type with source');

// ============================================================
// 13. Filter counts
// ============================================================
console.log('\n13. Filter counts');
reset();
let counts = discovery.getFilterCounts();
assert(counts.all === 12, 'counts.all === 12');
assert(counts.technology === 2, 'counts.technology === 2');
assert(counts['art-design'] === 1, 'counts.art-design === 1');

reset();
discovery.setFilter('search', 'science');
counts = discovery.getFilterCounts();
assert(counts.all === 2, 'counts.all === 2 with search "science"');
assert(counts.science === 2, 'counts.science === 2 with search "science"');

// ============================================================
// 14. URL state
// ============================================================
console.log('\n14. URL state');
reset();
discovery.setFilter('search', 'neural');
discovery.setFilter('category', 'technology');
assert(windowMock.location.search.indexOf('q=neural') !== -1, 'URL contains q=neural');
assert(windowMock.location.search.indexOf('category=technology') !== -1, 'URL contains category=technology');

// Simulate a fresh page load with URL params
storage['nexus-discovery'] = JSON.stringify({ search: '', category: 'all', date: 'all', duration: 'all', type: 'all' });
windowMock.location.search = '?q=black+holes&category=science';
delete sandbox.window.NexusDiscovery;
loadScript('js/filter.js');
const reloaded = sandbox.window.NexusDiscovery;
const restored = reloaded.getState();
assert(restored.search === 'black holes', 'URL q param restored on load');
assert(restored.category === 'science', 'URL category param restored on load');

// ============================================================
// 15. LocalStorage persistence
// ============================================================
console.log('\n15. LocalStorage persistence');
reset();
reloaded.setFilter('search', 'drone');
reloaded.setFilter('category', 'travel');
const saved = JSON.parse(storage['nexus-discovery']);
assert(saved.search === 'drone', 'localStorage saved search');
assert(saved.category === 'travel', 'localStorage saved category');

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
console.log('ALL TESTS PASSED');