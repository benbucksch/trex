function Fastlist(element) {
  assert(element && element.localName == "fastlist");
  this._listE = element;
  element.widget = this;
  this._entries = [];
  this._rowElements = [];
  this._rowTemplate = this._listE.querySelector("row");
  assert(this._rowTemplate);
  this._rowHeight = this._getHeight(this._rowTemplate); // TODO consider vertical padding
  removeElement(this._rowTemplate);
  var tableE = cE(this._listE, "table", null, { cellspacing: 0 });
  var headerRowE = this._listE.querySelector("header");
  removeElement(headerRowE );
  var theadE = cE(tableE, "thead");
  theadE.appendChild(headerRowE);
  this._contentE = cE(tableE, "tbody", "content", { flex : 1 });

  this._scrollbarE = cE(this._listE, "div", "scrollbar");
  this._scrollbarE.addEventListener("scroll", event => this.scrollBar(event), false);
  this._listE.addEventListener("wheel", event => this.scrollWheel(event), false);
}
Fastlist.prototype = {
  /**
   * {<fastlist> DOMElement}
   */
  _listE : null,

  /**
   * Where the actual rows are added.
   * {<vbox> DOMElement}
   */
  _contentE : null,

  /**
   * A dummy element that displays a scrollbar.
   * {<vbox> DOMElement}
   */
  _scrollbarE : null,

  /**
   * Original, empty template for a row.
   * Not visible.
   * {<row> DOMElement}
   */
  _rowTemplate : null,

  /**
   * Currently displayed rows.
   * {Array of <row> DOMElement}
   */
  _rowElements : null,

  /**
   * Height of the DOM elements for a single row
   * {integer} in px
   */
  _rowHeight : null,

  /**
   * {Array of {Object}}
   */
  _entries : null,

  /**
   * First visible row
   * {integer} index position in this._entries
   */
  _scrollPos : 0,

  /**
   * Adds a row to the list
   * @param obj {Object} values for one row
   */
  addEntry : function(obj) {
    this._entries.push(obj);
    this._updateSize();
    this._refreshContent();
  },

  /**
   * Adds a number of rows to the list. Each array element is one row.
   * @param array {Array of Objects} values for  rows
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
   * @param obj {Object} values for this row
   * @param rowE {<row> DOMElement}
   */
  fillLine : function(rowE, obj) {
    nodeListToArray(rowE.querySelectorAll("*[field]")).forEach(fieldE => {
      var fieldName = fieldE.getAttribute("field");
      var value = obj[fieldName];
      fieldE.textContent = value;
    });
  },

  /**
   * Call this when either the number of entries changes,
   * or the DOM size of <fastlist> changes.
   * Updates the DOM elements with the rows.
   */
  _updateSize : function() {
    var size = this._entries.length;
    var scrollHeight = this._rowHeight * size;
    //var availableHeight = this._getHeight(this._contentE);
    var availableHeight = this._listE.offsetHeight - this._rowHeight - 3; // TODO

    var needLines = Math.min(size, Math.round(availableHeight / this._rowHeight));
    var newLines = needLines - this._rowElements.length;
    if (newLines > 0) {
      for (var i = 0; i < newLines; i++) {
        var newLineE = this._rowTemplate.cloneNode(true);
        this._contentE.appendChild(newLineE);
        this._rowElements.push(newLineE);
      }
    } else if (newLines < 0) {
      for (var i = 0; i < -newLines; i++) {
        var oldLineE = this._rowElements.pop();
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
    this._rowElements.forEach(rowE => {
      var obj = this._entries[renderLine++];
      if (!obj) {
        return;
      }
      this.fillLine(rowE, obj);
    });
  },

  scrollWheel : function(event) {
    var scrollLines = 3; // How many rows to scroll each time
    if (event.deltaY > 0) {
      this._scrollPos = Math.min(this._scrollPos + scrollLines, this._entries.length - this._rowElements.length);
      //this._scrollbarE.scrollTop = Math.min(this._scrollbarE.scrollTop + this._rowHeight, this._scrollbarE.scrollHeight);
    } else if (event.deltaY < 0) {
      this._scrollPos = Math.max(this._scrollPos - scrollLines, 0);
      //this._scrollbarE.scrollTop = Math.max(this._scrollbarE.scrollTop - this._rowHeight, 0);
    }
    this._refreshContent();
  },

  scrollBar : function(event) {
    this._scrollPos = Math.round(this._scrollbarE.scrollTop / this._rowHeight); // TODO ceil()?
  },
}
