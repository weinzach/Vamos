var socket = io();

function setlocation(){
  //socket.emit('setCity', geoplugin_city()+ ", " + geoplugin_region());
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (event) {
  if (xhr.readyState === 4 /** responseText is not available yet */) {
    var statusCode = xhr.status
    var responseText = xhr.responseText
    var data = str = jQuery.parseJSON(responseText);
    window.location = data.redirectUrl;
  }
}
  xhr.open("POST", "/locator", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    city: geoplugin_city(),
    region: geoplugin_region()
  }));
}
