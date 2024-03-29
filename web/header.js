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
    $("#btn_signout").html('<a class="nav-link text-nowrap" href="javascript:open_profile();" id="link_profile"><i class="far fa-smile"></i>&nbsp;' + googleUser.getBasicProfile().getName() + '</a>');
    $("#profile_note").html("");
    $("#profile_email").html(googleUser.getBasicProfile().getEmail());
    $("#profile_btn_signout").html('<img src=media/signout.png height=13 style="margin-top:-3px;vertical-align:middle; padding-right: 3px;"><a href="#" onclick="signOut();">Sign out</a>');
    // update last login
    post_data = {};
    post_data["action"] = "login";
    post_data["email"] = googleUser.getBasicProfile().getEmail();
    $.post('/expressrna_gw/index.py', post_data)
    .done(function(result) {
        db["user"] = $.parseJSON(result);
        $("#chk_user_news").prop("checked", db["user"]["news"]);
        display_user_tickets(db["user"]["tickets"]);
        display_user_access();

        // refresh datasets that depend on login
        search_analyses();
        search_libraries();
        // after login, we can not do it before, that's why it's here
        process_login_parameters(pars["action"], pars)
    })
    .fail(function(){
    })
}

function update_user_usage() {
  post_data = {};
  post_data["action"] = "update_user_usage";
  post_data["email"] = google_user.getBasicProfile().getEmail();
  $.post('/expressrna_gw/index.py', post_data)
  .done(function(result) {
      data = $.parseJSON(result);
      db["user"]["libs"] = data["libs"];
      db["user"]["experiments"] = data["experiments"];
      display_user_access();
  })
  .fail(function(){
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
    //console.log('User signed out.');
  });
  $("#btn_signin").show();
  $("#btn_signout").hide();
  $("#lbl_name").html('');
  email = "public";
  session = "";
}
function menu_clear() {
  $("#menu_about").attr('style', '');
  $("#menu_info").attr('style', '');
  $("#menu_help").attr('style', '');
  $("#menu_profile").attr('style', '');
  $("#menu_analyses").attr('style', '');
  $("#menu_libraries").attr('style', '');
  $("#menu_species").attr('style', '');
  $("#btn_signout").attr('style', '');
}

function menu_select(name) {
  menu_clear();
  $("#" + name).attr('style', 'background-color: #cc5555;');
}

function add_history(data, url) {
  if (pop_state==false) {
    if (last_url!=url) {
        window.history.pushState(data, '', url);
        //console.log("add history:"+url+":"+data);
      }
    last_url = url;
  }
  pop_state = false;
}

window.addEventListener('popstate', function(e) {
  pop_state = true;
  if (e.state==null) {
    location.reload();
    pop_state = false;
    return;
  }
  //console.log("popstate");
  process_login_parameters(e.state["action"], e.state)
});
