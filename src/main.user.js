var messageSound = new Audio('https://www.freesound.org/people/bubaproducer/sounds/107156/download/107156__bubaproducer__button-9-funny.wav');
var notifySound = new Audio('https://www.freesound.org/people/JustinBW/sounds/80921/download/80921__justinbw__buttonchime02up.wav');

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
  send({cmd: 'chat', nick: myNick, text: '.callMod ' + prompt("Enter name of suspect") + ' ' + prompt("Enter reason")});
  btn.disabled = true;
  setTimeout(function(){ btn.disabled = false; }, 30000);
};
para.appendChild(btn);
sidebar.appendChild(para);
sidebar.insertBefore(para, sidebar.childNodes[7]);

if (pushMessageOrig)
  pushMessage = pushMessageOrig;

var pushMessageOrig = pushMessage;
var yourNick = myNick.split("#")[0];
pushMessage = function(args) {
  pushMessageOrig(args);
  var msg = args.text;
  if (msg.indexOf("invited you to ?") != -1) {
    var nick = msg.substr(0, msg.indexOf(' '));
    var channel = msg.substr(msg.indexOf('?') + 1, 8);
    notifyMe(nick + " invited you", "Click here to accept.", false, channel);
  }
  if (args.nick != "*") {
    if (msg.indexOf('.callMod') != -1) {
      if (canCallMod) {
        send({
          cmd: 'chat',
          nick: myNick,
          text: '@' + args.nick + ' I have been alarmed'
        });
        var begin = msg.indexOf(' ') + 1;
        var end = msg.indexOf(' ', begin);
        var suspectlength = end - begin;
        var suspect = msg.substr(begin, suspectlength);
        _callMod(args.nick, suspect, msg.substr(end, msg.length - end));
      }
    }
    if (msg.indexOf(yourNick) != -1 && !document.hasFocus()) {
      if (NotCheckbox.checked)
        notifyMe(args.nick + " mentioned you", args.text, false);
    } else
    if (SoundCheckbox.checked)
      messageSound.play();
  }
  if (document.hasFocus()) {
    window.unread = 0;
    window.updateTitle();
  }
}

var notifications = [];

window.onfocus = function() {
  for (var i = 0; i < notifications.length; i++) {
    notifications[i].close();
  }
  notifications = [];
  window.unread = 0;
  window.updateTitle();
}

function notifyMe(title, text, sound, channel) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chrome.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else
    _notifiyMe(title, text, sound, channel);
}

function _notifiyMe(title, text, sound, channel) {
  if (SoundCheckbox.checked)
    notifySound.play();
  var Channel = channel;
  var not = new Notification(title, {
    body: text,
    icon: 'http://i.imgur.com/44B3G6a.png'
  });


  not.onclick = function() {
    if (Channel) {
      console.log(Channel);
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


// $\color{orange}{\large{Hack.Chat \space chrome \space extension}} \space \color{lightblue}{0.0.3}$
// $made \space by \space \color{cyan}{ToastyStoemp}$
// download here: https://db.tt/8ErFlCcq
// just drag and drop in: chrome://extensions/
//
// A quick reminder that there is a chrome extension for hack.chat;
// This extension adds notification upon your name being mentioned (@nick),
// and adds the user ignore GUI button in the sidebar :)
//
// More to come!
