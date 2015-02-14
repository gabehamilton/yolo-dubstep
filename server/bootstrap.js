// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Rooms.find().count() === 0) {
    var data = [
      {name: "Skuloop Gang",
       items: ["yo",
         "dude",
         "what's up",
         "in da house",
         "fo sho",
         "beep, bip, beep",
         "highdee ho"
       ]
      },
      {name: "Family",
       items: ["when are we meeting?",
         "tomorrow?",
         "no",
         "wednesday?",
         "no",
         "I thought we decided this already",
         "ok",
         "no",
         "I'll send another email"
         ]
      },
      {name: "Work",
       items: ["did you commit?",
         "yes, we're ready to go",
         "all tested",
         "just the new stuff",
         "is that good enough?",
         "ship it"
       ]
      }
    ];

    var timestamp = (new Date()).getTime();
    _.each(data, function(room) {
      var room_id = Rooms.insert({name: room.name,
        incompleteCount: room.items.length});

      _.each(room.items, function(text) {
        Chirps.insert({roomId: room_id,
                      text: text,
                      createdAt: new Date(timestamp)});
        timestamp += 1; // ensure unique timestamp.
      });
    });
  }
});
