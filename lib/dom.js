 /**
 * @fileOverview  Contains a set of rendering form definitions, each with its own
 * implementation of the isApplicableTo function for checking if a rendering form
 * can be applied to a problem type.
 * 
 * @author Gerd Wagner
 */
dom = {
 /**
  * Create a div element
  * 
  * @param {string} id
  * @param {string} classValues
  * 
  * @return {object}
  */
  createDiv: function( id, classValues, content) {
    var el = document.createElement("div");
    if (id) el.setAttribute("id", id);
    if (classValues) el.className = classValues;
    if (content) el.innerHTML = content;
    return el;
  },
  /**
  * Create a canvas element
  * 
  * @param {string} id
  * @param {string} classValues
  * 
  * @return {object}
  */
  createCanvas: function( id, classValues, content, width, height) {
    var el = document.createElement("canvas");
    if (id) el.setAttribute("id", id);
    if (classValues) el.className = classValues;
    if (content) el.innerHTML = content;
    if (width) el.width = width;
    if (height) el.height = height;
    return el;
  },
  /**
   * Create a span element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {object} content
   * 
   * @return {object}
   */
   createSpan: function (id, classValues, content) {
     var el = document.createElement("span");
     if (id) el.setAttribute("id", id);
     if (classValues) el.className = classValues;
     if (content) el.innerHTML = content;
     return el;
   },
   /**
    * Create an img element
    * 
    * @param {string} id
    * @param {string} classValues
    * @param {object} content
    * 
    * @return {object}
    */
    createImg: function (src, id, classValues) {
      var el = document.createElement("img");
      el.setAttribute("src", src);
      if (id) el.setAttribute("id", id);
      if (classValues) el.className = classValues;
      return el;
    },
 /**
  * Create an input element
  * 
  * @param {string} id
  * @param {string} classValues
  * @param {string} name
  * 
  * @return {object}
  */
  createNumInput: function( id, classValues, name) {
    var el = document.createElement("input");
    el.setAttribute("type", "number");
    if (id) el.setAttribute("id", id);
    if (classValues) el.className = classValues;
    if (name) el.setAttribute("name", name);
    return el;
  },
  /**
   * Create a button element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {object} content
   * @return {object}
   */
  createButton: function( id, classValues, content) {
    var el = document.createElement("button");
    el.setAttribute("type","button");
    if (id) el.setAttribute("id", id);
    if (classValues) el.className = classValues;
    if (content) el.innerHTML = content;
    return el;
  },
  /**
   * Create a fraction element 
   * 
   * @param {string} num [optional]  Either an integer or an element   
   * @param {string} denom [optional]  Either an integer or an element   
   * @return {object}
   */
  createFractionDiv: function ( num, denom, id, classValues) {
    var fracDiv = {};
    var fractionClasses = "number fraction";
    fracDiv = dom.createDiv( id, classValues ? classValues + fractionClasses : fractionClasses);
    // numerator
    if (!num) {
      numEl = dom.createSpan("", "numerator");      
    } else if (util.isInteger( num)) {
      numEl = dom.createSpan("", "numerator", num);
    } else numEl = num;
    fracDiv.appendChild( numEl);
    // horizontal rule
    fracDiv.appendChild( document.createElement("hr"));
    // denominator
    if (!denom) {
      denomEl = dom.createSpan("", "denominator");      
    } else if (util.isInteger( denom)) {
      denomEl = dom.createSpan("", "denominator", denom);
    } else denomEl = denom;
    fracDiv.appendChild( denomEl);
    return fracDiv;
},
  /**
   * Create a fraction input element
   * 
   * @return {object}
   */
  createFractionInput: function () {
    var el=null;
    var fractionInpEl = dom.createDiv( "", "fraction operator");
    // numerator
    el = dom.createNumInput("askedForNum", "askedFor numerator");
    el.addEventListener("input", oa.view.handleUserInputFractionChooser);
    fractionInpEl.appendChild(el);
    // horizontal rule
    el = document.createElement("hr");
    fractionInpEl.appendChild(el);
    // denominator
    el = dom.createNumInput("askedForDenom", "askedFor denominator");
    el.addEventListener("input", oa.view.handleUserInputFractionChooser);
    fractionInpEl.appendChild(el);
    return fractionInpEl;
  },
   /**
   * Remove all children of a node
   * 
   * @param {object} node
   */
  removeChildNodes: function (node) {
    while (node.hasChildNodes()) {
      node.removeChild( node.firstChild);
    }
  }
};
