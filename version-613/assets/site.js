(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navButton = document.querySelector('[data-menu-button]');
    var navList = document.querySelector('[data-nav-list]');

    if (navButton && navList) {
      navButton.addEventListener('click', function () {
        navList.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroIndex = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === heroIndex);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === heroIndex);
      });
    }

    if (slides.length) {
      showHero(0);
      dots.forEach(function (dot, position) {
        dot.addEventListener('click', function () {
          showHero(position);
        });
      });
      setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      var searchInput = filterPanel.querySelector('[data-search-input]');
      var typeSelect = filterPanel.querySelector('[data-filter-type]');
      var regionSelect = filterPanel.querySelector('[data-filter-region]');
      var yearSelect = filterPanel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            ok = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            ok = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            ok = false;
          }
          card.classList.toggle('hidden-card', !ok);
        });
      }

      [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var playLayer = player.querySelector('.play-layer');
      var playButton = player.querySelector('.play-button');
      var started = false;
      var hlsInstance = null;

      function playVideo() {
        if (!video) {
          return;
        }
        var source = video.querySelector('source');
        var url = source ? source.getAttribute('src') : video.getAttribute('src');
        if (!url) {
          return;
        }
        if (playLayer) {
          playLayer.classList.add('is-hidden');
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 60,
            liveSyncDurationCount: 3
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
                video.src = url;
                video.play().catch(function () {});
              }
            }
          });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      }

      if (playButton) {
        playButton.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
      player.addEventListener('click', function () {
        playVideo();
      });
      video.addEventListener('play', function () {
        if (!started) {
          playVideo();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
