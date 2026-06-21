(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setActiveSlide(slides, dots, index) {
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      setActiveSlide(slides, dots, index);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        go(dotIndex);
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function filterList(input) {
    var section = input.closest("section") || document;
    var list = section.querySelector("[data-filter-list]") || document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = section.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        filterList(input);
      });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var searchInput = searchPage.querySelector("[data-search-input]");
      if (searchInput) {
        searchInput.value = query;
        filterList(searchInput);
      }
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

window.initVideoPlayer = function (streamUrl) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  var hlsInstance = null;
  var attached = false;
  var requested = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function tryPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          tryPlay();
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function start() {
    requested = true;
    overlay.classList.add("is-hidden");
    attach();
    tryPlay();
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
};
