function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var trigger = document.querySelector("[data-play-trigger]");
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        ready = true;
    }

    function playVideo() {
        attachSource();
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (!ready) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
