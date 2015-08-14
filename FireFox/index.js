'use strict';

var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var URL = require("sdk/url").URL;
var notifications = require("sdk/notifications");
var pageMod = require("sdk/page-mod");
var {
    setInterval, clearInterval
} = require("sdk/timers");

var jsData = self.data.url("./src/main.js");
var cssData = self.data.url("./style/custom.css");

var button = buttons.ActionButton({
  id: "hackChat-link",
  label: "Go ?programming",
  icon: {
    "16": "./icon/icon-16.png",
    "32": "./icon/icon-32.png",
    "64": "./icon/icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("https://hack.chat/?programming");
}

function resetBadge(tab) {
    tab.badge = tab.channel.match(/.{1,4}/g);
    tab.badge.push(tab.unread);
}


pageMod.PageMod({
  include: "https://hack.chat/?*",
  contentScriptWhen: 'ready',
  contentScriptFile: self.data.url("./src/contentScript.js"),
  contentScriptOptions: {
        scriptUrl: jsData,
        cssUrl: cssData
    }
});
