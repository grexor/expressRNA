var loaded_documents = 0;
var zoom_interval = undefined;

function document_loaded() {
  loaded_documents += 1;
  all_documents_loaded();
}

function analyses_document_loaded() {
  loaded_documents += 1;
  search_analyses();
  all_documents_loaded();
}

function libraries_document_loaded() {
  loaded_documents += 1;
  search_libraries();
  all_documents_loaded();
}

function login_done(force=false) {
  $("#content_about").load("about.html?nocache="+nocache, document_loaded);
  $("#content_profile").load("profile.html?nocache="+nocache, document_loaded);
  $("#content_info").load("info.html?nocache="+nocache, document_loaded);
  $("#content_help").load("help.html?nocache="+nocache, document_loaded);
  $("#content_analyses").load("analyses.html?nocache="+nocache, analyses_document_loaded);
  $("#content_libraries").load("libraries.html?nocache="+nocache, libraries_document_loaded);
  $("#content_library").load("library.html?nocache="+nocache, document_loaded);
  $("#content_analysis").load("analysis.html?nocache="+nocache, document_loaded);
  $("#content_licence").load("licence.html?nocache="+nocache, document_loaded);
}

function all_documents_loaded() {
if (loaded_documents<9) {
  return;
}
if (pars["action"]=="about")
    open_about();
else if (pars["action"]=="info")
    open_info();
else if (pars["action"]=="help")
    open_help();
else if (pars["action"]=="libraries")
    open_libraries();
else if (pars["action"]=="analyses")
    open_analyses();
else if (pars["action"]=="licence")
    open_licence();
else if (pars["action"]=="analysis")
    open_analysis(pars["analysis_id"]);
else if (pars["action"]=="library")
    open_library(pars["library_id"]);
else
  open_about(); // default
}

function window_resize() {
resize_samples_tree();
resize_taxa_tree();
}

function window_scroll() {
scroll_samples_adjust();
}
