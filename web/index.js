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
  $("#content_help").load("help.html?nocache="+nocache, document_loaded);
  $("#content_analyses").load("analyses.html?nocache="+nocache, analyses_document_loaded);
  $("#content_libraries").load("libraries.html?nocache="+nocache, libraries_document_loaded);
  $("#content_library").load("library.html?nocache="+nocache, document_loaded);
  $("#content_analysis").load("analysis.html?nocache="+nocache, document_loaded);
  $("#content_licence").load("licence.html?nocache="+nocache, document_loaded);
  $("#content_news_blog").load("news_blog.html?nocache="+nocache, document_loaded);
  $("#content_contributors").load("contributors.html?nocache="+nocache, document_loaded);
  $("#content_server_stats").load("server_stats.html?nocache="+nocache, document_loaded);
  $("#content_contact").load("contact.html?nocache="+nocache, document_loaded);
  $("#content_splash").load("splash.html?nocache="+nocache, document_loaded);
}

function all_documents_loaded() {
  if (loaded_documents<13) {
    return;
  }
    process_login_parameters(pars["action"], pars)
}

function process_login_parameters(action, data) {
  if (action=="profile")
      open_profile();
  else if (action=="about")
      open_about();
  else if (action=="info") {
      show_info(data["section"]);
  } else if (action=="help")
      open_help();
  else if (action=="libraries")
      open_libraries();
  else if (action=="analyses")
      open_analyses();
  else if (action=="licence")
      open_licence();
  else if (action=="analysis")
      open_analysis({"ctrlKey":0, "metaKey":0}, "http://www.expressrna.org/index.html?action=analysis&analysis_id="+data["analysis_id"], data["analysis_id"], data["module"], data["pair_type"]);
  else if (action=="library")
      open_library({"ctrlKey":0, "metaKey":0}, "http://www.expressrna.org/index.html?action=library&library_id="+data["library_id"], data["library_id"], data["module"]);
  else if (action=="newsblog")
      open_news_blog();
  else if (action=="contributors")
      open_contributors();
  else if (action=="server_stats")
      open_server_stats();
  else if (action=="contact")
      open_contact();
  else if (action=="splash")
      open_splash();
  else
    open_splash(); // default
}
