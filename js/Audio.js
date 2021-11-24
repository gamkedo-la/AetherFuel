var isServer = window.location.protocol == 'file:' ? false : true;

var AudioMan = new AudioManager();
function AudioManager() {
//--//Constants-----------------------------------------------------------------
	const VOLUME_INCREMENT = 0.05;
	const DROPOFF_MIN = 40;
	const DROPOFF_MAX = 1200;
	const HEADSHADOW_REDUCTION = 0.5;
	const DOPLER_SCALE = 8;

//--//Properties----------------------------------------------------------------
	var initialized = false;
	var audioCtx;
	var soundEffectsBus, musicBus, masterBus;
	var musicVolume, soundEffectsVolume;
	var currentMusicTrack = null;
	var currentSoundSources = [];

	this.init = function() {
		if (initialized) return;

		if (isServer) {
			audioCtx = new window.AudioContext();
			this.context = audioCtx;
			soundEffectsBus = audioCtx.createGain();
			musicBus = audioCtx.createGain();
			masterBus = audioCtx.createGain();

			soundEffectsVolume = 0.7;
			musicVolume = 0.7;

			soundEffectsBus.gain.value = soundEffectsVolume;
			soundEffectsBus.connect(masterBus);
			musicBus.gain.value = musicVolume;
			musicBus.connect(masterBus);
			masterBus.connect(audioCtx.destination);
		} else {
			console.log("Not Server: skipping WebAudioAPI");
		}

		initialized = true;
		console.log("Initialized Audio");
	};

	this.reset = function() {
		if (!initialized) return;
		//console.log("Reset Audio");

		for (var i = currentSoundSources.length-1; i >= 0; i--) {
		 	currentSoundSources[i].stop();
		}
		currentSoundSources.length = 0
	};

	this.update = function() {
		if (!initialized) return;
		//console.log("Update Audio");

		for (var i = currentSoundSources.length-1; i >= 0; i--) {
			currentSoundSources[i].update();
			if (currentSoundSources[i].isEnded()) currentSoundSources.splice(i, 1);
		}
	};

//--//volume handling functions-------------------------------------------------
	this.toggleMute = function() {
		if (!initialized) return;

		var newVolume = (masterBus.gain.value === 0 ? 1 : 0);
		masterBus.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.03);

		return newVolume;
	};

	this.setMute = function(tOrF) {
		if (!initialized) return;

		var newVolume = (tOrF === false ? 1 : 0);
		masterBus.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.03);

		return newVolume;
	};

	this.setMusicVolume = function(amount) {
		if (!initialized) return;

		musicVolume = amount;
		if (musicVolume > 1.0) {
			musicVolume = 1.0;
		} else if (musicVolume < 0.0) {
			musicVolume = 0.0;
		}
		musicBus.gain.setTargetAtTime(Math.pow(musicVolume, 2), audioCtx.currentTime, 0.03);

		return musicVolume;
	};

	this.setSoundEffectsVolume = function(amount) {
		if (!initialized) return;

		soundEffectsVolume = amount;
		if (soundEffectsVolume > 1.0) {
			soundEffectsVolume = 1.0;
		} else if (soundEffectsVolume < 0.0) {
			soundEffectsVolume = 0.0;
		}
		soundEffectsBus.gain.setTargetAtTime(Math.pow(soundEffectsVolume, 2), audioCtx.currentTime, 0.03);

		return soundEffectsVolume;
	};

	this.turnVolumeUp = function() {
		if (!initialized) return;

		this.setMusicVolume(musicVolume + VOLUME_INCREMENT);
		this.setSoundEffectsVolume(soundEffectsVolume + VOLUME_INCREMENT);
	};

	this.turnVolumeDown = function() {
		if (!initialized) return;

		this.setMusicVolume(musicVolume - VOLUME_INCREMENT);
		this.setSoundEffectsVolume(soundEffectsVolume - VOLUME_INCREMENT);
	};

//--//music---------------------------------------------------------------------
	this.playMusic = function(fileNameWithPath, mixVolume = 1) {
		if (currentMusicTrack != null) {
			if (fileNameWithPath != currentMusicTrack.fileNameWithPath) {
				currentMusicTrack.stop();
				currentMusicTrack = new musicTrack(fileNameWithPath, mixVolume);
			}
		} else {
			currentMusicTrack = new musicTrack(fileNameWithPath, mixVolume);
		}
	};

	function musicTrack(fileNameWithPath, mixVolume = 1) {
		this.fileNameWithPath = fileNameWithPath;
		var audioFile = new Audio(fileNameWithPath);
		var mixVolume = mixVolume;

		audioFile.volume = mixVolume;
		audioFile.loop = true;

		if (isServer) {
			//Setup nodes
			var source = audioCtx.createMediaElementSource(audioFile);
			var gainNode = audioCtx.createGain();

			source.connect(gainNode);
			gainNode.connect(musicBus);
		}

		audioFile.play();

		this.stop = function() {
			audioFile.pause();
		}
	}

//--//sound objects-------------------------------------------------------------
	this.createSound3D = function(fileNameWithPath, parent, looping = false, mixVolume = 1, rate = 1, preservesPitch = false) {
		if (!initialized) return;
		//console.log("Create Sound3D");

		var newSound = new Sound3D(fileNameWithPath, parent, looping, mixVolume, rate, preservesPitch);
		currentSoundSources.push(newSound);
		//console.log(newSound);
		return newSound;
	};

	function Sound3D(fileNameWithPath, parent, looping = false, mixVolume = 1, rate = 1, preservesPitch = false) {
		this.name = fileNameWithPath;
		this.mixVolume = mixVolume;
		this.rate = rate;
		this.parent = parent;
		var lastDistance = distanceBetweenTwoPoints(player, parent);;

		//Setup HTMLElement
		var audioFile = new Audio(fileNameWithPath);
		audioFile.preservesPitch = preservesPitch;
		audioFile.mozPreservesPitch = preservesPitch;
		audioFile.webkitPreservesPitch = preservesPitch;
		audioFile.playbackRate = this.rate;
		audioFile.loop = looping;
		audioFile.volume = Math.pow(this.mixVolume, 2);

		if (isServer) {
			//Setup nodes
			var source = audioCtx.createMediaElementSource(audioFile);
			var gainNode = audioCtx.createGain();
			var panNode = audioCtx.createStereoPanner();

			source.connect(gainNode);
			gainNode.connect(panNode);
			panNode.connect(soundEffectsBus);


			//Calculate volume and panning
			gainNode.gain.value = calcuateVolumeDropoff(this.parent);
			panNode.pan.value = calcuatePan(this.parent);
		}


		this.update = function() {
			//console.log("Update Sound");

			audioFile.volume = Math.pow(this.mixVolume, 2);
			if (isServer) {
				gainNode.gain.value = calcuateVolumeDropoff(this.parent);
				panNode.pan.value = calcuatePan(this.parent);
			} else {
				audioFile.volume *= calcuateVolumeDropoff(this.parent);
			}

			//dopler
			audioFile.playbackRate = this.rate;
			var newDistance = distanceBetweenTwoPoints(player, this.parent);
			var dopler = (lastDistance - newDistance) / DOPLER_SCALE;
			audioFile.playbackRate *= clipBetween(Math.pow(2, (dopler/12)), 0.8, 1.2);
			lastDistance = newDistance;

			//console.log(dopler + " " + lastDistance + " " + audioFile.playbackRate);
		}

		this.play = function() {
			console.log("Playing audio " + fileNameWithPath);
			audioFile.currentTime = 0;
			return audioFile.play();
		}

		this.stop = function() {
			return audioFile.pause();
		}

		this.getAudioFile = function() {
			return audioFile
		}

		this.isEnded = function() {
			return audioFile.ended;
		}
	};



//--//Sound spatialization functions--------------------------------------------
	function calcuatePan(location) {
		var direction = radToDeg(-player.ang + angleBetweenTwoPoints(player, location));
		while (direction >= 360) {
			direction -= 360;
		}
		while (direction < 0) {
			direction += 360;
		}

		//Calculate pan
		var pan = 0;
		if (direction <= 90) {
			pan = lerp(0, 1, direction/90);
		} else if (direction <= 180) {
			pan = lerp(1, 0, (direction-90)/90);
		} else if (direction <= 270) {
			pan = lerp(0, -1, (direction-180)/90);
		} else if (direction <= 360) {
			pan = lerp(-1, 0, (direction-270)/90);
		}

		//Proximity
		var distance = distanceBetweenTwoPoints(player, location);
		if (distance <=  DROPOFF_MIN) {
			var panReduction = distance/DROPOFF_MIN;
			pan *= panReduction;
		}

		//console.log("" + pan + " " + direction);

		return pan;
	};

	function calcuateVolumeDropoff(location) {
		var distance = distanceBetweenTwoPoints(player, location);

		//Distance attenuation
		var newVolume = 1;
		if (distance > DROPOFF_MIN && distance <= DROPOFF_MAX) {
			newVolume = Math.abs((distance - DROPOFF_MIN)/(DROPOFF_MAX - DROPOFF_MIN) - 1);
		} else if (distance > DROPOFF_MAX) {
			newVolume = 0;
		}

		var direction = radToDeg(-player.ang + angleBetweenTwoPoints(player, location));
		while (direction <= 0) {
			direction += 360;
		}
		while (direction >= 360) {
			direction -= 360;
		}

		//Back of head attenuation
		if (direction > 90 && direction <= 180) {
			newVolume *= lerp(1, HEADSHADOW_REDUCTION, (direction-90)/90);
		} else if (direction > 180 && direction <= 270) {
			newVolume *= lerp(HEADSHADOW_REDUCTION, 1, (direction-180)/90);
		}

		//console.log("" + newVolume + " " + distance);

		return Math.pow(newVolume, 2);
	};

//--//Debuging------------------------------------------------------------------
	this.getList = function() {
		return currentSoundSources;
	}

}