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
    process_login_parameters(pars["action"], pars)
}

function process_login_parameters(action, data) {
  console.log("PLP:"+action+":"+data);
  if (action=="profile")
      open_profile();
  else if (action=="about")
      open_about();
  else if (action=="info")
      open_info();
  else if (action=="help")
      open_help();
  else if (action=="libraries")
      open_libraries();
  else if (action=="analyses")
      open_analyses();
  else if (action=="licence")
      open_licence();
  else if (action=="analysis")
      open_analysis(data["analysis_id"], data["module"], data["pair_type"]);
  else if (action=="library")
      open_library(data["library_id"], data["module"]);
  else
    open_about(); // default
}
