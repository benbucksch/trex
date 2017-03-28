function onLoad() {
  new Fastlist(E("list"));
  populate();
}
window.addEventListener("load", onLoad, false);

var count = 0;

function populate() {
  var fastlist = E("list").widget;
  var values = [];
  for (var i = 0; i < 100000; i++) {
    values.push({
      from: "Fred Flintstone",
      to: "Wilma Flintstone",
      subject: "Jaba daba doo! the " + (i + count + 1) + ". time",
      date: (i-3400) + "-03-01",
    });
  }
  fastlist.addEntriesFromArray(values);
  count += values.length;
}
