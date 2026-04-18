// analytics.js — platform-agnostic event tracking wrapper
// Swap the provider by changing init() and track() internals only.
(function () {
  var queue = [];
  var analytics = {
    _ready: false,

    init: function () {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@aptabase/web@latest/dist/index.iife.js';
      script.onload = function () {
        if (window.Aptabase) {
          window.Aptabase.init('A-US-6807308605');
          analytics._ready = true;
          for (var i = 0; i < queue.length; i++) {
            try { window.Aptabase.trackEvent(queue[i][0], queue[i][1]); } catch (_) {}
          }
          queue = [];
        }
      };
      script.onerror = function () { queue = []; };
      document.head.appendChild(script);
    },

    track: function (event, props) {
      if (!analytics._ready) { queue.push([event, props]); return; }
      try { window.Aptabase.trackEvent(event, props); } catch (_) {}
    }
  };

  window.analytics = analytics;
})();
