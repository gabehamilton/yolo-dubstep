Playback = {
	playSound: function (url) {
		var sound = new Howl({
			urls: [url] //,
			//volume: 0.5,
			//buffer: true
		}).play();
	}
};
