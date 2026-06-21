(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function bindMobileMenu() {
        var toggle = qs("[data-mobile-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindSearchForms() {
        qsa(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input", form);
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var stage = qs("[data-hero]");
        if (!stage) {
            return;
        }

        var slides = qsa(".hero-slide", stage);
        var dots = qsa(".hero-dot", stage);
        if (!slides.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function bindCardFilter() {
        var panel = qs("[data-filter-panel]");
        if (!panel) {
            return;
        }

        var input = qs("[data-filter-input]", panel);
        var buttons = qsa("[data-filter]", panel);
        var cards = qsa("[data-card]");
        var empty = qs("[data-empty]");
        var activeFilter = "all";

        function normalize(text) {
            return (text || "").toLowerCase().replace(/\s+/g, "");
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var type = card.getAttribute("data-type") || "";
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchType = activeFilter === "all" || type.indexOf(activeFilter) !== -1;
                var shouldShow = matchQuery && matchType;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                input.value = query;
            }
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });

        apply();
    }

    window.initMoviePlayer = function (videoId, buttonId, overlayId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !overlay || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 32,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function play() {
            load();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });

        overlay.addEventListener("click", play);

        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        bindMobileMenu();
        bindSearchForms();
        initHero();
        bindCardFilter();
    });
})();
