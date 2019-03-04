menu_select("link_profile");

if (email!="public") {
  $("#profile_note").html("<b>Your expressRNA profile information</b><br><br>");
  $("#profile_email").html(email);
  $("#profile_btn_signout").html('<img src=media/signout.png height=13 style="margin-top:-3px;vertical-align:middle">&nbsp;<a href="#" onclick="signOut();">Sign out</a>');
} else {
  $("#profile_note").html("Your are currently not signed in to expressRNA.");
  $("#div_user_detail").hide();
  $("#tr_user_news").hide();
  $("#tr_user_email").hide();
}

function user_news_click() {
  db["user"]["news"] = !db["user"]["news"];
  save_user_data();
}

function save_user_data() {
  post_data = {};
  post_data["action"] = "save_login";
  post_data["data"] = JSON.stringify(db["user"]);
  $.post('/expressrna_gw/index.py', post_data)
  .success(function(result) {
  })
  .error(function(){
  })
}

function display_user_access() {
  alevel = db["access_levels"][db["user"]["usertype"]];
  if (db["user"]["usertype"]=="guest") {
    html = "Guest user<br><br>Full access to published data and explorative analysis of results.";
    $("#div_user_access").html(html);
  } else {
    html = "Academic user<br><br>Possibility to create <b>" + alevel["libraries"]+" libraries</b> and to upload up to <b>" + alevel["experiments"] + " experiments (maximum gzip FASTQ/FASTA file size " + alevel["diskspace"] + " MB)</b> and run basic analysis (differential polyadenylation)."
    $("#div_user_access").html(html);
  }
}

// refresh user tickets
function refetch_user_tickets() {
  post_data = {};
  if (google_user!=undefined)
    post_data["email"] = google_user.getBasicProfile().getEmail();
  else return;
  post_data["action"] = "refetch_tickets";
  $.post('/expressrna_gw/index.py', post_data)
  .success(function(result) {
    db["user"]["tickets"] = $.parseJSON(result);
    display_user_tickets(db["user"]["tickets"]);
  })
  .error(function(){
  })
}

function display_user_tickets(tickets) {
  html = "<table class='es_table'>";
  html += "<tr style='background-color: #dfdfdf;'>";
  help1 = "Important only for expressRNA ticket tracking";
  help2 = "If this is empty, the ticket did not start processing yet";
  help3 = "";
  html += "<td><font color=gray><b>Ticket ID</b></font><font class='btn' title='" + help1 + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "<td class=nowrap><font color=gray><b>Date Added</b></font></td>";
  html += "<td class=nowrap><font color=gray><b>Date Started</b></font><font class='btn' title='" + help2+ "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "<td class=nowrap><font color=gray><b>Date Finished</b></font></td>";
  html += "<td class=nowrap><font color=gray><b>Processing Time</b></font></td>";
  html += "<td class=nowrap><font color=gray><b>Description</b></font></td>";
  html += "<td class=nowrap align=center><font color=gray><b>Status</b></font></td>";
  html += "</tr>";
  for (ticket in tickets) {
    rec = tickets[ticket];
    if (rec.date_started==null)
      rec.date_started = "";
    if (rec.date_finished==null)
      rec.date_finished = "";
    html += "<tr style='font-weight: 300;'>";
    html += "<td class=nowrap align=center>" + rec.tid + "</td>";
    html += "<td class=nowrap align=center>" + rec.date_added + "</td>";
    html += "<td class=nowrap align=center>" + rec.date_started + "</td>";
    html += "<td class=nowrap align=center>" + rec.date_finished + "</td>";
    if (String(rec.processing_time)!="")
    {
      html += "<td class=nowrap align=center>" + rec.processing_time + " minutes</td>";
    } else {
      html += "<td class=nowrap align=center></td>";
    }
    html += "<td class=nowrap>" + rec.desc + "</td>";
    html += "<td class=nowrap align=center>" + {0:"queued", 1:"processing", 2:"finished"}[rec.status] + "</td>";
    html += "</tr>";
  }
  html += "</table>";
  if (Object.keys(tickets).length==0)
    $("#div_user_tickets").html("Currently, there are no tickets being queued or processed.");
  else
    $("#div_user_tickets").html(html);
  tippy('.btn', {theme: 'light', interactive: true});
}
