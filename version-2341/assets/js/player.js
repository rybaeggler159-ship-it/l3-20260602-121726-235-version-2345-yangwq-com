function setupPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var initialized = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function loadStream() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playMovie() {
        loadStream();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playMovie);
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });

    video.addEventListener("click", function () {
        if (!initialized) {
            playMovie();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
