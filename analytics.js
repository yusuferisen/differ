// analytics.js — platform-agnostic event tracking wrapper
// Swap the provider by changing init() and track() internals only.
(function () {
  var queue = [];
  var _trackEvent = null;
  var analytics = {
    _ready: false,

    init: function () {
      import('https://cdn.jsdelivr.net/npm/@aptabase/web@0.5.0/+esm')
        .then(function (mod) {
          mod.init('A-US-6807308605');
          _trackEvent = mod.trackEvent;
          analytics._ready = true;
          for (var i = 0; i < queue.length; i++) {
            try { _trackEvent(queue[i][0], queue[i][1]); } catch (_) {}
          }
          queue = [];
        })
        .catch(function (e) { console.warn('Analytics failed to load', e); queue = []; });
    },

    track: function (event, props) {
      if (!analytics._ready) { queue.push([event, props]); return; }
      try { _trackEvent(event, props); } catch (_) {}
    }
  };

  window.analytics = analytics;
})();
