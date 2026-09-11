/* ============================================================
   NEXUS Discovery — Filter Pipeline
   Shared filter state + AND-combined matching against NEXUS_VIDEOS.
   Search matching lives here so category/date/duration/type
   and the query all run through one pipeline.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'nexus-discovery';
  var URL_KEYS = {
    search: 'q',
    category: 'category',
    date: 'date',
    duration: 'duration',
    type: 'type'
  };
  var DEFAULT_STATE = {
    search: '',
    category: 'all',
    date: 'all',
    duration: 'all',
    type: 'all',
    selectedVideoId: null
  };

  /**
   * Dataset has no `type` field. Map existing categories to a
   * content-type used only by the discovery filters.
   */
  var CATEGORY_TO_TYPE = {
    technology: 'lecture',
    science: 'lecture',
    education: 'lecture',
    photography: 'tutorial',
    food: 'tutorial',
    fitness: 'tutorial',
    'art-design': 'tutorial',
    travel: 'documentary',
    lifestyle: 'documentary',
    film: 'documentary',
    music: 'mix',
    gaming: 'video',
    news: 'video'
  };

  var filterState = {
    search: DEFAULT_STATE.search,
    category: DEFAULT_STATE.category,
    date: DEFAULT_STATE.date,
    duration: DEFAULT_STATE.duration,
    type: DEFAULT_STATE.type,
    selectedVideoId: DEFAULT_STATE.selectedVideoId
  };

  function getVideos() {
    if (Array.isArray(window.NEXUS_VIDEOS)) {
      return window.NEXUS_VIDEOS;
    }
    return [];
  }

  /**
   * Display label → HTML slug. "Art & Design" → "art-design"
   */
  function categoryToSlug(label) {
    if (!label) {
      return '';
    }
    return String(label)
      .toLowerCase()
      .replace(/&/g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getContentType(video) {
    var slug = categoryToSlug(video && video.category);
    return CATEGORY_TO_TYPE[slug] || 'video';
  }

  function parseUploadDate(iso) {
    if (!iso || typeof iso !== 'string') {
      return null;
    }
    var parts = iso.split('-');
    if (parts.length < 3) {
      return null;
    }
    var year = Number(parts[0]);
    var month = Number(parts[1]);
    var day = Number(parts[2]);
    if (!year || !month || !day) {
      return null;
    }
    var date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Recursively collect every string/number value in a video object
   * so search covers all existing and future searchable metadata
   * (title, category, channel name, description, tags, etc.).
   */
  function collectSearchableStrings(value, out) {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      var i;
      for (i = 0; i < value.length; i += 1) {
        collectSearchableStrings(value[i], out);
      }
      return;
    }
    if (typeof value === 'object') {
      Object.keys(value).forEach(function (key) {
        collectSearchableStrings(value[key], out);
      });
    }
  }

  function matchesSearch(video, query) {
    var trimmed = String(query || '').trim().toLowerCase();
    if (!trimmed) {
      return true;
    }

    var haystack = [];
    collectSearchableStrings(video, haystack);

    var i;
    for (i = 0; i < haystack.length; i += 1) {
      if (haystack[i].toLowerCase().indexOf(trimmed) !== -1) {
        return true;
      }
    }
    return false;
  }

  function matchesCategory(video, categorySlug) {
    if (!categorySlug || categorySlug === 'all') {
      return true;
    }
    return categoryToSlug(video.category) === categorySlug;
  }

  function matchesDate(video, dateFilter) {
    if (!dateFilter || dateFilter === 'all') {
      return true;
    }

    var uploaded = parseUploadDate(video.uploadDate);
    if (!uploaded) {
      return false;
    }

    var today = startOfDay(new Date());
    var uploadedDay = startOfDay(uploaded);
    var diffMs = today.getTime() - uploadedDay.getTime();
    var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (dateFilter === 'today') {
      return diffDays === 0;
    }
    if (dateFilter === 'week') {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (dateFilter === 'month') {
      return (
        uploadedDay.getFullYear() === today.getFullYear() &&
        uploadedDay.getMonth() === today.getMonth()
      );
    }
    if (dateFilter === 'older') {
      return (
        uploadedDay.getFullYear() < today.getFullYear() ||
        (uploadedDay.getFullYear() === today.getFullYear() &&
          uploadedDay.getMonth() < today.getMonth())
      );
    }
    return true;
  }

  function getDurationSeconds(video) {
    var seconds = video && video.durationSeconds;
    if (typeof seconds === 'number' && isFinite(seconds) && seconds >= 0) {
      return seconds;
    }
    return null;
  }

  /**
   * Short < 15 min, Medium 15–30 min, Long > 30 min.
   */
  function matchesDuration(video, durationFilter) {
    if (!durationFilter || durationFilter === 'all') {
      return true;
    }

    var seconds = getDurationSeconds(video);
    if (seconds === null) {
      return false;
    }

    if (durationFilter === 'short') {
      return seconds < 15 * 60;
    }
    if (durationFilter === 'medium') {
      return seconds >= 15 * 60 && seconds <= 30 * 60;
    }
    if (durationFilter === 'long') {
      return seconds > 30 * 60;
    }
    return true;
  }

  function matchesType(video, typeFilter) {
    if (!typeFilter || typeFilter === 'all') {
      return true;
    }
    return getContentType(video) === typeFilter;
  }

  function getFilteredVideos() {
    var videos = getVideos();
    var state = filterState;

    return videos.filter(function (video) {
      return (
        matchesSearch(video, state.search) &&
        matchesCategory(video, state.category) &&
        matchesDate(video, state.date) &&
        matchesDuration(video, state.duration) &&
        matchesType(video, state.type)
      );
    });
  }

  /**
   * Count videos per category under the current non-category filters.
   * Used to show live result counts on the category chips.
   */
  function getFilterCounts() {
    var videos = getVideos();
    var state = filterState;
    var counts = { all: 0 };

    videos.forEach(function (video) {
      var slug = categoryToSlug(video.category);
      var matchesOther = (
        matchesSearch(video, state.search) &&
        matchesDate(video, state.date) &&
        matchesDuration(video, state.duration) &&
        matchesType(video, state.type)
      );
      if (!matchesOther) {
        return;
      }
      counts.all += 1;
      if (!counts[slug]) {
        counts[slug] = 0;
      }
      counts[slug] += 1;
    });

    return counts;
  }

  function getVideoById(id) {
    var videos = getVideos();
    var i;
    for (i = 0; i < videos.length; i += 1) {
      if (videos[i].id === id) {
        return videos[i];
      }
    }
    return null;
  }

  /**
   * Related videos: same category first, then same content type.
   * Never includes the source video.
   */
  function getRelatedVideos(videoId, limit) {
    var source = getVideoById(videoId);
    if (!source) {
      return [];
    }

    var max = typeof limit === 'number' ? limit : 4;
    var sourceSlug = categoryToSlug(source.category);
    var sourceType = getContentType(source);
    var videos = getVideos();
    var sameCategory = [];
    var sameType = [];
    var i;
    var video;

    for (i = 0; i < videos.length; i += 1) {
      video = videos[i];
      if (video.id === source.id) {
        continue;
      }
      if (categoryToSlug(video.category) === sourceSlug) {
        sameCategory.push(video);
      } else if (getContentType(video) === sourceType) {
        sameType.push(video);
      }
    }

    return sameCategory.concat(sameType).slice(0, max);
  }

  function setFilter(key, value) {
    if (!Object.prototype.hasOwnProperty.call(filterState, key)) {
      return;
    }
    filterState[key] = value;
    persistState();
    updateUrl();
  }

  function resetFilters() {
    filterState.search = DEFAULT_STATE.search;
    filterState.category = DEFAULT_STATE.category;
    filterState.date = DEFAULT_STATE.date;
    filterState.duration = DEFAULT_STATE.duration;
    filterState.type = DEFAULT_STATE.type;
    filterState.selectedVideoId = DEFAULT_STATE.selectedVideoId;
    persistState();
    updateUrl();
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        search: filterState.search,
        category: filterState.category,
        date: filterState.date,
        duration: filterState.duration,
        type: filterState.type
      }));
    } catch (error) {
      // Storage can fail in private mode; discovery still works in-memory.
    }
  }

  /**
   * Read search/filter params from the URL query string.
   * @returns {Object} Partial state object with only present params.
   */
  function readUrlState() {
    var urlState = {};
    try {
      var params = new URLSearchParams(window.location.search);
      Object.keys(URL_KEYS).forEach(function (key) {
        var value = params.get(URL_KEYS[key]);
        if (value !== null && value !== '') {
          urlState[key] = value;
        }
      });
    } catch (error) {
      // URLSearchParams may be unavailable in very old browsers.
    }
    return urlState;
  }

  /**
   * Reflect the current filter state in the URL query string
   * without reloading the page.
   */
  function updateUrl() {
    try {
      var params = new URLSearchParams();
      Object.keys(URL_KEYS).forEach(function (key) {
        var value = filterState[key];
        if (value && value !== DEFAULT_STATE[key]) {
          params.set(URL_KEYS[key], value);
        }
      });
      var query = params.toString();
      var url = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
      window.history.replaceState(null, '', url);
    } catch (error) {
      // Ignore — URL sync is progressive enhancement.
    }
  }

  function restoreState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (typeof saved.search === 'string') {
            filterState.search = saved.search;
          }
          if (typeof saved.category === 'string') {
            filterState.category = saved.category;
          }
          if (typeof saved.date === 'string') {
            filterState.date = saved.date;
          }
          if (typeof saved.duration === 'string') {
            filterState.duration = saved.duration;
          }
          if (typeof saved.type === 'string') {
            filterState.type = saved.type;
          }
        }
      }
    } catch (error) {
      // Ignore corrupt storage and keep defaults.
    }

    // URL query params take priority over saved state.
    var urlState = readUrlState();
    Object.keys(urlState).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(filterState, key)) {
        filterState[key] = urlState[key];
      }
    });
  }

  restoreState();

  window.NexusDiscovery = {
    getState: function () {
      return {
        search: filterState.search,
        category: filterState.category,
        date: filterState.date,
        duration: filterState.duration,
        type: filterState.type,
        selectedVideoId: filterState.selectedVideoId
      };
    },
    setFilter: setFilter,
    resetFilters: resetFilters,
    getFilteredVideos: getFilteredVideos,
    getFilterCounts: getFilterCounts,
    getRelatedVideos: getRelatedVideos,
    getVideoById: getVideoById,
    categoryToSlug: categoryToSlug,
    getContentType: getContentType,
    getVideos: getVideos
  };
})();
