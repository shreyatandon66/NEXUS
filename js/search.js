/* ============================================================
   NEXUS Discovery — Search, Rendering, and UI Events
   Renders Shreya's VideoCard markup from NEXUS_VIDEOS and
   wires search + filter controls to NexusDiscovery.
   ============================================================ */

(function () {
  'use strict';

  var discovery = window.NexusDiscovery;
  if (!discovery) {
    return;
  }

  var els = {
    searchInputs: [],
    searchForms: [],
    chips: [],
    dateSelect: null,
    durationSelect: null,
    typeSelect: null,
    resetBtn: null,
    status: null,
    grid: null,
    empty: null,
    emptyMessage: null,
    emptyReset: null,
    relatedSection: null,
    relatedGrid: null,
    relatedHeading: null
  };

  var SEARCH_DEBOUNCE_MS = 150;
  var searchTimer = null;
  var lastRenderedCounts = null;

  function cacheElements() {
    els.searchInputs = Array.prototype.slice.call(
      document.querySelectorAll('#search-input, #search-input-mobile')
    );
    els.searchForms = Array.prototype.slice.call(
      document.querySelectorAll('.nav__search-form')
    );
    els.chips = Array.prototype.slice.call(
      document.querySelectorAll('.category-chip[data-category]')
    );
    els.dateSelect = document.getElementById('filter-date');
    els.durationSelect = document.getElementById('filter-duration');
    els.typeSelect = document.getElementById('filter-type');
    els.resetBtn = document.getElementById('filter-reset');
    els.status = document.getElementById('discovery-status');
    els.grid = document.getElementById('video-grid');
    els.empty = document.getElementById('discovery-empty');
    els.emptyMessage = document.getElementById('discovery-empty-message');
    els.emptyReset = document.getElementById('discovery-empty-reset');
    els.relatedSection = document.getElementById('related-videos');
    els.relatedGrid = document.getElementById('related-grid');
    els.relatedHeading = document.getElementById('related-videos-heading');
  }

  function getInitials(name) {
    if (!name) {
      return '?';
    }
    var parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  function formatViews(views) {
    var count = Number(views);
    if (!isFinite(count) || count < 0) {
      return '0 views';
    }
    if (count >= 1000000) {
      var millions = count / 1000000;
      var millionLabel = millions >= 10 ? String(Math.round(millions)) : millions.toFixed(1).replace(/\.0$/, '');
      return millionLabel + 'M views';
    }
    if (count >= 1000) {
      var thousands = count / 1000;
      var thousandLabel = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1).replace(/\.0$/, '');
      return thousandLabel + 'K views';
    }
    return String(count) + ' views';
  }

  function formatRelativeDate(iso) {
    if (!iso) {
      return '';
    }
    var parts = String(iso).split('-');
    if (parts.length < 3) {
      return '';
    }
    var uploaded = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(uploaded.getTime())) {
      return '';
    }

    var today = new Date();
    var startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var startUploaded = new Date(uploaded.getFullYear(), uploaded.getMonth(), uploaded.getDate());
    var diffDays = Math.round((startToday.getTime() - startUploaded.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return '1 day ago';
    }
    if (diffDays < 7) {
      return diffDays + ' days ago';
    }
    var weeks = Math.round(diffDays / 7);
    if (diffDays < 30) {
      return weeks === 1 ? '1 week ago' : weeks + ' weeks ago';
    }
    var months = Math.round(diffDays / 30);
    return months === 1 ? '1 month ago' : months + ' months ago';
  }

  function formatDurationSpoken(duration) {
    if (!duration) {
      return '';
    }
    var bits = String(duration).split(':');
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    if (bits.length === 3) {
      hours = Number(bits[0]);
      minutes = Number(bits[1]);
      seconds = Number(bits[2]);
    } else if (bits.length === 2) {
      minutes = Number(bits[0]);
      seconds = Number(bits[1]);
    } else {
      return String(duration);
    }

    var parts = [];
    if (hours) {
      parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
    }
    if (minutes) {
      parts.push(minutes + (minutes === 1 ? ' minute' : ' minutes'));
    }
    if (seconds) {
      parts.push(seconds + (seconds === 1 ? ' second' : ' seconds'));
    }
    return parts.join(' ');
  }

  function createText(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  /**
   * Build one VideoCard using Shreya's existing classes and markup pattern.
   */
  function createVideoCard(video, options) {
    options = options || {};
    var slug = discovery.categoryToSlug(video.category);
    var channelName = video.channel && video.channel.name ? video.channel.name : 'Unknown';
    var channelColor = video.channel && video.channel.color ? video.channel.color : '#6C5CE7';
    var spokenDuration = formatDurationSpoken(video.duration);
    var relativeDate = formatRelativeDate(video.uploadDate);
    var isSelected = options.selectedId && options.selectedId === video.id;

    var article = document.createElement('article');
    article.className = isSelected ? 'video-card video-card--selected' : 'video-card';
    article.setAttribute('data-video-id', video.id || '');
    article.setAttribute('data-category', slug);
    article.setAttribute('data-content-type', discovery.getContentType(video));

    var thumbLink = document.createElement('a');
    thumbLink.className = 'video-card__thumbnail';
    thumbLink.href = '#';
    thumbLink.setAttribute(
      'aria-label',
      (video.title || 'Video') + (spokenDuration ? ' — ' + spokenDuration : '')
    );

    var img = document.createElement('img');
    img.className = 'video-card__thumbnail-img';
    img.src = video.thumbnail || '';
    img.alt = video.title || '';
    img.loading = 'lazy';
    thumbLink.appendChild(img);

    if (video.duration) {
      var durationBadge = createText('span', 'video-card__duration', video.duration);
      durationBadge.setAttribute('aria-hidden', 'true');
      thumbLink.appendChild(durationBadge);
    }

    var body = document.createElement('div');
    body.className = 'video-card__body';

    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'video-card__avatar';
    avatarWrap.setAttribute('aria-hidden', 'true');

    var avatar = document.createElement('div');
    avatar.className = 'video-card__avatar-img';
    avatar.textContent = getInitials(channelName);
    avatar.style.backgroundColor = channelColor;
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.color = '#fff';
    avatar.style.fontSize = '0.75rem';
    avatar.style.fontWeight = '600';
    avatar.style.width = '100%';
    avatar.style.height = '100%';
    avatarWrap.appendChild(avatar);

    var info = document.createElement('div');
    info.className = 'video-card__info';

    var title = createText('h3', 'video-card__title', video.title || 'Untitled');

    var channelLink = document.createElement('a');
    channelLink.className = 'video-card__channel';
    channelLink.href = '#';
    channelLink.textContent = channelName;

    var meta = document.createElement('div');
    meta.className = 'video-card__meta';
    meta.appendChild(createText('span', '', formatViews(video.views)));
    if (relativeDate) {
      var separator = document.createElement('span');
      separator.className = 'video-card__meta-separator';
      separator.setAttribute('aria-hidden', 'true');
      meta.appendChild(separator);
      meta.appendChild(createText('span', '', relativeDate));
    }

    info.appendChild(title);
    info.appendChild(channelLink);
    info.appendChild(meta);
    body.appendChild(avatarWrap);
    body.appendChild(info);

    article.appendChild(thumbLink);
    article.appendChild(body);
    return article;
  }

  function clearNode(node) {
    if (!node) {
      return;
    }
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function renderVideos() {
    if (!els.grid) {
      return;
    }

    var state = discovery.getState();
    var videos = discovery.getFilteredVideos();

    clearNode(els.grid);

    if (videos.length === 0) {
      els.grid.hidden = true;
      if (els.empty) {
        els.empty.hidden = false;
      }
      if (els.emptyMessage) {
        els.emptyMessage.textContent = getEmptyMessage(state);
      }
    } else {
      els.grid.hidden = false;
      if (els.empty) {
        els.empty.hidden = true;
      }
      videos.forEach(function (video) {
        els.grid.appendChild(createVideoCard(video, { selectedId: state.selectedVideoId }));
      });
    }

    updateStatus(videos.length, state);
    renderRelated(state);
  }

  function getEmptyMessage(state) {
    var query = String(state.search || '').trim();
    if (query) {
      return 'No videos match “' + query + '”. Try a different search or reset your filters.';
    }
    return 'No videos match the selected filters. Reset to see the full feed.';
  }

  function updateStatus(count, state) {
    if (!els.status) {
      return;
    }
    var query = String(state.search || '').trim();
    var parts = [];
    if (count === 1) {
      parts.push('1 video');
    } else {
      parts.push(count + ' videos');
    }
    if (query) {
      parts.push('matching “' + query + '”');
    }
    els.status.textContent = parts.join(' ');
  }

  function renderRelated(state) {
    if (!els.relatedSection || !els.relatedGrid) {
      return;
    }

    var selectedId = state.selectedVideoId;
    var related = selectedId ? discovery.getRelatedVideos(selectedId, 4) : [];

    clearNode(els.relatedGrid);

    if (!selectedId || related.length === 0) {
      els.relatedSection.hidden = true;
      return;
    }

    var source = discovery.getVideoById(selectedId);
    if (els.relatedHeading) {
      els.relatedHeading.textContent = source
        ? 'Related to “' + source.title + '”'
        : 'Related videos';
    }

    related.forEach(function (video) {
      els.relatedGrid.appendChild(createVideoCard(video, { selectedId: selectedId }));
    });
    els.relatedSection.hidden = false;
  }

  function updateClearButtons() {
    var hasQuery = Boolean(String(discovery.getState().search || '').trim());
    els.searchInputs.forEach(function (input) {
      var clearBtn = input.parentNode.querySelector('.nav__search-clear');
      if (clearBtn) {
        clearBtn.hidden = !hasQuery;
        clearBtn.setAttribute('aria-hidden', hasQuery ? 'false' : 'true');
      }
    });
  }

  function updateFilterCounts() {
    var counts = discovery.getFilterCounts();
    var countsKey = JSON.stringify(counts);
    if (countsKey === lastRenderedCounts) {
      return;
    }
    lastRenderedCounts = countsKey;

    els.chips.forEach(function (chip) {
      var category = chip.getAttribute('data-category') || 'all';
      var count = counts[category] || 0;
      var badge = chip.querySelector('.category-chip__count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'category-chip__count';
        badge.setAttribute('aria-hidden', 'true');
        chip.appendChild(badge);
      }
      badge.textContent = String(count);
    });
  }

  function updateFilterUI() {
    var state = discovery.getState();

    els.searchInputs.forEach(function (input) {
      if (input.value !== state.search) {
        input.value = state.search;
      }
    });

    els.chips.forEach(function (chip) {
      var isActive = chip.getAttribute('data-category') === state.category;
      chip.classList.toggle('category-chip--active', isActive);
      chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (els.dateSelect) {
      els.dateSelect.value = state.date;
    }
    if (els.durationSelect) {
      els.durationSelect.value = state.duration;
    }
    if (els.typeSelect) {
      els.typeSelect.value = state.type;
    }

    updateClearButtons();
    updateFilterCounts();
  }

  function applyAndRender() {
    updateFilterUI();
    renderVideos();
  }

  function scheduleSearchRender() {
    if (searchTimer) {
      window.clearTimeout(searchTimer);
    }
    searchTimer = window.setTimeout(function () {
      searchTimer = null;
      renderVideos();
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleSearchInput(event) {
    var value = event.target.value;
    discovery.setFilter('search', value);
    discovery.setFilter('selectedVideoId', null);
    els.searchInputs.forEach(function (input) {
      if (input !== event.target) {
        input.value = value;
      }
    });
    updateClearButtons();
    updateFilterCounts();
    scheduleSearchRender();
  }

  function handleClearSearch() {
    discovery.setFilter('search', '');
    discovery.setFilter('selectedVideoId', null);
    els.searchInputs.forEach(function (input) {
      input.value = '';
    });
    applyAndRender();
  }

  function handleChipClick(event) {
    var chip = event.currentTarget;
    var category = chip.getAttribute('data-category') || 'all';
    discovery.setFilter('category', category);
    discovery.setFilter('selectedVideoId', null);
    applyAndRender();
  }

  function handleSelectChange(key, event) {
    discovery.setFilter(key, event.target.value);
    discovery.setFilter('selectedVideoId', null);
    applyAndRender();
  }

  function handleReset() {
    discovery.resetFilters();
    applyAndRender();
  }

  function handleGridClick(event) {
    var card = event.target.closest('.video-card');
    if (!card) {
      return;
    }

    var link = event.target.closest('a');
    if (link) {
      event.preventDefault();
    }

    var videoId = card.getAttribute('data-video-id');
    var state = discovery.getState();
    var nextId = state.selectedVideoId === videoId ? null : videoId;
    discovery.setFilter('selectedVideoId', nextId);
    renderVideos();
  }

  function handleKeydown(event) {
    // "/" focuses the search input, but not while typing elsewhere.
    if (event.key !== '/') {
      return;
    }
    var target = event.target;
    var tag = target && target.tagName;
    var isTyping = (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      (target && target.isContentEditable)
    );
    if (isTyping) {
      return;
    }
    event.preventDefault();
    var input = els.searchInputs[0];
    if (input) {
      input.focus();
      input.select();
    }
  }

  function createClearButtons() {
    els.searchInputs.forEach(function (input) {
      if (input.parentNode.querySelector('.nav__search-clear')) {
        return;
      }
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'nav__search-clear';
      clearBtn.setAttribute('aria-label', 'Clear search');
      clearBtn.hidden = true;
      clearBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="18" y1="6" x2="6" y2="18"/>' +
        '<line x1="6" y1="6" x2="18" y2="18"/>' +
        '</svg>';
      input.parentNode.insertBefore(clearBtn, input.nextSibling);
    });
  }

  function bindEvents() {
    els.searchInputs.forEach(function (input) {
      input.addEventListener('input', handleSearchInput);
    });

    els.searchForms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
      });
    });

    document.querySelectorAll('.nav__search-clear').forEach(function (btn) {
      btn.addEventListener('click', handleClearSearch);
    });

    els.chips.forEach(function (chip) {
      chip.addEventListener('click', handleChipClick);
    });

    if (els.dateSelect) {
      els.dateSelect.addEventListener('change', function (event) {
        handleSelectChange('date', event);
      });
    }
    if (els.durationSelect) {
      els.durationSelect.addEventListener('change', function (event) {
        handleSelectChange('duration', event);
      });
    }
    if (els.typeSelect) {
      els.typeSelect.addEventListener('change', function (event) {
        handleSelectChange('type', event);
      });
    }
    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', handleReset);
    }
    if (els.emptyReset) {
      els.emptyReset.addEventListener('click', handleReset);
    }
    if (els.grid) {
      els.grid.addEventListener('click', handleGridClick);
    }
    if (els.relatedGrid) {
      els.relatedGrid.addEventListener('click', handleGridClick);
    }

    document.addEventListener('keydown', handleKeydown);
  }

  function init() {
    cacheElements();
    createClearButtons();
    bindEvents();
    applyAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();