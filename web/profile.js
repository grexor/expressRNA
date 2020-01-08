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

function purchase_1h() {
  post_data = {};
  post_data["action"] = "purchase_support";
  if (google_user==undefined) {
    return;
  }
  post_data["email"] = google_user.getBasicProfile().getEmail();
  post_data["product"] = "1h";
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
        data = $.parseJSON(result);
        console.log(data.id);
        var stripe = Stripe('pk_test_r1L5jbo8b0Tpud5w2Fq3gtOp00z3betYb1');
        stripe.redirectToCheckout({
          // Make the id field from the Checkout Session creation API response
          // available to this file, so you can provide it as parameter here
          // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
          sessionId: data.id
        }).then(function (result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
        });
      })
      .fail(function(){
  });

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
  .done(function(result) {
  })
  .fail(function(){
  })
}

function display_user_access() {
  alevel = db["access_levels"][db["user"]["usertype"]];
  if (db["user"]["usertype"]=="guest") {
    html = "Guest user<br><br>Full access to published data and explorative analysis of results.";
    $("#div_user_access").html(html);
  } else {
    html = "<b>Academic</b><br><br>";

    html += '<table border=0 width=100 style="color: #666666;">';
    html += '<tr><td style="padding-top: 5px;">';

    html += "<div style='position: relative;'><div id='div_user_libs_text' style='border: 1px solid #eeeeee; width: 200px; text-align: center; margin-bottom: 2px; padding-left: 3px; padding-right: 3px; border-radius: 3px; font-size: 11px;'>Libraries: 0 / 0</div><div id='div_user_libs_width' style='width: 100%; text-align: center; height: 100%; border-radius: 3px; background-color: #ffdddd; font-size: 10px; position: absolute; top: 0px; left: 0px; z-index: -100;'>&nbsp;</div></div>";
    html += "<div style='position: relative;'><div id='div_user_exps_text' style='border: 1px solid #eeeeee; width: 200px; text-align: center; margin-bottom: 2px; padding-left: 3px; padding-right: 3px; border-radius: 3px; font-size: 11px;'>Libraries: 0 / 0</div><div id='div_user_exps_width' style='width: 100%; text-align: center; height: 100%; border-radius: 3px; background-color: #ffdddd; font-size: 10px; position: absolute; top: 0px; left: 0px; z-index: -100;'>&nbsp;</div></div>";

    html += "</td></tr></table>";

    html += "<br>Note: maximum gzip FASTQ/FASTA file size (per experiment) = " + alevel["diskspace"] + " MB";
    $("#div_user_access").html(html);

    $("#div_user_libs_text").html(db["user"]["libs"]+" out of " + alevel["libraries"] +" libraries");
    $("#div_user_libs_width").css("width", Math.min(100, 100 * Number(db["user"]["libs"])/Number(alevel["libraries"])).toFixed(0)+"%");

    $("#div_user_exps_text").html(db["user"]["experiments"]+" out of " + alevel["experiments"] +" experiments");
    $("#div_user_exps_width").css("width", Math.min(100, 100 * Number(db["user"]["experiments"])/Number(alevel["experiments"])).toFixed(0) + "%");
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
  .done(function(result) {
    db["user"]["tickets"] = $.parseJSON(result);
    display_user_tickets(db["user"]["tickets"]);
  })
  .fail(function(){
  })
}

function display_user_tickets(tickets) {
  html = "<table class='es_table'>";
  html += "<tr style='background-color: #dfdfdf;'>";
  help1 = "Important only for expressRNA ticket tracking";
  help2 = "If this is empty, the ticket did not start processing yet";
  help3 = "";
  html += "<td valign=middle class=nowrap><font color=gray><b>Ticket ID</b></font><font class='btn' title='" + help1 + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle;'></font></td>";
  html += "<td valign=middle class=nowrap><font color=gray><b>Date Added</b></font></td>";
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
