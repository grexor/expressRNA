menu_select("link_about");

function open_contacts()
{
  tab_to_load = 'contact';
  load_page("info.html");
}

date = new Date();
day = String(date.getDate());
if (day.length==1)
  day = "0" + day;
month = String(date.getMonth());
if (month.length==1)
  month = "0" + month;
var timestamp = date.getFullYear()+"" + month + "" + day;

$.ajax({
  type: "GET",
  url: config["github_url"]+"?nocache="+nocache,
  })
  .done(function(data) {
          $("#lbl_commits").html(data);
  });

tippy('.btn', {theme: 'light', interactive: true});
