/**
 * Text
 * 
 * Text input with focus, blur and change events
 */
Form.editors.Typeahead = Form.editors.Text.extend({

  events: {    
    // only trigger change after the user has typed in and left (typeahead:change)
    // or has made a selection (in which case don't trigger when they leave)
    'typeahead:select': function(event) {
      if( this.selectedValue !== this.getValue() ) {
        this.selectedValue = this.getValue();
        this.trigger("change", this);
      }      
    },
    'typeahead:change': function(event) {
      if( this.selectedValue !== this.getValue() ) {
        this.selectedValue = this.getValue();
        this.trigger("change", this);
      } 
    },
    'select':   function(event) {
      this.trigger('select', this);
    },
    'focus':    function(event) {
      this.trigger('focus', this);
    },
    'blur':     function(event) {
      this.trigger('blur', this);
    }
  },

  /**
   * Returns the current editor value
   * @return {String}
   */
  getValue: function() {
    return this.$el.typeahead('val');
  },

  /**
   * Sets the value of the form element
   * use parents set if we have not been instantiated as a typeahead yet
   * @param {String}
   */
  setValue: function(value) {
    this.value = value;
    if( this.$el.data("typeahead") !== undefined) {
      this.$el.typeahead('val', value);
    }
    else {
      Form.editors.Text.prototype.setValue.apply(this,arguments);
    }
  }
});
