function open_splash() {
  $("body").removeClass("waiting");
  hide_all();
  menu_clear();
  add_history({"action":"splash"}, "index.html?action=splash");
  $("#content_splash").show();
  $("#splash_intro").show();
}

function open_help() {
  $("body").removeClass("waiting");
  menu_select("menu_info");
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
  menu_select("btn_signout");
  add_history("profile", "", "index.html?action=profile")
  refetch_user_tickets();
  hide_all();
  $("#content_profile").show();
  add_history({"action":"profile"}, "index.html?action=profile");
}

function open_about() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
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
}

function load_content(filename, menu) {
  $("body").removeClass("waiting");
  hide_all();
  menu_select(menu);
  $("#content_load").load(filename);
  $("#content_load").show();
}

function open_news_blog() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
  $("#content_news_blog").show();
  add_history({"action":"newsblog"}, "index.html?action=newsblog");
}

function open_contributors() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
  $("#content_contributors").show();
  add_history({"action":"contributors"}, "index.html?action=contributors");
}

function open_server_stats() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
  $("#content_server_stats").show();
  add_history({"action":"server_stats"}, "index.html?action=server_stats");
  show_stats_experiments();
}

function open_contact() {
  $("body").removeClass("waiting");
  hide_all();
  menu_select("menu_info");
  $("#content_contact").show();
  add_history({"action":"contact"}, "index.html?action=contact");
}

function hide_all() {
  $("#content_about").hide();
  $("#content_profile").hide();
  $("#content_help").hide();
  $("#content_team").hide();
  $("#content_analyses").hide();
  $("#content_libraries").hide();
  $("#content_library").hide();
  $("#content_analysis").hide();
  $("#content_licence").hide();
  $("#content_news_blog").hide();
  $("#content_contributors").hide();
  $("#content_server_stats").hide();
  $("#content_contact").hide();
  $("#content_splash").hide();
  $("#content_load").hide();
  $("#splash_intro").hide();
}

function open_library(event, url, library_id, library_module) {
  if (event.ctrlKey || event.metaKey) {
    window.open(url);
  } else {
    db["library"]["library_module"] = library_module;
    $("body").removeClass("waiting");
    hide_all();
    menu_select("menu_libraries");
    $("#content_library").show();
    get_library(library_id);
  }
}

function open_analysis(event, url, analysis_id, analysis_module, pair_type) {
  if (event.ctrlKey || event.metaKey) {
    window.open(url);
  } else {
    db["analysis"]["analysis_module"] = analysis_module;
    db["analysis"]["pair_type"] = pair_type;
    db["analysis"]["clip_index"] = "0";
    db["analysis"]["go_aspect"] = "P";
    $("body").removeClass("waiting");
    hide_all();
    menu_select("menu_analyses");
    $("#content_analysis").show();
    get_analysis(analysis_id, pair_type);
  }  
}
