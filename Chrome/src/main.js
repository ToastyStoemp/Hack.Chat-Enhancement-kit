var isAdmin = false;
var knownAdmins = ["ToastyStoemp", "M4GNV5", "Shrooms", "vortico", "bacon"];

var messageSound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/messageSound.wav');
var notifySound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/notificationSound.wav');
var friendSound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/friendSound.wav');
var modSound = new Audio('https://dl.dropboxusercontent.com/u/54596938/Hack.Chat%20Enhancement%20kit/modSound.wav');
var canCallMod = true;

var links = [];
var imageData = Array();

checkAdmin();

function checkAdmin() {
  if (typeof myNick != 'undefined') {
    var nick = myNick.split("#")[0];
    for (var i = 0; i < knownAdmins.length; i++)
      if (knownAdmins[i] == nick)
        isAdmin = true;
  }
}

var messageStyle_S = (localStorageGet('messageStyle_S') == "true");
var notifyMe_S = (localStorageGet('notifyMe_S') == "true");
var sound_S = (localStorageGet('sound_S') == "true");
var preLoad_S = (localStorageGet('preLoad_S') == "true");
var alarmMe_S = (localStorageGet('alarmMe_S') == "true");
var friends = localStorageGet('friends_S');
if (friends == "" || typeof friends == 'undefined')
  friends = [];
else
  friends = friends.split(' ');

window.onbeforeunload = function() {
  localStorageSet('messageStyle_S', messageCheckBox.checked)
  localStorageSet('notifyMe_S', NotCheckbox.checked);
  localStorageSet('sound_S', SoundCheckbox.checked);
  if (AlarmCheckbox)
    localStorageSet('alarmMe_S', AlarmCheckbox.checked);
  localStorageSet('friends_S', friends.join(' '));
}

var sidebar = document.getElementById("sidebar-content");
var contentCounter = 4;

var para = document.createElement("p");
var messageCheckBox = document.createElement("INPUT");
messageCheckBox.type = "checkbox";
messageCheckBox.checked = messageStyle_S;
var text = document.createTextNode("Message Styling");
para.appendChild(messageCheckBox);
para.appendChild(text);
sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);

para = document.createElement("p");
var NotCheckbox = document.createElement("INPUT");
NotCheckbox.type = "checkbox";
NotCheckbox.checked = notifyMe_S;
var text = document.createTextNode("Notify me");
para.appendChild(NotCheckbox);
para.appendChild(text);
sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);

para = document.createElement("p");
var SoundCheckbox = document.createElement("INPUT");
SoundCheckbox.type = "checkbox";
SoundCheckbox.checked = sound_S;
text = document.createTextNode("Sound");
para.appendChild(SoundCheckbox);
para.appendChild(text);
sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);

para = document.createElement("p");
var PreLoadCheckBox = document.createElement("INPUT");
PreLoadCheckBox.type = "checkbox";
PreLoadCheckBox.checked = sound_S;
text = document.createTextNode("Preload Content");
para.appendChild(PreLoadCheckBox);
para.appendChild(text);
sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);

var AlarmCheckbox;
if (isAdmin) {
  para = document.createElement("p");
  AlarmCheckbox = document.createElement("INPUT");
  AlarmCheckbox.type = "checkbox";
  AlarmCheckbox.checked = alarmMe_S;
  text = document.createTextNode("Alarm me");
  para.appendChild(AlarmCheckbox);
  para.appendChild(text);
  sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);
}

if (isAdmin) {
  para = document.createElement("p");
  btn = document.createElement("BUTTON");
  btn.appendChild(document.createTextNode("Ban User"));
  btn.onclick = function() {
    send({
      cmd: 'ban',
      nick: prompt("Enter nick:")
    })
  };
  para.appendChild(btn);
  sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);
} else {
  para = document.createElement("p");
  btn = document.createElement("BUTTON");
  btn.appendChild(document.createTextNode("Call Mod"));
  btn.onclick = function() {
    send({
      cmd: 'chat',
      nick: myNick,
      text: '.callMod ' + prompt("WARNING, this function allerts a moderator, do not use this feature without a valid reason!\nEnter name of suspect") + ' ' + prompt("Enter reason")
    });
    btn.disabled = true;
    setTimeout(function() {
      btn.disabled = false;
    }, 30000);
  };
  para.appendChild(btn);
  sidebar.appendChild(para);
  sidebar.insertBefore(para, sidebar.childNodes[contentCounter++]);
}

function userAdd(nick) {
  if (friends.indexOf(nick) != -1)
    if (SoundCheckbox.checked)
      friendSound.play();
  var user = document.createElement('a')
  if (nick != myNick.split('#')[0]) {
    user.textContent = nick + ' ▾';
    var menu = document.createElement('ul');
    var friendUser = document.createElement('a');
    if (friends.indexOf(nick) == -1)
      friendUser.textContent = "Add Friend";
    else
      friendUser.textContent = "Remove Friend";
    friendUser.onclick = function(e) {
      if (friendUser.textContent == "Add Friend") {
        friendUser.textContent = "Remove Friend";
        friends.push(nick);
        pushMessage({
          nick: '*',
          text: "User " + nick + " has been added to your friends list."
        });
      } else {
        friendUser.textContent = "Add Friend";
        friends.splice(friends.indexOf(nick), 1);
        pushMessage({
          nick: '*',
          text: "User " + nick + " has been removed to your friends list."
        });
      }
    }
    var menuLi = document.createElement('li');
    menuLi.appendChild(friendUser);
    menuLi.classList.add('menuList');
    menu.appendChild(menuLi);

    var inviteUser = document.createElement('a');
    inviteUser.textContent = "Invite";
    inviteUser.onclick = function(e) {
      userInvite(nick);
    };
    menuLi = document.createElement('li')
    menuLi.appendChild(inviteUser)
    menuLi.classList.add('menuList');
    menu.appendChild(menuLi);

    var ignoreUser = document.createElement('a');
    ignoreUser.textContent = "Ignore";
    ignoreUser.onclick = function(e) {
      userIgnore(nick);
      pushMessage({
        nick: '*',
        text: "User " + nick + " has been added to your ignore list."
      });
    }
    menuLi = document.createElement('li')
    menuLi.appendChild(ignoreUser)
    menuLi.classList.add('menuList');
    menu.appendChild(menuLi);

    menu.classList.add('dropdown');
    user.appendChild(menu);
  }
  else
    user.textContent = nick;
  user.classList.add('userList');
  var userLi = document.createElement('li')
  userLi.appendChild(user)
  $('#users').appendChild(userLi)
  onlineUsers.push(nick);
}

function userRemove(nick) {
  var users = $('#users')
  var children = users.children
  for (var i = 0; i < children.length; i++) {
    var user = children[i]
    if (user.textContent.substr(0, user.textContent.indexOf(' ')) == nick) {
      users.removeChild(user)
    }
  }
  var index = onlineUsers.indexOf(nick)
  if (index >= 0) {
    onlineUsers.splice(index, 1)
  }
}

window.onfocus = function() {
  for (var i = 0; i < notifications.length; i++) {
    notifications[i].close();
  }
  notifications = [];
  unread = 0;
  updateTitle();
  $('#chatinput').focus();
}

var notifications = [];

function notifyMe(title, text, channel) {
  if (!Notification)
    alert('Desktop notifications not available in your browser. Try Chrome.');
  else if (Notification.permission !== "granted")
    Notification.requestPermission();
  else
    _notifiyMe(title, text, channel);
}

function _notifiyMe(title, text, channel) {
  if (typeof text != 'undefined') {
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
}

var timer = window.setInterval(checkNick, 500);
var lastMessageSender= "";
var dark = false;
function checkNick() {
  if (myNick) {
    window.clearInterval(timer);
    notifyMe();

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
      if (isAdmin) {
        if (args.text.indexOf('.callMod') != -1) {
          if (canCallMod) {
            send({
              cmd: 'chat',
              nick: myNick,
              text: '@' + args.nick + ' I have been alarmed'
            });
            _callMod(args)
          }
        }
      }

      // Nickname
      if (lastMessageSender != args.nick) {
        dark = !dark;

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
      }

      // Text
      links = [];
      var textEl = document.createElement('pre')
      textEl.classList.add('text')

      textEl.textContent = args.text || ''
      textEl.innerHTML = textEl.innerHTML.replace(/(\?|https?:\/\/)\S+?(?=[,.!?:)]?\s|$)/g, parseLinks)

      textEl.innerHTML = textEl.innerHTML.replace(/```(.|\s)*```/g, parseCode)

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

      messageEl.appendChild(textEl);
      //parseCode(textEl, messageEl);

      if (links.length > 0)
        messageEl.appendChild(imigigy());

      // Scroll to bottom
      var atBottom = isAtBottom()
      if (dark && messageCheckBox.checked)
        messageEl.classList.add('dark');
      $('#messages').appendChild(messageEl)
      if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight)
      }

      if (!document.hasFocus() && args.nick != '*')
        unread += 1
      updateTitle()

      lastMessageSender = args.nick;
    }
  }
};

function parseCode(code) {
  var codeEl = document.createElement('code')
  codeEl.innerHTML = code.substr(4, code.length - 8);
  var lineCount = code.split(/\r\n|\r|\n/).length;
  if (lineCount > 15)
    codeEl.classList.add('largeScript');
  else
    codeEl.classList.add('script');
  return codeEl.outerHTML;
}

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
  var p = document.createElement('p');
  if (links.length > 0) {
    var images = [];
    var videos = [];
    var YoutubeVids = [];
    var imageTypes = ["jpg", "gif", "png"];
    var videoTypes = ["ogg", "webm", "mp4"];
    for (var i = 0; i < links.length; i++) {
      if (imageTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1 || videoTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1 || typeof parse_yturl(links[i]) != 'undefined') {
        var el = document.createElement('p');
        el.innerHTML = '[+]';
        el.style.border = 'none';
        el.style.background = 'none';
        if (PreLoadCheckBox.checked) {
          createContent(images, videos, YoutubeVids);
          el.onclick = function() {
            showImages();
          };
        }
        else {
          el.onclick = function() {
            createContent(images, videos, YoutubeVids);
            showImages();
          };
        }
        el.addEventListener("mouseover", function() {
          el.style.cursor = "pointer";
        });
        p.appendChild(el);
        break;
      }
    }
  }

    function showImages() {
      for (var i = 0; i < images.length; i++) {
        if (images[i].style.display == "none")
          images[i].style.display = "inline";
        else
          images[i].style.display = "none";
      }
      for (var i = 0; i < videos.length; i++) {
        if (videos[i].style.display == "none") {
          videos[i].style.display = "inline";
          videos[i].play();
        } else {
          videos[i].style.display = "none";
          videos[i].pause();
        }
      }
      for (var i = 0; i < YoutubeVids.length; i++) {
        if (YoutubeVids[i].style.display == "none") {
          YoutubeVids[i].style.display = "inline";
          //YoutubeVids[i].playVideo();
        } else {
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
  }
  return p;
};

function parse_yturl(url) {
  var video_id = url.split('v=')[1];
  if (typeof video_id != 'undefined') {
    var ampersandPosition = video_id.indexOf('&');
    if (ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
  }
  return
}

function createContent(images, videos, YoutubeVids){
  for (var i = 0; i < links.length; i++) {
    if (imageTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1)
      p.appendChild(createImageElement(links[i], images));
    else if (videoTypes.indexOf(links[i].substr(links[i].lastIndexOf('.') + 1)) != -1)
      p.appendChild(createvideoElement(links[i], videos));
    else if (typeof parse_yturl(links[i]) != 'undefined')
      p.appendChild(createYouTubeElement(parse_yturl(links[i]), YoutubeVids));
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
  video.loop = true;
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

function _callMod(args) {
  var begin = args.text.indexOf(' ') + 1;
  var end = args.text.indexOf(' ', begin);
  var suspectlength = end - begin;
  var suspect = args.text.substr(begin, suspectlength);
  var sender = args.nick;
  var reason = args.text.substr(end, args.text.length - end);
  console.log(JSON.stringify(args));
  if (canCallMod && AlarmCheckbox.checked) {
    canCallMod = false;
    modSound.play();
    var not = new Notification(sender + ' requested a moderator', {
      body: suspect + " is under suspicion of " + reason,
      icon: 'http://i.imgur.com/44B3G6a.png'
    });
    not.onclick = function() {
      window.focus()
    };
    setTimeout(function() {
      canCallMod = true;
    }, 30000);
    setTimeout(function() {
      not.close();
      notifications.splice(notifications.indexOf(not), 1);
    }, 8000);
    notifications.push(not);
  }
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
