﻿'use strict';

window.onload = () => {
	particlesJS('particles', {
	"particles": {
		"number": {
			"value": 60,
			"density": {
				"enable": true,
				"value_area": 800
			}
		},
		"color": {
			"value": "#000"
		},
		"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#000"
			},
			"polygon": {
				"nb_sides": 5
			},
			"image": {
				"src": "",
				"width": 0,
				"height": 0
			}
		},
		"opacity": {
			"value": 1,
			"random": false,
			"anim": {
				"enable": false,
				"speed": 1,
				"opacity_min": 0.1,
				"sync": false
			}
		},
		"size": {
			"value": 1,
			"random": true,
			"anim": {
				"enable": false,
				"speed": 80,
				"size_min": 0.1,
				"sync": false
			}
		},
		"line_linked": {
			"enable": true,
			"distance": 200,
			"color": "#000",
			"opacity": 0.5,
			"width": 1
		},
		"move": {
			"enable": true,
			"speed": 3,
			"direction": "none",
			"random": false,
			"straight": false,
			"out_mode": "bounce",
			"bounce": false,
			"attract": {
				"enable": false,
				"rotateX": 4000,
				"rotateY": 4000
			}
		}
	},
	"interactivity": {
		"detect_on": "window",
		"events": {
			"onhover": {
				"enable": true,
				"mode": "grab"
			},
			"onclick": {
				"enable": false,
				"mode": "repulse"
			},
			"resize": true
		},
		"modes": {
			"grab": {
				"distance": 400,
				"line_linked": {
					"opacity": 0.5
				}
			},
			"bubble": {
				"distance": 800,
				"size": 80,
				"duration": 2,
				"opacity": 0.8,
				"speed": 3
			},
			"repulse": {
				"distance": 200,
				"duration": 3
			},
			"push": {
				"particles_nb": 4
			},
			"remove": {
				"particles_nb": 2
			}
		}
	},
	"retina_detect": true
	});
	
	$('#startGame').on('click', startGame);
};

var sv;
var map;
var panorama;
var storage = {
	lat: 0,
	lng: 0
};
function initMap() {
	sv = new google.maps.StreetViewService();
	
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
		linksControl: false,
		showRoadLabels: false,
		fullscreenControl: false,
	});
}

function startGame() {
	$('#logo').hide();
	$('#description').hide();
	$('#start-button').hide();
	$('#particles').hide();
	$('#panorama').show();
	
	
	map.zoomControl = true;
	
	generateRandomPoint();
}

function generateRandomPoint(){
	storage.lat = randomBetween(-90, 90);
	storage.lng = randomBetween(-180, 180);
	sv.getPanoramaByLocation(new google.maps.LatLng(storage.lat, storage.lng), 500, processSVData);
}

function processSVData(data, status) {
	if (status === 'OK') {
		panorama.setPano(data.location.pano);
		panorama.setPov({
			heading: 270,
			pitch: 0
		});
		panorama.setVisible(true);
	} else {
		generateRandomPoint();
	}
}

function randomBetween(min,max) {
    return Math.random() * (max - min + 1 ) + min;
}
