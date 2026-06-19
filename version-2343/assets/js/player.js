(function () {
    function loadVideo(video, source) {
        if (!video || !source) {
            return Promise.resolve();
        }

        if (video.getAttribute('data-ready') === source) {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-ready', source);
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsController) {
                video.hlsController.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsController = hls;
            video.setAttribute('data-ready', source);
            return Promise.resolve();
        }

        video.src = source;
        video.setAttribute('data-ready', source);
        return Promise.resolve();
    }

    document.querySelectorAll('[data-play-button]').forEach(function (button) {
        var targetId = button.getAttribute('data-target');
        var video = document.getElementById(targetId);
        var source = button.getAttribute('data-src') || (video ? video.getAttribute('data-src') : '');

        function startPlayback() {
            loadVideo(video, source).then(function () {
                button.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        if (video) {
            button.addEventListener('click', startPlayback);
            video.addEventListener('click', function () {
                if (!video.getAttribute('data-ready')) {
                    startPlayback();
                }
            });
        }
    });
})();
