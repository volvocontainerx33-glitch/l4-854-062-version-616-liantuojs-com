(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle("is-active", currentIndex === activeIndex);
            });

            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle("is-active", currentIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                setSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide(activeIndex + 1);
            }, 5000);
        }

        var filterInput = document.querySelector("[data-movie-filter]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get("q");

        if (filterInput && query) {
            filterInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matchesSelect(card, name, value) {
            if (!value || value.indexOf("全部") === 0) {
                return true;
            }

            var current = normalize(card.getAttribute("data-" + name));
            return current.indexOf(normalize(value)) !== -1;
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var term = normalize(filterInput ? filterInput.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var match = !term || text.indexOf(term) !== -1;

                selects.forEach(function (select) {
                    match = match && matchesSelect(card, select.getAttribute("data-filter-select"), select.value);
                });

                card.style.display = match ? "" : "none";

                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    });
})();
