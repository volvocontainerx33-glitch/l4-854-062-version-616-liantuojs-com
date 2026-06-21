(function () {
    function toggleMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var next = root.querySelector("[data-hero-next]");
        var prev = root.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]"));
        sections.forEach(function (section) {
            var search = section.querySelector("[data-filter-search]");
            var year = section.querySelector("[data-filter-year]");
            var sort = section.querySelector("[data-filter-sort]");
            var grid = section.querySelector("[data-filter-grid]");
            var empty = section.querySelector("[data-empty-state]");
            if (!grid) {
                return;
            }
            var items = Array.prototype.slice.call(grid.querySelectorAll(".filter-item"));

            function apply() {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;
                items.forEach(function (item) {
                    var text = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-tags") || "",
                        item.getAttribute("data-type") || "",
                        item.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !selectedYear || item.getAttribute("data-year") === selectedYear;
                    var matched = matchKeyword && matchYear;
                    item.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function reorder() {
                var mode = sort ? sort.value : "rating";
                items.sort(function (a, b) {
                    if (mode === "year") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    if (mode === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return Number(b.getAttribute("data-rating") || 0) - Number(a.getAttribute("data-rating") || 0);
                });
                items.forEach(function (item) {
                    grid.appendChild(item);
                });
                apply();
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (sort) {
                sort.addEventListener("change", reorder);
            }
            reorder();
        });
    }

    window.initPlayer = function (videoId, maskId, source) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        if (!video || !mask || !source) {
            return;
        }
        var hls = null;
        var ready = false;
        var waitingForPlayback = false;

        function startPlayback() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function attachSource(shouldPlay) {
            waitingForPlayback = shouldPlay;
            if (ready) {
                if (waitingForPlayback) {
                    startPlayback();
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    if (waitingForPlayback) {
                        startPlayback();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                ready = true;
                video.load();
                if (waitingForPlayback) {
                    startPlayback();
                }
            }
        }

        function playVideo() {
            mask.classList.add("is-hidden");
            attachSource(true);
        }

        mask.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            mask.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            mask.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        toggleMobileMenu();
        initHero();
        initFilters();
    });
})();
