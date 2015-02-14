var EDITING_KEY = 'editingRoom';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the room template is rendered
var firstRender = true;
var roomRenderHold = LaunchScreen.hold();
roomFadeInHold = null;

Template.roomsShow.rendered = function() {
  if (firstRender) {
    // Released in app-body.js
    roomFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    roomRenderHold.release();

    firstRender = false;
  }

  this.find('.js-title-nav')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        this.remove();
      });
    }
  };
};

Template.roomsShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  chirpsReady: function() {
    return Router.current().chirpsHandle.ready();
  },

  chirps: function(roomId) {
    return Chirps.find({roomId: roomId}, {sort: {createdAt : -1}});
  }
});

var editRoom = function(room, template) {
  Session.set(EDITING_KEY, true);
  
  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveRoom = function(room, template) {
  Session.set(EDITING_KEY, false);
  Rooms.update(room._id, {$set: {name: template.$('[name=name]').val()}});
}

var deleteRoom = function(room) {
  // ensure the last public room cannot be deleted.
  if (! room.userId && Rooms.find({userId: {$exists: false}}).count() === 1) {
    return alert("Sorry, you cannot delete the final public room!");
  }
  
  var message = "Are you sure you want to delete the room " + room.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Chirps.find({roomId: room._id}).forEach(function(chirp) {
      Chirps.remove(chirp._id);
    });
    Rooms.remove(room._id);

    Router.go('home');
    return true;
  } else {
    return false;
  }
};

var toggleRoomPrivacy = function(room) {
  if (! Meteor.user()) {
    return alert("Please sign in or create an account to make private rooms.");
  }

  if (room.userId) {
    Rooms.update(room._id, {$unset: {userId: true}});
  } else {
    // ensure the last public room cannot be made private
    if (Rooms.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot make the final public room private!");
    }

    Rooms.update(room._id, {$set: {userId: Meteor.userId()}});
  }
};

Template.roomsShow.events({
  'click .js-cancel': function() {
    Session.set(EDITING_KEY, false);
  },
  
  'keydown input[type=text]': function(event) {
    // ESC
    if (27 === event.which) {
      event.preventDefault();
      $(event.target).blur();
    }
  },
  
  'blur input[type=text]': function(event, template) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (Session.get(EDITING_KEY))
      saveRoom(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveRoom(this, template);
  },
  
  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  'change .room-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editRoom(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteRoom(this, template);
    } else {
      toggleRoomPrivacy(this, template);
    }

    event.target.selectedIndex = 0;
  },
  
  'click .js-edit-room': function(event, template) {
    editRoom(this, template);
  },
  
  'click .js-toggle-room-privacy': function(event, template) {
    toggleRoomPrivacy(this, template);
  },
  
  'click .js-delete-room': function(event, template) {
    deleteRoom(this, template);
  },
  
  'click .js-chirp-add': function(event, template) {
    template.$('.js-chirp-new input').focus();
  },

  'submit .js-chirp-new': function(event) {
    event.preventDefault();

    var $input = $(event.target).find('[type=text]');
    if (! $input.val())
      return;
    
    Chirps.insert({
      roomId: this._id,
      text: $input.val(),
      checked: false,
      createdAt: new Date()
    });
    Rooms.update(this._id, {$inc: {incompleteCount: 1}});
    $input.val('');
  }
});
