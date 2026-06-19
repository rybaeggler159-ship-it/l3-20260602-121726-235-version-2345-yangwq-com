import { H as Hls } from './hls-dru42stk.js';

function attachPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-play-button]');
  const message = shell.querySelector('[data-player-message]');
  const source = shell.getAttribute('data-video-src');
  let initialized = false;
  let hls = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initialize() {
    if (initialized || !video || !source) {
      return;
    }

    initialized = true;
    setMessage('正在加载播放源...');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放源已就绪');
        video.play().catch(function () {
          setMessage('请再次点击播放按钮开始播放');
        });
      });
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage('网络加载异常，正在重试...');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage('媒体解析异常，正在恢复...');
          hls.recoverMediaError();
        } else {
          setMessage('播放源暂时无法加载，请刷新页面重试');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setMessage('播放源已就绪');
        video.play().catch(function () {
          setMessage('请再次点击播放按钮开始播放');
        });
      }, { once: true });
    } else {
      setMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器');
    }
  }

  function play() {
    initialize();
    shell.classList.add('is-playing');
    if (video) {
      video.play().catch(function () {
        setMessage('请再次点击播放按钮开始播放');
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        shell.classList.remove('is-playing');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('.js-player').forEach(attachPlayer);
