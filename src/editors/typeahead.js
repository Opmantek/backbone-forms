/**
 * Typeahead
 * 
 * Typeahead input, signals change when value is selected or typed in and tabbed out
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
  initialize: function(options) {
    Form.editors.Text.prototype.initialize.call(this, options);
    this.typeaheadInitialised = false;
  },

  /**
   * Adds the editor to the DOM
   * NOTE: afaict the element needs to be in the dom before typeahead init, which it isn't
   #       so the user is in charge of calling initialiseTypeahead below when it is in the DOM
   */
  render: function() {
    this.setValue(this.value);

    var self = this;
    return this;
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
  },
  /**
   * Cleans up the typeahead and then lets the normal clean up happen   
   */
  remove: function() {
    this.$el.typeahead('destroy');
    Form.editors.Text.prototype.remove.apply(this,arguments);
  },
  
  /**
   * Initialises the typeahead object
   * Should be called after $el has made it into the DOM   
   */
  initialiseTypeAhead: function() {
    var $typeahead = this.$el;
    // if already created then destroy and recreate
    // needed for some forms that re-render
    if( this.typeaheadInitialised )
      $typeahead.typeahead('destroy');
    this.typeaheadInitialised = true;
    
    if( $typeahead.data("prefetchList") !== undefined) {
      var prefetchList = $typeahead.data("prefetchList");
      var resources = this.getBloodhoundPrefetchConfig( prefetchList );  
    }
    else if( $typeahead.data("local") !== undefined ) {
      var local = $typeahead.data("local");
      var resources = this.getBloodhoundDataConfig( local );
    }
    else if( $typeahead.data("remote" !== undefined ) ) {
      var remote = $typeahead.data("remote");
      var resources = this.getBloodhoundRemoteConfig( remote );
    }
    var options  = [];
    for (var index in resources) {
      resource = resources[index];
      option = {
        name: resource.name, 
        displayKey: 'name',
        source: resource.engine,        
      }
      
      if( resources.length > 1 ) {
        option["templates"] = { header: '<h4 class="resource-header">'+resource.name+'</h4>' };
      }
      options.push(option);
    }

    var new_typeahead = $typeahead.typeahead({
        highlight: false,
        hint: true
      },
      options
    );

    $typeahead.data( "typeahead", new_typeahead );
    return new_typeahead;
  },
  getBloodhoundPrefetchConfig: function( data ) {
    var resources = new Array();
    for( i = 0; i < data.length; i++ ) {
        var engine = new Bloodhound({
          name: data[i].value,
          prefetch: {
            url: data[i].url,
            ttl: 0, // in milliseconds,         
          },
          datumTokenizer: function(d) {
            return d.tokens;
          },
          queryTokenizer: Bloodhound.tokenizers.whitespace,
        });
        engine.initialize();
        // typeahead doesn't allow dataset names with any chars except the ones listed below
        // fixme: update this and initialiseTypeAhead above to pass through and use the unmodified group name for displaying stuff
        data[i].value = data[i].value.replace( /[^a-zA-Z0-9_-]+/g, '_');
      resources.push( { engine: engine.ttAdapter(), name: data[i].value } );
    }
    return resources;
  },
  getBloodhoundDataConfig: function( data ) {
    var resources = new Array();
    
    var engine = new Bloodhound({   
      name: "data",
      local: data.datum,
      datumTokenizer: function(d) {
        return d.name
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
    });
    engine.initialize();
    resources.push( { engine: engine.ttAdapter(), name: data.header } );

    return resources;
  },
  getBloodhoundRemoteConfig: function( data ) {
    var resources = new Array();
    
    var engine = new Bloodhound({   
      name: "data",
      remote: { url: data.url, wildcard: data.wildcard },
      datumTokenizer: function(d) {
        return d.name
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
    });
    engine.initialize();
    resources.push( { engine: engine.ttAdapter(), name: data.header } );

    return resources;
  }
});
