Playback = {
	playSound: function (url) {
		var sound = new Howl({
			urls: [url] //,
			//volume: 0.5,
			//buffer: true
		}).play();
	},

	playSoundBytes: function (audioWav) {
		var blob = new Blob([audioWav.file],{type: audioWav.type});

		var url = URL.createObjectURL(blob);
		var a = new Audio();
		a.src = url;
		a.play();
	}
};
