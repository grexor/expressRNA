menu_select("link_profile");

if (email!="public") {
  $("#profile_note").html("<b>Your expressRNA profile information</b><br><br>");
  $("#profile_email").html(email);
  $("#profile_btn_signout").html('<img src=media/signout.png height=13 style="margin-top:-3px;vertical-align:middle">&nbsp;<a href="#" onclick="signOut();">Sign out</a>');
} else {
  $("#profile_note").html("Your are currently not signed in to expressRNA.");
}
