/**
 * Sample app, demo purposes only.
 */

function onLoad() {
  try {
    var gStrings = new StringBundle("sample");
    translateElements(document, gStrings, {"brand": "TAppKit" });

    var box = document.getElementById("intro-box");
    box.trex.hidden = true;
  } catch (e) { errorCritical(e); }
}
window.addEventListener("load", onLoad, false);


function errorCritical(msg) {
  console.error(msg);
  alert(msg);
}

function errorNonCritical(msg) {
  console.error(msg);
}
