var stompClient = null;
var mymap = null;

// for buyer
var sellers = {};
var circles = {};

// for seller
var name = null;
var message = null;
var marker = null;
var circle = null;
var lastCoords = null;
var positionTimeout = 5000;

function initBuy() {
    $("#btn_buy").hide();
    $("#btn_sell").hide();
    initMap();
    connectToBuy();
}

function goToSellerInfo() {
    $("#btn_buy").hide();
    $("#btn_sell").hide();
    $("#seller_info").show();
}

function initSell() {
    name = $("#input_name").val();
    message = $("#input_message").val();
    $("#seller_info").hide();
    initMap();
    connectToSell();
}

function initMap() {
    $("#title").hide();
    $("#mapid").show();
    mymap = L.map('mapid').setView([7.623037, 80.651205], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
}

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

function connectToBuy() {
    var socket = new SockJS('/chuunpaan-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/sellerLocations', function (seller) {
            showSeller(JSON.parse(seller.body));
        });
    });
}

function connectToSell() {
    var socket = new SockJS('/chuunpaan-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        setTimeout(initSendingData, 1000);
    });
}

function updatePosition(position) {
    hideNotification();
    if (position.coords.accuracy > 1000) {
        if (positionTimeout < 600000) {
            console.log("Not enough accuracy. Increasing timeout.");
            positionTimeout = positionTimeout + 5000;
            initSendingData();
        } else {
            showNotification("Failed to get location with enough accuracy.", false);
        }
    } else {
        if (lastCoords) {
            // accuracy is actually error
            if (position.coords.accuracy < lastCoords.accuracy
                || getDistanceFromLatLonInKm(lastCoords.latitude, lastCoords.longitude, position.coords.latitude, position.coords.longitude) > 0.01) {
                sendPosition(position);
            }
        } else {
            sendPosition(position);
        }
        updatePositionOnMap(position);
        setTimeout(initSendingData, 1000);
    }
}

function sendPosition(position) {
    lastCoords = position.coords;
    stompClient.send("/app/sellerLocation",
        {},
        JSON.stringify(
            {
                "lat":position.coords.latitude,
                "lon":position.coords.longitude,
                "acc":position.coords.accuracy,
                "name":name,
                "message":message
            }
        )
    );
    showNotification("Position sent.", true);
}

function updatePositionOnMap(position) {
    if (marker) {
        mymap.removeLayer(marker);
    }
    if (circle) {
        mymap.removeLayer(circle);
    }
    marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap)
    circle = L.circle([position.coords.latitude, position.coords.longitude], position.coords.accuracy).addTo(mymap);
}

function initSendingData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition,
                        locationError,
                        {maximumAge:5000, timeout:positionTimeout, enableHighAccuracy: true});
        showNotification("Waiting for location...", false);
    }
}

function locationError(error) {
    if (error.code == 3 && positionTimeout < 600000) {
        console.log("Location timed out. Increasing timeout.")
        positionTimeout = positionTimeout + 5000;
        initSendingData();
    } else {
        console.log("Problem occurred while getting the location.<br>" + error.message);
        showNotification("Problem occurred while getting the location.<br>" + error.message, false);
    }
}

function showSeller(seller) {
    if (sellers[seller.id]) {
        mymap.removeLayer(sellers[seller.id]);
    }
    if (circles[seller.id]) {
        mymap.removeLayer(circles[seller.id]);
    }
    if (seller.eventType == "UPDATE") {
        sellers[seller.id] =  L.marker([seller.lat, seller.lon]).addTo(mymap).bindPopup("<h3>" + seller.name + "</h3><br><p>" + seller.message + "</p>");
        circles[seller.id] = L.circle([seller.lat, seller.lon], seller.acc).addTo(mymap);
    }
}

// copied from https://stackoverflow.com/a/27943
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// up to here

function showNotification(msg, autoHide) {
    $("#notification").html(msg);
    $("#notification").show();
    if (autoHide) {
        setTimeout(function () {$("#notification").hide();}, 1000);
    }
}

function hideNotification() {
    $("#notification").hide();
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#seller_info").hide();
    $("#mapid").hide()
    $("#notification").hide();
    $( "#btn_sell" ).click(goToSellerInfo);
    $( "#btn_buy" ).click(initBuy);
    $("#btn_seller_info").click(initSell)
});

