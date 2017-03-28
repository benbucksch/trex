function onLoad() {
  new Fastlist(E("list"));
}
window.addEventListener("load", onLoad, false);

function populate() {
  var fastlist = E("list").widget;
  var values = [];
  for (var i = 0; i < 10000; i++) {
    values.push({
      from: "Fred Flintstone",
      to: "Wilma Flintstone",
      subject: "Jaba daba doo! the " + (i + 1) + ". time",
      date: (i-3400) + "-03-01",
    });
  }
  fastlist.addEntriesFromArray(values);
}
