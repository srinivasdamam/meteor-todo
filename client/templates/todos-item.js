var EDITING_KEY = 'EDITING_TODO_ID';

Template.todosItem.helpers({
  checkedClass: function() {
    return this.checked && 'checked';
  },
  editingClass: function() {
    return Session.equals(EDITING_KEY, this._id) && 'editing';
  },
  inputActive: function(){
    return Session.equals(this._id, true);
  }
});

Template.todosItem.events({
  'change [type=checkbox]': function(event) {
    var checked = $(event.target).is(':checked');
    Todos.update(this._id, {$set: {checked: checked}});
    Lists.update(this.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
  },
  
  'focus span[class=special]': function(event) {
    Session.set(EDITING_KEY, this._id);
  },
  
  'blur span[class=special]': function(event) {
    if (Session.equals(EDITING_KEY, this._id))
      Session.set(EDITING_KEY, null);
  },

  'blur input[type=text]': function(event,template) {
    Todos.update(this._id, {$set: {text: template.find("#"+this._id).value}});
    Session.set(this._id,!Session.get(this._id));
    if (Session.equals(EDITING_KEY, this._id)){
      Session.set(EDITING_KEY, null);
    }
    
  },
  
  'keydown input[type=text]': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
      Session.set(this._id,!Session.get(this._id));
    }
  },
  
  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once 
  // every 300ms)
  'keyup input[type=text]': _.throttle(function(event) {
    Todos.update(this._id, {$set: {text: event.target.value}});
  }, 300),
  
  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item': function() {
    Todos.remove(this._id);
    if (! this.checked)
      Lists.update(this.listId, {$inc: {incompleteCount: -1}});
  },

  'mousedown .js-edit-item, click .js-edit-item': function() {
    if (Session.get(this._id)=== undefined){
      Session.set(this._id, true);
    } else {
      Session.set(this._id,!Session.get(this._id));
    }
    Session.set(EDITING_KEY, this._id);

  }
});