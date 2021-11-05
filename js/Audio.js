const Audio = functionAudioManager() {
//--//Constants---------------------------------------------------------------
	const VOLUME_INCREMENT = 0.05;
	const DROPOFF_MIN = 60;
	const DROPOFF_MAX = 1000;
	const HEADSHADOW_REDUCTION = 0.5;

//--//Properties--------------------------------------------------------------
	var initialized = false;
	var audioCtx;
	var soundEffectsBus, musicBus, masterBus;
	var musicVolume, soundEffectsVolume;
	var currentMusicTrack;
	var currentSoundSources = [];

	this.init = function() {
		if (initialized) return;

		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

		this.initialized = true;
	};

	this.reset = function() {
		if (!initialized) return;


	};

	this.update = function() {
		if (!initialized) return;


	};

//--//volume handling functions-----------------------------------------------
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

		return tOrF;
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

//--//create sound objects-----------------------------------------------------
	this.create3DSoundAttatched = function(fileNameWithPath, parent,  mixVolume = 1) {

		//Setup HTMLElement
		var audioFile = new Audio(fileNameWithPath);
		audioFile.preservesPitch = false;
		audioFile.mozPreservesPitch = false;
		audioFile.webkitPreservesPitch = false;

		//Setup nodes
		var source = audioCtx.createMediaElementSource(audioFile);
		var gainNode = audioCtx.createGain();
		var panNode = audioCtx.createStereoPanner();

		source.connect(gainNode);
		gainNode.connect(panNode);
		panNode.connect(soundEffectsBus);


		//Calculate volume and panning
		gainNode.gain.value = calcuateVolumeDropoff(location);
		panNode.pan.value = calcuatePan(location);

		//Set audio buffer and play
		gainNode.gain.value *= Math.pow(mixVolume, 2);
		audioFile.play();

		//Return sound object referance and push to list
		referance = {source: source, volume: gainNode, pan: panNode, pos: location, endTime: audioCtx.currentTime+source.buffer.duration};
		currentSoundSources.push(referance);
		return referance;

		this.update = function() {
			gainNode.gain.value = calcuateVolumeDropoff(location);
			panNode.pan.value = calcuatePan(location);
		}
	}



//--//Sound spatialization functions------------------------------------------
	function calcuatePan(location) {
		var direction = radToDeg(player.ang + angle(player, location));
		while (direction >= 360) {
			direction -= 360;
		}
		while (direction < 0) {
			direction += 360;
		}

		//Calculate pan
		var pan = 0;
		if (direction <= 90) {
			pan = lerp(0, -1, direction/90);
		} else if (direction <= 180) {
			pan = lerp(-1, 0, (direction-90)/90);
		} else if (direction <= 270) {
			pan = lerp(0, 1, (direction-180)/90);
		} else if (direction <= 360) {
			pan = lerp(1, 0, (direction-270)/90);
		}

		//Proximity
		var distance = distance(player, location);
		if (distance <=  DROPOFF_MIN) {
			var panReduction = distance/DROPOFF_MIN;
			pan *= panReduction;
		}

		return pan;
	}

	function calcuateVolumeDropoff(location) {
		var distance = distance(player, location);

		//Distance attenuation
		var newVolume = 1;
		if (distance > DROPOFF_MIN && distance <= DROPOFF_MAX) {
			newVolume = Math.abs((distance - DROPOFF_MIN)/(DROPOFF_MAX - DROPOFF_MIN) - 1);
		} else if (distance > DROPOFF_MAX) {
			newVolume = 0;
		}

		var direction = radToDeg(player.ang + angle(player, location));
		while (direction >= 360) {
			direction -= 360;
		}
		while (direction < 0) {
			direction += 360;
		}

		//Back of head attenuation
		if (direction > 90 && direction <= 180) {
			newVolume *= lerp(1, HEADSHADOW_REDUCTION, (direction-90)/90);
		} else if (direction > 180 && direction <= 270) {
			newVolume *= lerp(HEADSHADOW_REDUCTION, 1, (direction-180)/90);
		}

		return Math.pow(newVolume, 2);
	}

}