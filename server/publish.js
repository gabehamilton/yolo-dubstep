Meteor.publish('publicRooms', function() {
  return Rooms.find({userId: {$exists: false}});
});

Meteor.publish('privateRooms', function() {
  if (this.userId) {
    return Rooms.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('chirps', function(roomId) {
  check(roomId, String);

  return Chirps.find({roomId: roomId});
});
