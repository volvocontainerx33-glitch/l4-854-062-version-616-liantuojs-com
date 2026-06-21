(function () {
    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(movie.url) + "\">" +
            "<div class=\"card-poster\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />" +
            "<span class=\"score-pill\">★ " + escapeHtml(movie.score) + "</span>" +
            "</div>" +
            "<div class=\"card-content\">" +
            "<span class=\"category-pill\">" + escapeHtml(movie.category) + "</span>" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function render(query) {
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !summary || !window.SEARCH_MOVIES) {
            return;
        }
        if (input) {
            input.value = query;
        }
        var key = query.trim().toLowerCase();
        if (!key) {
            summary.textContent = "输入关键词后显示匹配内容。";
            results.innerHTML = "";
            return;
        }
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            return [
                movie.title,
                movie.category,
                movie.year,
                movie.region,
                movie.type,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase().indexOf(key) !== -1;
        }).slice(0, 120);
        summary.textContent = matched.length ? "找到 " + matched.length + " 个相关结果" : "未找到相关内容";
        results.innerHTML = matched.map(card).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        render(getQuery());
        if (form && input) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                window.history.replaceState(null, "", url);
                render(query);
            });
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    });
})();
