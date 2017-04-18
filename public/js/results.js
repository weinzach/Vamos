var socket = io();
var count = 20;
var skip = 0;

// Relocate if City is Blank
if(city==""){
  window.location = "../locate";

}
/*
socket.emit('getResults', 0);

socket.on('getResultsret', function(msg) {
    if (msg.uCount < 20) {
        count = 20;
        $("#loadm").hide();
    } else {
        count = msg.uCount;
        $("#loadm").show();

    }
    getData(skip);
});
*/

function setButtons(){
  document.getElementById("resturant-btn").href = "/app/"+city.toLowerCase()+"/resturants";
  document.getElementById("attractions-btn").href = "/app/"+city.toLowerCase()+"/attractions";
  document.getElementById("hotels-btn").href = "/app/"+city.toLowerCase()+"/hotels";
  document.getElementById("coffee-btn").href = "/app/"+city.toLowerCase()+"/coffee";
  document.getElementById("beauty-btn").href = "/app/"+city.toLowerCase()+"/beauty";
  console.log("Button set!");
}
setButtons();
