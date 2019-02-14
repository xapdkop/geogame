'use strict';

window.onload = () => {
	pjs();

	$('#panorama').hide();
	$('#map').show();
	$('#startGame').on('click', startGame);
	$('#switch').on('click', toggleMap);
	$('#answer').on('click', checkAnswer);
	$('#newGame').on('click', newGame);
};

var street_view;
var map;
var panorama;
var user_marker = null;
var right_marker = null;
var path_line = null;
var isMap = false;
var storage;
var listener;

function initMap() {
	street_view = new google.maps.StreetViewService();

	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 0,
			lng: 0
		},
		zoom: 2,
		fullscreenControl: false,
		streetViewControl: false,
		zoomControl: false,
		mapTypeControl: false,
		draggableCursor: 'crosshair'
	});

	panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), {
		position: {
			lat: 0,
			lng: 0
		},
		pov: {
			heading: 165,
			pitch: 0
		},
		addressControl: false,
		linksControl: true,
		showRoadLabels: false,
		fullscreenControl: false,
	});

	listener = google.maps.event.addListener(map, 'click', function (event) {
		makeAnswer(event.latLng, map);
	});
}

function mapOnClick(event) {
	makeAnswer(event.latLng, map);
}

function startGame() {
	$('#ui').hide();
	$('#logo').hide();
	$('#description').hide();
	$('#start-button').hide();
	$('#particles').hide();

	$('#panorama').show();
	$('#switch').show();
	$('#map').hide();

	map.zoomControl = true;

	generatePoint();
}

function generatePoint() {
	storage = new google.maps.LatLng(randomBetween(-90, 90), randomBetween(-180, 180));
	street_view.getPanoramaByLocation(storage, 5000000, function (data, status) {
		if (status == google.maps.StreetViewStatus.OK) {
			//console.log(data.location);
			storage = data.location.latLng;
			panorama.setPano(data.location.pano);
			panorama.setPov({
				heading: 270,
				pitch: 0
			});
			panorama.setVisible(true);
		}
		else {
			//console.log('Trying again...');
			generatePoint();
		}
	});
}

function makeAnswer(location, map) {
	if (!user_marker) {
		user_marker = new google.maps.Marker({
			position: location,
			title: 'Your answer',
			map: map,
			icon: {
				url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
			}
		});
	}
	else {
		user_marker.setPosition(location);
	}
}

function checkAnswer() {
	if (!user_marker)
		return;

	map.setOptions({ draggableCursor: 'default' });

	$('#answer').hide();

	$('#endGame').show();
	$('#newGame').show();

	listener.remove();
	var markerPosition = user_marker.getPosition();

	//console.log(markerPosition.lat(), markerPosition.lng());
	//console.log(storage.lat(), storage.lng());
	//console.log(google.maps.geometry.spherical.computeDistanceBetween(markerPosition, storage) / 1000 + 'km');

	var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(markerPosition, storage) / 1000);
	var message = null

	if (distance < 1000)
		message = "Do you use cheats? 🤨";
	else if (distance < 2500)
		message = "Good, you're almost right! 😉";
	else if (distance < 5500)
		message = "Not bad! 🙂"
	else if (distance < 12000)
		message = "You could do better! 😜"
	else
		message = "Better luck next time! 🙃"

	$('#endGame').html('<b>' + message + '</b><br>' + "Your answer is " + distance + " km from the real position");

	right_marker = new google.maps.Marker({
		position: storage,
		title: 'Hidden place',
		map: map,
		icon: {
			url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
		}
	});

	path_line = new google.maps.Polyline({
		path: [
			right_marker.getPosition(), user_marker.getPosition()
		],
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2,
		map: map
	});
}

function newGame() {
	$('#endGame').hide();
	$('#newGame').hide();
	if (path_line) {
		path_line.setMap(null);
		path_line = null;
	}
	if (user_marker) {
		user_marker.setMap(null);
		user_marker = null;
	}
	if (right_marker) {
		right_marker.setMap(null);
		right_marker = null;
	}
	if (isMap)
		toggleMap();
	map.setOptions({ draggableCursor: 'crosshair' });
	map.setCenter({ lat: 0, lng: 0 });
	map.setZoom(2);
	listener = google.maps.event.addListener(map, 'click', function (event) {
		makeAnswer(event.latLng, map);
	});
	startGame();
}

function toggleMap() {
	if (isMap) { // Panorama
		isMap = false;
		$('#map').hide();
		$('#panorama').show();
		$('#switch').text('Map');
		$('#answer').hide();
	}
	else { // Map
		isMap = true;
		$('#panorama').hide();
		$('#map').show();
		$('#switch').text('Panorama');
		if (!right_marker)
			$('#answer').show();
	}
}

function randomBetween(min, max) {
	return Math.random() * (max - min + 1) + min;
}
