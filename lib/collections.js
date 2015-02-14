Rooms = new Meteor.Collection('rooms');

// Calculate a default name for a room in the form of 'Room A'
Rooms.defaultName = function() {
  var nextLetter = 'A', nextName = 'Room ' + nextLetter;
  while (Rooms.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'Room ' + nextLetter;
  }

  return nextName;
};

Chirps = new Meteor.Collection('chirps');
