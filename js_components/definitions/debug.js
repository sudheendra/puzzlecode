/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// some functions useful for debugging

// add size functions to selections and transitions
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

 d3.transition.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

function assert(bool, message) {
  if (!bool) {
    alert(message)
    console.error(message)
  }
}

function assertLazy(message, func) {
  if (DEBUG) {
    assert(func(), message)
  }
}

// the index of the current test case
var TC_NAME = undefined
// the current test case
var TC = undefined
// the actual result of the tested function
var RESULT = undefined
// the filename of the current test
var TEST_FILENAME = undefined


/**
 * Usage: assign appropriate values to TC_NAME, TC, RESULT, and TEST_FILENAME
 * The test fails if bool == false
 */
function test(bool) {
  if (!bool) {
    alert("Failed test. See console logs for error messages.")
    console.error("Failed test '" + TC_NAME +"' in " + TEST_FILENAME)
    console.log("Test case:")
    console.dir(TC)
    console.log("Result:")
    console.dir(RESULT)
  }
}
