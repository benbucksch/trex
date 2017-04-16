/**
 * Core implementation file of TRex
 */

/**
 * Defines a new class of elements.
 * Usually associated with a new HTML tag, e.g. <textbox>.
 *
 * @param newElementSelector {String} e.g. "hbox"
 *    Which tags this implements, and to which elements
 *    this implementation should be attached to.
 * @param parentElementSelector {String} e.g. "box"
 *    Parent class in OO class hierarchy from which to inherit behavior.
 * @param prototype {Object} Will be used as prototype for the
 *    element object.
 *    Must have a function |constructor()|.
 *    |this.base| will be defined and point to the implementation of
 *    |parentElementSelector|.
 */
function defineElementClass(newElementSelector, parentElementSelector, prototype) {
  assert(typeof(newElementSelector) == "string", "Need tag name");
  assert( !gSelectorClassMapping[newElementSelector],
          "Tag name <" + newElementSelector + "> already defined");
  var parentPrototype = ElementPrototype;
  if (parentElementSelector) {
    assert(typeof(parentElementSelector) == "string", "Need tag name for parent");
    parentPrototype = gSelectorClassMapping[parentElementSelector];
    assert(parentElementSelector, "No class registered for <" + parentElementSelector + ">");
  }
  prototype._forTag = newElementSelector;
  prototype._baseTag = parentElementSelector;

  prototype.base = parentPrototype;
  // TODO replace this (without changing API of this function)
  prototype.__proto__ = parentPrototype;

  gSelectorClassMapping[newElementSelector] = prototype;

  // Rest of logic is in Element.trex getter.
}

/**
 * Set by calling defineElementClass()
 * Used by Element.trex getter
 *
 * Map {tag name -> class prototype {ElementPrototype}}
 */
var gSelectorClassMapping = {};

/**
 * Parent for all element classes
 */
var ElementPrototype = {
  /**
   * Prototype object of parent class
   */
  base : null,

  /**
   * Back reference to the element this is attached to.
   * Set by Element.trex getter
   * {DOMElement}
   */
  el : null,

  /**
   * List of HTML attributes that are mapped to JS properties.
   * This list should include all attributes that are defined
   * by this element class. Set them using .push() in the ctor.
   *
   * See this._attributeToPropertyName() to get the attribute name.
   *
   * Map property name {String} -> true
   */
  _mappedProperties : null,

  /**
   * Map property name {String} -> value
   */
  _propertyValue : null,

  _setterRunning : null,

  /**
   * Called by each class constructor to define
   * properties and attributes that this class implements.
   */
  _addProperty : function(propertyName) {
    this._mappedProperties[propertyName] = true;
    var attrValue = this.el.getAttribute(this._propertyToAttributeName(propertyName));
    if (attrValue) {
      this[propertyName] = attrValue;
    }
  },
  _propertyToAttributeName : function(propertyName) {
    return propertyName; // TODO convert "S" to "-s"
  },
  _attributeToPropertyName : function(attributeName) {
    return attributeName; // TODO convert "-s" to "S"
  },

  baseGet : function(propertyName) {
    if (this.base) {
      return this.base.__lookupGetter__(propertyName).call(this);
    }
    return this._propertyValue[propertyName];
  },
  baseSet : function(propertyName, value) {
    if (this.base) {
      // TODO loops. ditto above.
      return this.base.__lookupSetter__(propertyName).call(this, value);
    }
    var attributeName = this._propertyToAttributeName(propertyName);
    if (this.el.getAttribute(attributeName) != value && // avoid loop TODO test for non-strings
        !this._setterRunning[propertyName]) { // double-protection against loops
      this._setterRunning[propertyName] = true;
      this.el.setAttribute(attributeName, value + "");
      this._setterRunning[propertyName] = false;
    }
    return this._propertyValue[propertyName] = value;
  },

  /**
   * Called when a new instance of this kind of element
   * is instantiated.
   * Called by Element.trex getter.
   */
  constructor : function() {
    console.log("ctor el: " + this.el);
    this._mappedProperties = {};
    this._propertyValue = {};
    this._setterRunning = {};

    // <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
    var self = this;
    this._attrObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var attributeName = mutation.attributeName;
        if (attributeName) {
          var propertyName = self._attributeToPropertyName(attributeName);
          self[propertyName] = self.el.getAttribute(attributeName); // calls setter
        }
      });
    });
    this._attrObserver.observe(this.el, { attributes : true });

    this._addProperty("hidden");
  },
}

/**
 * The DOMElement.trex getter implementation
 */
Object.defineProperty(Element.prototype, "trex", {
  get : function() {
    if (this._trex) {
      return this._trex;
    }
    var tagName = this.nodeName.toLowerCase();
    var prototype = gSelectorClassMapping[tagName];
    assert(prototype, "No class registered for <" + tagName + ">");
    this._trex = Object.create(prototype);
    console.log(dumpObject(this._trex, "obj", 4));
    this._trex.el = this;
    this._trex.constructor();
    return this._trex;
  },
  // no setter
});


function assert(test, errorMsg) {
  console.assert(test, errorMsg);
  if (!test) {
    throw new Error(errorMsg ? errorMsg : "Bug: assertion failed");
  }
}

defineElementClass("#element", null, {
  constructor : function() {
    console.log("element constructor for " + this._forTag + " with base " + this._baseTag);
    // TODO loops. ditto below.
    this.base.constructor.call(this);
  },

  get hidden () {
    return this.baseGet("hidden");
  },
  set hidden (value) {
    this.baseSet("hidden", sanitize.boolean(value));
    // implemented in CSS
  },
});

defineElementClass("box", "#element", {
  constructor : function() {
    console.log("box constructor for " + this._forTag + " with base " + this._baseTag);
    // TODO loops. ditto below.
    this.base.constructor.call(this);
  },
});

defineElementClass("hbox", "box", {
  constructor : function() {
    console.log("hbox constructor for " + this.el);
    this.base.constructor.call(this);
  },
});

defineElementClass("vbox", "box", {
  constructor : function() {
    this.base.constructor.call(this);
  },
});
