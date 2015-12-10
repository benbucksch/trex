function onLoad() {
 var gStrings = new StringBundle("sample");
 translateElements(document, gStrings, {"brand": "TAppKit" });
}
window.addEventListener("load", onLoad, false);
