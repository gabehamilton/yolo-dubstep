var audio_context;
var recorder;

function startUserMedia(stream) {
	var input = audio_context.createMediaStreamSource(stream);
	console.log('Media stream created.');

	// Uncomment if you want the audio to feedback directly
	//input.connect(audio_context.destination);
	//console.log('Input connected to audio context destination.');

	recorder = new Recorder(input);
	console.log('Recorder initialised.');
}

Template.record.events({
	'click .js-record': function(event) {
		var button = event.target;
		recorder && recorder.record();
		button.disabled = true;
		button.nextElementSibling.disabled = false;
		console.log('Recording...');
	},

	'click .js-stop-recording': function(event) {
		var button = event.target;
		recorder && recorder.stop();
		button.disabled = true;
		button.previousElementSibling.disabled = false;
		console.log('Stopped recording.');

		storeAudioBytes(this._id);
		Rooms.update(this._id, {$inc: {incompleteCount: 1}});

		recorder.clear();
	}
});

var BinaryFileReader = {
	read: function(file, callback){
		var reader = new FileReader;

		var fileInfo = {
			name: file.name,
			type: file.type,
			size: file.size,
			file: null
		}

		reader.onload = function(){
			fileInfo.file = new Uint8Array(reader.result);
			callback(null, fileInfo);
		}
		reader.onerror = function(){
			callback(reader.error);
		}

		reader.readAsArrayBuffer(file);
	}
}

function storeAudioBytes(roomId) {
	recorder && recorder.exportWAV(function(blob) {
		BinaryFileReader.read(blob, function(err, fileInfo){
			console.log(blob);
			Chirps.insert({
				roomId: roomId,
				text: 'recorded',
				checked: false,
				createdAt: new Date(),
				audioWav: fileInfo
			});
		})
	});
}

function createDownloadLink() {
	recorder && recorder.exportWAV(function(blob) {
		var url = URL.createObjectURL(blob);
		var li = document.createElement('li');
		var au = document.createElement('audio');
		var hf = document.createElement('a');

		au.controls = true;
		au.src = url;
		hf.href = url;
		hf.download = new Date().toISOString() + '.wav';
		hf.innerHTML = hf.download;
		li.appendChild(au);
		li.appendChild(hf);
		recordingslist.appendChild(li);
	});
}

window.onload = function init() {
	try {
		// webkit shim
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		window.URL = window.URL || window.webkitURL;

		audio_context = new AudioContext;
		console.log('Audio context set up.');
		console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
	} catch (e) {
//		alert('No web audio support in this browser!');
	}

	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
		console.log('No live audio input: ' + e);
	});
};