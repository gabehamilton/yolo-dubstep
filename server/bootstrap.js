// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Rooms.find().count() === 0) {
    var data = [
      {name: "Skuloop Gang",
       items: [{text: "yo", url: 'https://s3.amazonaws.com/canaryfiles/test/sound.ogg'},
	       {text: "dude", url: ''},
	       {text: "what's up", url: ''},
	       {text: "in da house", url: ''},
	       {text: "fo sho", url: ''},
	       {text: "beep, bip, beep", url: ''},
	       {text: "highdee ho", url: ''}
       ]
      },
      {name: "Family",
       items: [{text: "when are we meeting?", url: ''},
	       {text: "tomorrow?", url: ''},
	       {text: "no", url: ''},
	       {text: "wednesday?", url: ''},
	       {text: "no", url: ''},
	       {text: "I thought we decided this already", url: ''},
	       {text: "ok", url: ''},
	       {text: "no", url: ''},
	       {text: "I'll send another email",  url: ''}
         ]
      },
      {name: "Work",
       items: [{text: "did you commit?", url: ''},
	       {text: "yes, we're ready to go", url: ''},
	       {text: "all tested", url: ''},
	       {text: "just the new stuff", url: ''},
	       {text: "is that good enough?", url: ''},
	       {text: "ship it", url: ''}
       ]
      }
    ];

    var timestamp = (new Date()).getTime();
    _.each(data, function(room) {
      var room_id = Rooms.insert({name: room.name,
        incompleteCount: room.items.length});

      _.each(room.items, function(chirp) {
        Chirps.insert({roomId: room_id,
                      text: chirp.text,
	                    url: chirp.url,
                      createdAt: new Date(timestamp)});
        timestamp += 1; // ensure unique timestamp.
      });
    });
  }
});
