function injectScript(file) {
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    document.body.appendChild(s);
}

injectScript(chrome.extension.getURL('./src/main.user.js'));
