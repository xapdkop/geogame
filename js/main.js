'use strict';

var zoom;
var streetView;
var map;
var panorama;
var userMarker = null;
var rightMarker = null;
var pathLine = null;
var isMap = false;
var storage;
var answerListener;

window.onload = () => {
	pjs();

	$('#panorama').hide();
	$('#map').show();
	$('#startGame').on('click', startGame);
	$('#switch').on('click', toggleMap);
	$('#answer').on('click', checkAnswer);
	$('#newGame').on('click', newGame);
};

window.onresize = () => {
	if (map) {
		zoom = $(document).height() <= 1000 ? 2 : Math.ceil($(document).height() / 1000 * 2);
		map.setZoom(zoom);
	}
}

function initMap() {
	streetView = new google.maps.StreetViewService();

	zoom = $(document).height() <= 1000 ? 2 : Math.ceil($(document).height() / 1000 * 2);
	map = new google.maps.Map(document.getElementById('map'), {
		center: randomPoint({min: 0, max: 0}, {min: -180, max: 180}),
		zoom: zoom,
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

	answerListener = google.maps.event.addListener(map, 'click', event => makeAnswer(event.latLng, map));
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
	storage = new google.maps.LatLng(randomPoint({min: -90, max: 90}, {min: -180, max: 180}))
	streetView.getPanoramaByLocation(storage, 5000000, function (data, status) {
		if (status == google.maps.StreetViewStatus.OK) {
			storage = data.location.latLng;
			panorama.setPano(data.location.pano);
			panorama.setPov({
				heading: 270,
				pitch: 0
			});
			panorama.setVisible(true);
		}
		else {
			generatePoint();
		}
	});
}

function makeAnswer(location, map) {
	if (!userMarker) {
		userMarker = new google.maps.Marker({
			position: location,
			title: 'Your answer',
			map: map,
			icon: {
				url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
			}
		});
	}
	else {
		userMarker.setPosition(location);
	}
}

function checkAnswer() {
	if (!userMarker)
		return;

	map.setOptions({ draggableCursor: 'default' });

	$('#answer').hide();

	$('#endGame').show();
	$('#newGame').show();

	answerListener.remove();
	var markerPosition = userMarker.getPosition();

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

	rightMarker = new google.maps.Marker({
		position: storage,
		title: 'Hidden place',
		map: map,
		icon: {
			url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
		}
	});

	pathLine = new google.maps.Polyline({
		path: [
			rightMarker.getPosition(), userMarker.getPosition()
		],
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2,
		map: map
	});

	map.panTo(rightMarker.getPosition());
	var tmpZoom = Math.log2(Math.trunc(20000 / distance) + 1);
	map.setZoom(tmpZoom < zoom ? zoom : tmpZoom);
}

function newGame() {
	$('#endGame').hide();
	$('#newGame').hide();
	if (pathLine) {
		pathLine.setMap(null);
		pathLine = null;
	}
	if (userMarker) {
		userMarker.setMap(null);
		userMarker = null;
	}
	if (rightMarker) {
		rightMarker.setMap(null);
		rightMarker = null;
	}
	if (isMap)
		toggleMap();
	map.setOptions({ draggableCursor: 'crosshair' });
	map.setCenter(randomPoint({min: 0, max: 0}, {min: -180, max: 180}));
	map.setZoom(zoom);
	answerListener = google.maps.event.addListener(map, 'click', event => makeAnswer(event.latLng, map));
	startGame();
}

function toggleMap() {
	if (isMap) { // to panorama
		isMap = false;
		$('#map').hide();
		$('#panorama').show();
		$('#switch').text('Map');
		$('#answer').hide();
	}
	else { // to map
		isMap = true;
		$('#panorama').hide();
		$('#map').show();
		$('#switch').text('Panorama');
		if (!rightMarker)
			$('#answer').show();
	}
}

function randomPoint(latRange, lngRange) {
	return {
		lat: Math.random() * (latRange.max - latRange.min + 1) + latRange.min,
		lng: Math.random() * (lngRange.max - lngRange.min + 1) + lngRange.min
	}
}