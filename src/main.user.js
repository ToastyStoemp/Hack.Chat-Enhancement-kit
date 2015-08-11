var messageSound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/messageSound.wav');
var notifySound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/notificationSound.wav');

var links = [];
var imageData = Array();

var sidebar = document.getElementById("sidebar-content");

var para = document.createElement("p");
var NotCheckbox = document.createElement("INPUT");
NotCheckbox.type = "checkbox";
NotCheckbox.checked = true;
var text = document.createTextNode("Notify me");
para.appendChild(NotCheckbox);
para.appendChild(text);
sidebar.appendChild(para);
sidebar.insertBefore(para, sidebar.childNodes[4]);

para = document.createElement("p");
var SoundCheckbox = document.createElement("INPUT");
SoundCheckbox.type = "checkbox";
SoundCheckbox.checked = true;
text = document.createTextNode("Sound");
para.appendChild(SoundCheckbox);
para.appendChild(text);
sidebar.appendChild(para);
sidebar.insertBefore(para, sidebar.childNodes[5]);

para = document.createElement("p");
var btn = document.createElement("BUTTON");
btn.appendChild(document.createTextNode("Ignore User"));
btn.onclick = function() {
  var tempUser = prompt("Enter nick:");
  userIgnore(tempUser);
  pushMessage({
    nick: '*',
    text: "User " + tempUser + " has been added to your ignore list."
  });
};
para.appendChild(btn);
sidebar.appendChild(para);
sidebar.insertBefore(para, sidebar.childNodes[6]);

para = document.createElement("p");
btn = document.createElement("BUTTON");
btn.appendChild(document.createTextNode("Call Mod"));
btn.onclick = function() {
  send({
    cmd: 'chat',
    nick: myNick,
    text: '.callMod ' + prompt("Enter name of suspect") + ' ' + prompt("Enter reason")
  });
  btn.disabled = true;
  setTimeout(function() {
    btn.disabled = false;
  }, 30000);
};
para.appendChild(btn);
sidebar.appendChild(para);
sidebar.insertBefore(para, sidebar.childNodes[7]);

var notifications = [];

window.onfocus = function() {
  for (var i = 0; i < notifications.length; i++) {
    notifications[i].close();
  }
  notifications = [];
  window.unread = 0;
  window.updateTitle();
  $('#chatinput').focus();
}

function notifyMe(title, text, channel) {
  if (!Notification)
    alert('Desktop notifications not available in your browser. Try Chrome.');
  else if (Notification.permission !== "granted")
    Notification.requestPermission();
  else
    _notifiyMe(title, text, channel);
}

function _notifiyMe(title, text, channel) {
  if (SoundCheckbox.checked)
    notifySound.play();
  var Channel = channel;
  var not = new Notification(title, {
    body: text,
    icon: 'http://i.imgur.com/44B3G6a.png'
  });

  not.onclick = function() {
    if (Channel) {
      window.open('https://hack.chat/?' + Channel, '_blank');
    } else
      window.focus()
  };
  setTimeout(function() {
    not.close();
    notifications.splice(notifications.indexOf(not), 1);
  }, 8000);
  notifications.push(not);
}

pushMessage = function(args) {
  // Message container
  var messageEl = document.createElement('div')
  messageEl.classList.add('message')
  if (args.admin) {
    messageEl.classList.add('admin')
  } else if (args.nick == myNick) {
    messageEl.classList.add('me')
  } else if (args.nick == '!') {
    messageEl.classList.add('warn')
  } else if (args.nick == '*') {
    messageEl.classList.add('info')
    if (args.text.indexOf("invited you to ?") != -1) {
      var nick = args.text.substr(0, args.text.indexOf(' '));
      var channel = args.text.substr(args.text.indexOf('?') + 1, 8);
      notifyMe(nick + " invited you", "Click here to accept.", channel);
    }
  }
  if (args.text.indexOf("@" + myNick.split("#")[0] + " ") != -1) {
    messageEl.classList.add('mention');
    if (NotCheckbox.checked && !document.hasFocus())
      notifyMe(args.nick + " mentioned you", args.text, false);
  }

  // Nickname
  var nickSpanEl = document.createElement('span')
  nickSpanEl.classList.add('nick')
  messageEl.appendChild(nickSpanEl)

  if (args.trip) {
    var tripEl = document.createElement('span')
    tripEl.textContent = args.trip + " "
    tripEl.classList.add('trip')
    nickSpanEl.appendChild(tripEl)
  }

  if (args.nick) {
    var nickLinkEl = document.createElement('a')
    nickLinkEl.textContent = args.nick
    nickLinkEl.onclick = function() {
      insertAtCursor("@" + args.nick + " ")
      $('#chatinput').focus()
    }
    var date = new Date(args.time || Date.now())
    nickLinkEl.title = date.toLocaleString()
    nickSpanEl.appendChild(nickLinkEl)
  }

  // Text
  links = [];
  var textEl = document.createElement('pre')
  textEl.classList.add('text')

  textEl.textContent = args.text || ''
  textEl.innerHTML = textEl.innerHTML.replace(/(\?|https?:\/\/)\S+?(?=[,.!?:)]?\s|$)/g, parseLinks)

  if ($('#parse-latex').checked) {
    // Temporary hotfix for \rule spamming, see https://github.com/Khan/KaTeX/issues/109
    textEl.innerHTML = textEl.innerHTML.replace(/\\rule|\\\\\s*\[.*?\]/g, '')
    try {
      renderMathInElement(textEl, {
        delimiters: [{
          left: "$$",
          right: "$$",
          display: true
        }, {
          left: "$",
          right: "$",
          display: false
        }, ]
      })
    } catch (e) {
      console.warn(e)
    }
  }

  messageEl.appendChild(textEl)

  if (links.length > 0)
    messageEl.appendChild(imigigy);


  // Scroll to bottom
  var atBottom = isAtBottom()
  $('#messages').appendChild(messageEl)
  if (atBottom) {
    window.scrollTo(0, document.body.scrollHeight)
  }
};

function parseLinks(g0) {
  var a = document.createElement('a')
  a.innerHTML = g0
  var url = a.textContent
  if (url[0] == '?') {
    url = "/" + url
  }
  a.href = url
  a.target = '_blank'
  links.push(g0);
  return a.outerHTML;
};

function imigigy() {
  if (links.length > 0) {
    var images = [];
    var videos = [];
    var YoutubeVids = [];
    var imageTypes = ["jpg", "gif", "png"];
    var videoTypes = ["ogg", "webm", "mp4"];
    var p = document.createElement('p');
    for (var i = 0; i < links.length; i++) {
      if (imageTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1 || videoTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1 || typeof parse_yturl(links[i]) != 'undefined') {
        var el = document.createElement('p');
        el.innerHTML = '[+]';
        el.style.border = 'none';
        el.style.background = 'none';
        el.onclick = function() {
          showImages();
        };
        el.addEventListener("mouseover", function() {
          el.style.cursor = "pointer";
        });
        p.appendChild(el);
        break;
      }
    }

    for (var i = 0; i < links.length; i++) {
      if (imageTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1)
        p.appendChild(createImageElement(links[i], images));
      else if (videoTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1)
        p.appendChild(createvideoElement(links[i], videos));
      else if (typeof parse_yturl(links[i]) != 'undefined')
        p.appendChild(createYouTubeElement(parse_yturl(links[i]), YoutubeVids));
    }

    function showImages() {
      for (var i = 0; i < images.length; i++) {
        if (images[i].style.display == "none")
          images[i].style.display = "inline";
        else
          images[i].style.display = "none";
      }
      for (var i = 0; i < videos.length; i++) {
        if (videos[i].style.display == "none"){
          videos[i].style.display = "inline";
          videos[i].play();
        }
        else {
          videos[i].style.display = "none";
          videos[i].pause();
        }
      }
      for (var i = 0; i < YoutubeVids.length; i++) {
        if (YoutubeVids[i].style.display == "none"){
          YoutubeVids[i].style.display = "inline";
          //YoutubeVids[i].playVideo();
        }
        else {
          YoutubeVids[i].style.display = "none";
          //YoutubeVids[i].stopVideo();
        }
      }
      if (el.innerHTML == '[+]')
        el.innerHTML = '[-]';
      else
        el.innerHTML = '[+]';

      var atBottom = isAtBottom()
      if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
    return p;
  }
  return;
};

function parse_yturl(url) {
  var video_id = url.split('v=')[1];
  var ampersandPosition = video_id.indexOf('&');
  if (ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  return video_id;
}

function createImageElement(link, images) {
  var image = document.createElement('img')
  image.setAttribute('src', link);
  image.style.display = "none";
  image.style.maxWidth = "50%";
  image.style.maxHeight = "50%";
  imageData[image] = {};
  imageData[image].resized = false;
  makeImageZoomable(image);
  images.push(image);
  return image;
}

function createvideoElement(link, videos) {
  var video = document.createElement('video')
  video.setAttribute('src', link);
  video.style.display = "none";
  video.style.width = "100%";
  video.style.height = "100%";
  video.play();
  videos.push(video);
  return video;
}

function createYouTubeElement(link, YoutubeVids) {
  var iframe = document.createElement('iframe')
  console.log(link)
  iframe.setAttribute('src', "https://www.youtube.com/embed/" + link + "?version=3&enablejsapi=1");
  iframe.setAttribute('width', "640");
  iframe.setAttribute('height', "385");
  iframe.setAttribute('frameborder', "0");
  iframe.setAttribute('allowFullScreen', '');
  iframe.style.display = "none";
  YoutubeVids.push(iframe);
  return iframe;
}

function getDragSize(e) {
  return (p = Math.pow)(p(e.clientX - (rc = e.target.getBoundingClientRect()).left, 2) + p(e.clientY - rc.top, 2), .5);
}

function getHeight() {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function makeImageZoomable(imgTag) {
  dragTargetData = {};

  imgTag.addEventListener('mousedown', function(e) {
    if (e.ctrlKey != 0)
      return true;
    if (e.metaKey != null) // Can be on some platforms
      if (e.metaKey != 0)
        return true;
    if (e.button == 0) {
      if (imageData[e.target].position == null) {
        imageData[e.target].zIndex = e.target.style.zIndex;
        imageData[e.target].width = e.target.style.width;
        imageData[e.target].height = e.target.style.height;
        imageData[e.target].position = e.target.style.position;
      }
      dragTargetData.iw = e.target.width;
      dragTargetData.d = getDragSize(e);
      dragTargetData.dr = false;
      e.preventDefault();
    }
  }, true);

  imgTag.addEventListener('contextmenu', function(e) {
    if (imageData[e.target].resized) {
      imageData[e.target].resized = false;
      e.target.style.zIndex = imageData[e.target].zIndex;
      e.target.style.maxWidth = e.target.style.width = imageData[e.target].width;
      e.target.style.maxHeight = e.target.style.height = imageData[e.target].height;
      e.target.style.position = imageData[e.target].position;
      e.preventDefault();
      e.returnValue = false;
      e.stopPropagation();
      return false;
    }
  }, true);
  imgTag.addEventListener('dblclick', function(e) {
    if (e.ctrlKey != 0)
      return true;
    if (e.metaKey != null) // Can be on some platforms
      if (e.metaKey != 0)
        return true;

    if (imageData[e.target].resized) {
      e.target.style.maxWidth = e.target.style.width = imageData[e.target].width;
    }
    e.target.style.position = "fixed";
    e.target.style.zIndex = 1000;
    e.target.style.top = 0;
    e.target.style.left = 0;
    e.target.style.maxWidth = e.target.style.width = "auto";
    e.target.style.maxHeight = e.target.style.height = getHeight() + "px";
    imageData[e.target].resized = true;

    e.preventDefault();
    e.returnValue = false;
    e.stopPropagation();
    return false;
  }, true);
  imgTag.addEventListener('mousemove', function(e) {
    if (dragTargetData.d) {
      e.target.style.maxWidth = e.target.style.width = ((getDragSize(e)) * dragTargetData.iw / dragTargetData.d) + "px";
      e.target.style.maxHeight = '';
      e.target.style.height = 'auto';
      e.target.style.zIndex = 1000; // Make sure the image is on top.

      if (e.target.style.position == '') {
        e.target.style.position = 'relative';
      }
      dragTargetData.dr = true;
      imageData[e.target].resized = true;
    }
  }, false);

  imgTag.addEventListener('mouseout', function(e) {
    dragTargetData.d = false;
    if (dragTargetData.dr) return false;
  }, false);

  imgTag.addEventListener('mouseup', function(e) {
    dragTargetData.d = false;
    if (dragTargetData.dr) return false;
  }, true);

  imgTag.addEventListener('click', function(e) {
    if (e.ctrlKey != 0)
      return true;
    if (e.metaKey != null) // Can be on some platforms
      if (e.metaKey != 0)
        return true;
    dragTargetData.d = false;
    if (dragTargetData.dr) {
      e.preventDefault();
      return false;
    }
    if (imageData[e.target].resized) {
      e.preventDefault();
      e.returnValue = false;
      e.stopPropagation();
      return false;
    }
  }, false);
}

document.addEventListener('dragstart', function() {
  return false
}, false);

// $\color{orange}{\large{Hack.Chat \space extension}} \space \color{lightblue}{0.0.5}$
// $made \space by \space \color{cyan}{ToastyStoemp}$
//
// $\color{OrangeRed}{Chrome}$
// download here: https://db.tt/8ErFlCcq
// just drag and drop in: chrome://extensions/
// GitHub: http://bit.ly/1ISXn6b
// Instructions: http://i.imgur.com/814NJYR.gifv
//
// $\color{OrangeRed}{FireFox}$
// download here: https://db.tt/oqqg0oTg
// GitHub: Coming soon.
// A big Thanks to $\color{SpringGreen}{raf924}$ for help on the firefox version!
//
// Fixed:
//   - Sounds are now loaded properly
//
// Added:
//   - Highlight of text with your username
//   - In chat image load + resize supports jpg, gif, png
//   - In chat video supports mp4, ogg, webm
//   - list ignored users
//   - remove ignored users
//
// More features to come!
