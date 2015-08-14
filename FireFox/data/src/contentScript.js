var jsUrl = self.options.scriptUrl;
var head = document.getElementsByTagName("head")[0];
var script = document.createElement("script");
script.type = "text/javascript";
script.src = jsUrl;
head.appendChild(script);

var s = document.createElement('link');
var cssUrl = self.options.cssUrl;
s.setAttribute('id', 'scheme-link');
s.setAttribute('rel', 'stylesheet');
s.setAttribute('href', cssUrl);
head.appendChild(s);
