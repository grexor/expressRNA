var pars={};
window.location.search
  .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
    pars[key] = value.replace(/%20/g, " ").replace(/\+/g, "#")
  }
);
function login_ok(googleUser) {
    google_user = googleUser;
    $("#btn_signin").hide();
    $("#btn_signout").show();
    $("#div_user_detail").show();
    $("#tr_user_news").show();
    $("#tr_user_email").show();
    $("#btn_signout").html('<img src=media/icon_profile.png height=18 style="padding-right: 5px; margin-top:-4px;vertical-align:middle"><a href="javascript:open_profile();" id="link_profile">' + googleUser.getBasicProfile().getName() + '</a>');
    $("#profile_note").html("");
    $("#profile_email").html(googleUser.getBasicProfile().getEmail());
    $("#profile_btn_signout").html('<img src=media/signout.png height=13 style="margin-top:-3px;vertical-align:middle; padding-right: 3px;"><a href="#" onclick="signOut();">Sign out</a>');
    // update last login
    post_data = {};
    post_data["action"] = "login";
    post_data["email"] = googleUser.getBasicProfile().getEmail();
    $.post('/expressrna_gw/index.py', post_data)
    .success(function(result) {
        db["user"] = $.parseJSON(result);
        $("#chk_user_news").prop("checked", db["user"]["news"]);
        display_user_tickets(db["user"]["tickets"]);
        display_user_access();

        // refresh datasets that depend on login
        search_analyses();
        search_libraries();
        // after login, we can not do it before, that's why it's here
        if (pars["action"]=="libraries") {
          open_libraries();
        }
        if (pars["action"]=="analyses") {
          open_analyses();
        }
        if (pars["action"]=="library") {
          open_library(pars["library_id"]);
        }

    })
    .error(function(){
    })
}
function login_fail(error) {
  google_user = undefined;
  $("#btn_signin").show();
  $("#btn_signout").hide();
  $("#profile_note").html("Your are currently not signed in to expressRNA.");
}
function renderButton() {
  gapi.signin2.render('btn_signin', {
    'width': 70,
    'height': 22,
    'longtitle': false,
    'theme': 'dark',
    'onsuccess': login_ok,
    'onfailure': login_fail
  });
}
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  $("#btn_signin").show();
  $("#btn_signout").hide();
  $("#lbl_name").html('');
  email = "public";
  session = "";
}
function menu_clear() {
  $("#menu_about").attr('style', '');
  $("#menu_info").attr("style", "");
  $("#menu_help").attr('style', '');
  $("#menu_profile").attr('style', '');
  $("#menu_analyses").attr('style', '');
  $("#menu_libraries").attr('style', '');
}
function menu_select(name) {
  menu_clear();
  $("#" + name).attr('style', 'border-bottom: 2px solid #c1c1c1;');
}
function add_history(data, url) {
  if (pop_state==false)
    window.history.pushState(data, '', url);
}
window.addEventListener('popstate', function(e) {
  pop_state = true;
  if (e.state==null) {
    location.reload();
    pop_state = false;
    return;
  }
  if (e.state["action"]=="about")
      open_about();
  if (e.state["action"]=="info")
      open_info();
  if (e.state["action"]=="help")
      open_help();
  if (e.state["action"]=="libraries")
      open_libraries();
  if (e.state["action"]=="analyses")
      open_analyses();
  if (e.state["action"]=="analysis")
      open_analysis(db["analysis"]["analysis_id"]);
  if (e.state["action"]=="library")
      open_library(db["library"]["library_id"]);
  pop_state = false;
});
