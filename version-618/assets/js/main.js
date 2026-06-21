(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startHero();
            });
        });

        if (slides.length > 1) {
            startHero();
        }
    }

    var filterList = document.querySelector("[data-filter-list]");

    if (filterList) {
        var input = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var resetButton = document.querySelector("[data-reset-filters]");
        var emptyState = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilters() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var typeValue = typeSelect ? typeSelect.value : "";
            var yearValue = yearSelect ? yearSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var typeText = card.getAttribute("data-type") || "";
                var yearText = card.getAttribute("data-year") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !typeValue || typeText.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || yearText.indexOf(yearValue) !== -1;
                var shouldShow = matchesQuery && matchesType && matchesYear;

                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilters();
            });
        }

        applyFilters();
    }

    var scrollPlay = document.querySelector("[data-scroll-play]");

    if (scrollPlay) {
        scrollPlay.addEventListener("click", function () {
            window.setTimeout(function () {
                var trigger = document.querySelector("[data-play-trigger]");
                if (trigger) {
                    trigger.click();
                }
            }, 120);
        });
    }
})();
