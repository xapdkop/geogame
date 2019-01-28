'use strict';

window.onload = () => {
	pjs();

	$('#startGame').on('click', startGame);
	$('#switch').on('click', toggleMap);
	$('#answer').on('click', checkAnswer);
};

var street_view;
var map;
var panorama;
var user_marker = null;
var right_marker = null;
var map_switch_flag = false;
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

	$('#panorama').css({
		'z-index': 20
	});
	$('#map').css({
		'z-index': 10
	});

	map.zoomControl = true;

	generatePoint();
}

function generatePoint() {
	storage = new google.maps.LatLng(randomBetween(-90, 90), randomBetween(-180, 180));
	street_view.getPanoramaByLocation(new google.maps.LatLng(storage.lat(), storage.lng()), 5000000, function (data, status) {
		if (status == google.maps.StreetViewStatus.OK) {
			console.log(data.location);
			storage = data.location.latLng;
			panorama.setPano(data.location.pano);
			panorama.setPov({
				heading: 270,
				pitch: 0
			});
			panorama.setVisible(true);
		}
		else {
			console.log('Trying again...');
			generatePoint();
		}
	});
}

function makeAnswer(location, map) {
	if (!user_marker) {
		user_marker = new google.maps.Marker({
			position: location,
			title: 'Ваш ответ',
			map: map
		});
	}
	else {
		user_marker.setPosition(location);
	}
}

function checkAnswer() {
	if (!user_marker)
		return;

	//$('#switch').hide();
	$('#answer').hide();

	$('#endGame').show();
	$('#newGame').show();

	listener.remove();
	var markerPosition = user_marker.getPosition();

	console.log(markerPosition.lat(), markerPosition.lng());
	console.log(storage.lat(), storage.lng());
	console.log(google.maps.geometry.spherical.computeDistanceBetween(markerPosition, storage) / 1000 + 'km');

	$('#endGame').text('Ваш ответ в ' + (google.maps.geometry.spherical.computeDistanceBetween(markerPosition, storage) / 1000).toFixed(3) + ' километрах от текущей локации');

	right_marker = new google.maps.Marker({
		position: storage,
		title: 'Загаданое место',
		map: map
	});

	$('#newGame').on('click', newGame);
}

function newGame() {
	$('#endGame').hide();
	$('#newGame').hide();
	if (user_marker) {
		user_marker.setMap(null);
		user_marker = null;
	}
	if (right_marker) {
		right_marker.setMap(null);
		right_marker = null;
	}
	toggleMap();
	listener = google.maps.event.addListener(map, 'click', function (event) {
		makeAnswer(event.latLng, map);
	});
	startGame();
}

function toggleMap() {
	if (map_switch_flag) {
		map_switch_flag = false;
		$('#switch').text('Карта');
		$('#panorama').css({
			'z-index': 20
		});
		$('#map').css({
			'z-index': 10
		});
		$('#answer').hide();
	}
	else {
		map_switch_flag = true;
		$('#switch').text('Панорама');
		$('#panorama').css({
			'z-index': 10
		});
		$('#map').css({
			'z-index': 20
		});
		$('#answer').show();
	}
}

function randomBetween(min, max) {
	return Math.random() * (max - min + 1) + min;
}
