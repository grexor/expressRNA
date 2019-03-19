menu_select("menu_computational");

function show_help(name) {
  buttons = ["computational"];
  for (var i=0; i<buttons.length; i++) {
    $("#div_"+buttons[i]).hide();
    $("#btn_"+buttons[i]).css("background-color", "#f1f1f1");
  }

  $("#div_"+name).show();
  $("#btn_"+name).css("background-color", "#FFA07A");
}

show_help("computational");
