function Fastlist(element) {
  assert(element && element.localName == "fastlist");
  this._listE = element;
  element.widget = this;
  this._entries = [];
  this._lineElements = [];
  this._lineTemplate = this._listE.querySelector("line");
  assert(this._lineTemplate);
  this._lineHeight = this._getHeight(this._lineTemplate); // TODO consider vertical padding
  removeElement(this._lineTemplate);
  var tableE = cE(this._listE, "table", null, { cellspacing: 0 });
  var headerRowE = this._listE.querySelector("header");
  removeElement(headerRowE );
  var theadE = cE(tableE, "thead");
  theadE.appendChild(headerRowE);
  this._contentE = cE(tableE, "tbody", "content", { flex : 1 });

  this._scrollbarE = cE(this._listE, "vbox", "scrollbar");
  this._scrollbarE.style.width = 20;
  this._scrollbarE.addEventListener("scroll", event => this.scrollBar(event), false);
  this._listE.addEventListener("wheel", event => this.scrollWheel(event), false);
}
Fastlist.prototype = {
  /**
   * {<fastlist> DOMElement}
   */
  _listE : null,

  /**
   * Where the actual lines are added.
   * {<vbox> DOMElement}
   */
  _contentE : null,

  /**
   * A dummy element that displays a scrollbar.
   * {<vbox> DOMElement}
   */
  _scrollbarE : null,

  /**
   * Original, empty template for a line.
   * Not visible.
   * {<line> DOMElement}
   */
  _lineTemplate : null,

  /**
   * Currently displayed lines.
   * {Array of <line> DOMElement}
   */
  _lineElements : null,

  /**
   * Height of the DOM elements for a single line
   * {integer} in px
   */
  _lineHeight : null,

  /**
   * {Array of {Object}}
   */
  _entries : null,

  /**
   * First visible line
   * {integer} index position in this._entries
   */
  _scrollPos : 0,

  /**
   * Adds a line to the list
   * @param obj {Object} values for one line
   */
  addEntry : function(obj) {
    this._entries.push(obj);
    this._updateSize();
    this._refreshContent();
  },

  /**
   * Adds a number of lines to the list. Each array element is one line.
   * @param array {Array of Objects} values for  lines
   */
  addEntriesFromArray : function(array) {
    this._entries = this._entries.concat(array);
    this._updateSize();
    this._refreshContent();
  },

  /**
   * Populates DOM entries with the values from an object
   * By default, for each element with a field="foo" attribute,
   * it reads the corresponding obj.foo property and
   * writes it as text node into the element.
   * @param obj {Object} values for this line
   * @param lineE {<line> DOMElement}
   */
  fillLine : function(lineE, obj) {
    nodeListToArray(lineE.querySelectorAll("*[field]")).forEach(fieldE => {
      var fieldName = fieldE.getAttribute("field");
      var value = obj[fieldName];
      fieldE.textContent = value;
    });
  },

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the lines.
   */
  _updateSize : function() {
    var size = this._entries.length;
    var scrollHeight = this._lineHeight * size;
    //var availableHeight = this._getHeight(this._contentE);
    var availableHeight = this._listE.offsetHeight - this._lineHeight - 3; // TODO

    var needLines = Math.min(size, Math.round(availableHeight / this._lineHeight));
    var newLines = needLines - this._lineElements.length;
    if (newLines > 0) {
      for (var i = 0; i < newLines; i++) {
        var newLineE = this._lineTemplate.cloneNode(true);
        this._contentE.appendChild(newLineE);
        this._lineElements.push(newLineE);
      }
    } else if (newLines < 0) {
      for (var i = 0; i < -newLines; i++) {
        var oldLineE = this._lineElements.pop();
        this._contentE.removeChild(oldLineE);
      }
    }

    this._scrollbarE.scrollHeight = scrollHeight;
    if (scrollHeight > availableHeight) {
      this._scrollbarE.setAttribute("hidden", false);
    } else {
      this._scrollbarE.setAttribute("hidden", true);
    }
  },

  _getHeight : function(el) {
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
    return el.offsetHeight;
    /*
    var height = el.getBoundingClientRect().height;
    // getBoundingClientRect does not include margin
    var style = window.getComputedStyle(el);
    height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    height += parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    nodeListToArray(el.childNodes).forEach(
          childNode => height += childNode.nodeType == 1 ? this._getHeight(childNode) : 0);
    return height;
    */
  },

  /**
   * Displays the values at the current scroll position.
   * Call this after
   * - scrolling
   * - adding or removing entries
   */
  _refreshContent : function() {
    // TODO be lazy, avoid unnecessary refreshs
    var renderLine = this._scrollPos;
    this._lineElements.forEach(lineE => {
      var obj = this._entries[renderLine++];
      if (!obj) {
        return;
      }
      this.fillLine(lineE, obj);
    });
  },

  scrollWheel : function(event) {
    var scrollLines = 3; // How many lines to scroll each time
    if (event.deltaY > 0) {
      this._scrollPos = Math.min(this._scrollPos + scrollLines, this._entries.length - this._lineElements.length);
      //this._scrollbarE.scrollTop = Math.min(this._scrollbarE.scrollTop + this._lineHeight, this._scrollbarE.scrollHeight);
    } else if (event.deltaY < 0) {
      this._scrollPos = Math.max(this._scrollPos - scrollLines, 0);
      //this._scrollbarE.scrollTop = Math.max(this._scrollbarE.scrollTop - this._lineHeight, 0);
    }
    this._refreshContent();
  },

  scrollBar : function(event) {
    this._scrollPos = Math.round(this._scrollbarE.scrollTop / this._lineHeight); // TODO ceil()?
  },
}
