var stompClient = null;
var mymap = null;
var sellers = {};
var name = null;
var message = null;
var marker = null;

function initBuy() {
    $("#btn_buy").hide();
    $("#btn_sell").hide();
    $("#mapid").show();
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
    $("#mapid").show();
    initMap();
    connectToSell();
}

function initMap() {
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
        setTimeout(sendData, 1000);
    });
}

function showPosition(position) {
    stompClient.send("/app/sellerLocation", {}, JSON.stringify({"lat":position.coords.latitude, "lon":position.coords.longitude, "name":name, "message":message}));
    if (marker) {
        mymap.removeLayer(marker);
    }
    marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap)
    setTimeout(sendData, 1000);
}

function sendData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showSeller(seller) {
    if (sellers[seller.id]) {
        mymap.removeLayer(sellers[seller.id]);
    }
    sellers[seller.id] =  L.marker([seller.lat, seller.lon]).addTo(mymap).bindPopup("<h3>" + seller.name + "</h3><br><p>" + seller.message + "</p>");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#seller_info").hide();
    $("#mapid").hide()
    $( "#btn_sell" ).click(goToSellerInfo);
    $( "#btn_buy" ).click(initBuy);
    $("#btn_seller_info").click(initSell)
});

