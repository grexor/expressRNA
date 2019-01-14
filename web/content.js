function open_help() {
  $("body").removeClass("waiting");
  menu_select("menu_help");
  hide_all();
  $("#content_help").show();
  add_history({"action":"help"}, "index.html?action=help");
}

function open_analyses() {
  $("body").removeClass("waiting");
  menu_select("menu_analyses");
  hide_all();
  $("#content_analyses").show();
  add_history({"action":"analyses"}, "index.html?action=analyses");
}

function open_libraries() {
  $("body").removeClass("waiting");
  menu_select("menu_libraries");
  hide_all();
  $("#content_libraries").show();
  add_history({"action":"libraries"}, "index.html?action=libraries");
}


function open_profile() {
  $("body").removeClass("waiting");
  menu_select("menu_profile");
  add_history("profile", "", "index.html?action=profile")
  hide_all();
  $("#content_profile").show();
  add_history({"action":"profile"}, "index.html?action=profile");
}

function open_about() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_about");
  $("#content_about").show();
  add_history({"action":"about"}, "index.html?action=about");
}

function open_licence() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_about");
  $("#content_licence").show();
  add_history({"action":"licence"}, "index.html?action=licence");
}

function open_info() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
  $("#content_info").show();
  add_history({"action":"info"}, "index.html?action=info");
}

function hide_all() {
  $("#content_about").hide();
  $("#content_profile").hide();
  $("#content_help").hide();
  $("#content_info").hide();
  $("#content_team").hide();
  $("#content_analyses").hide();
  $("#content_libraries").hide();
  $("#content_library").hide();
  $("#content_analysis").hide();
  $("#content_licence").hide();
}

function open_library(library_id) {
  db["library"]["library_module"] = "ex";
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_libraries");
  $("#content_library").show();
  get_library(library_id);
  add_history({"action":"library", "library_id":library_id}, "index.html?action=library&library_id="+library_id);
}

function open_analysis(analysis_id) {
  db["analysis"]["analysis_module"] = "es";
  db["analysis"]["pair_type"] = "same";
  db["analysis"]["clip_index"] = "0";
  db["analysis"]["go_aspect"] = "P";
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_analyses");
  $("#content_analysis").show();
  get_analysis(analysis_id);
  open_analysis_pair_type("same");
  add_history({"action":"analysis", "analysis_id":analysis_id}, "index.html?action=analysis&analysis_id="+analysis_id);
}
