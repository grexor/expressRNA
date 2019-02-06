menu_select("menu_contributors");

function scroll_to(name) {
  window.scrollTo(0, $(name).position().top-60);
}

function show_info(name) {
  buttons = ["news", "contributors", "server", "contact"];
  for (var i=0; i<buttons.length; i++) {
    $("#div_"+buttons[i]).hide();
    $("#btn_"+buttons[i]).css("background-color", "#f1f1f1");
  }

  $("#div_"+name).show();
  $("#btn_"+name).css("background-color", "#FFA07A");
}

show_info("news");
