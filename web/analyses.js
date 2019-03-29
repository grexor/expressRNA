menu_select("link_search");

function new_analysis() {
  html = "<b>New Analysis</b><br>";
  html += "Please contact us over <b><a href='mailto:expressrna@gmail.com' target=_new style='text-decoration: none;'>e-mail</a></b> to establish new analysis. We are working on a new interface that will automate the process, meanwhile we are happy to help defining the analysis for you." + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Close' }),
      ],
      callback: function (data) {
          if (!data) {
          } else {
          }
      }
  })
}

function search_analyses() {
  $("body").addClass("waiting");
  $("#label_search_analyses").show();
  try {
    lbl_search = String($('#area_analyses_search').tagEditor('getTags')[0].tags.join("|||"));
  } catch (err) {
    lbl_search = "";
  }
  $("#icon_analyses").attr("src", "media/comparisons.png");
  $("#div_analyses").attr("class", "title_font_selected");
  post_data = {};
  post_data["action"] = "list_analysis";
  post_data["sort_by"] = db["analyses"]["current_column_sort"];
  post_data["current_page"] = db["analyses"]["current_page"];
  post_data["records_per_page"] = db["analyses"]["records_per_page"];
  post_data["search"] = lbl_search;
  if (google_user!=undefined)
    post_data["email"] = google_user.getBasicProfile().getEmail();
  post_data["search"] = lbl_search;
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
          $("body").removeClass("waiting");
          db["analyses"]["query"] = $.parseJSON(result);
          display_analyses(db["analyses"]["query"]);
      })
      .error(function(){
        $("body").removeClass("waiting");
  })
}

function sort_analyses_by(column_id) {
  columns = ["name", "notes", "analysis_id", "last_change"]
  for (var i=0; i<columns.length; i++) {
    if ( (db["analyses"]["current_column_sort"]==columns[i]+":asc") && (column_id==columns[i]) ) {
      db["analyses"]["current_column_sort"] = columns[i] + ":desc";
      search_analyses();
      return;
    }
    if ( (db["analyses"]["current_column_sort"]==columns[i]+":desc") && (column_id==columns[i]) ) {
      db["analyses"]["current_column_sort"] = columns[i]+":asc";
      search_analyses();
      return;
    }
    if ( (db["analyses"]["current_column_sort"]!=columns[i]+":desc") && (db["analyses"]["current_column_sort"]!=columns[i]+":asc") && (column_id==columns[i]) ) {
      db["analyses"]["current_column_sort"] = columns[i]+":asc";
      search_analyses();
      return;
    }
  }
}

function html_arrow_analyses(order_by, column_id) {
  columns = ["name", "notes", "analysis_id", "last_change"]
  for (var i=0; i<columns.length; i++) {
    if ( (db["analyses"]["current_column_sort"]==columns[i] + ":asc") && (column_id==columns[i]) ) {
      return "&#9660;"
    }
    if ( (db["analyses"]["current_column_sort"]==columns[i]+":desc") && (column_id==columns[i]) ) {
      return "&#9650;"
    }
  }
  return "";
}

function display_analyses(data) {
  temp = db["analyses"]["query"]["data"];
  $("#div_control_analyses").hide();
  if (google_user!=undefined)
    if (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")
      $("#div_control_analyses").show();

  html_header = "<div style='float:left;'>"
  html_header += "<div onclick=\"sort_analyses_by('name')\" style='user-select: none; width: 60px; text-align: center; cursor: pointer; margin-right: 15px; float: left; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Name <div class=arrow>" + html_arrow_analyses(db["analyses"]["current_column_sort"], "name") + "</div></div>";
  html_header += "<div onclick=\"sort_analyses_by('notes')\" style='user-select: none; width: 60px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Notes <div class=arrow>" + html_arrow_analyses(db["analyses"]["current_column_sort"], "notes") + "</div></div>";
  html_header += "<div onclick=\"sort_analyses_by('analysis_id')\" style='user-select: none; width: 80px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Analysis ID <div class=arrow>" + html_arrow_analyses(db["analyses"]["current_column_sort"], "analysis_id") + "</div></div>";
  html_header += "<div onclick=\"sort_analyses_by('last_change')\" style='user-select: none; width: 90px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Last Change <div class=arrow>" + html_arrow_analyses(db["analyses"]["current_column_sort"], "last_change") + "</div></div>";
  html_header += "</div>";

  html_header += "<div>" + make_analyses_pagination_html() + "</div>"

  html_header += "<div style='font-size=11px; padding-top: 10px; padding-bottom: 5px;'>Displaying " + temp.length + " of " + db["analyses"]["query"].count + " analyses</div>";

  $("#table_analyses_header").html(html_header);

  html = "<div style='padding-top: 150px'>";

  for (var i=0; i<Math.min(100, temp.length); i++) {
      analysis_id = temp[i].comps_id;
      analysis_name = temp[i].comps_name;
      analysis_notes = temp[i].notes;
      analysis_authors = temp[i].authors;
      analysis_authors_search = temp[i].authors_search;
      analysis_name_search = temp[i].comps_name_search;
      analysis_notes_search = temp[i].notes_search;
      html += "<div class=div_analyses_result>";
      html += "<div><img src='media/analysis4.png' style='height:14px; padding-right: 3px; vertical-align:middle;'><b><a href=\"javascript:open_analysis('" + analysis_id + "', 'es', 'same');\">" + analysis_id + "</b></a></div>"
      html += "<div style='padding-left: 15px;'>";
      html += "<div><b>Name</b>: " + analysis_name_search + "</div>"
      html += "<div><b>Genome</b>: " + temp[i].genome_search + "</div>"
      html += "<div><b>Method</b>: " + temp[i].method_search + "</div>"
      html += "<div><b>Notes</b>: " + analysis_notes_search + "</div>";
      html += "<div><b>Authors</b>: " + analysis_authors_search.split(",").join(", ") + "</div>";
      html += "<div><b>Last Change</b>: " + format_date_time(new Date(temp[i].last_change)) + "</div>";
      html += "</div>";
      html += "</div>";
  }

  html += "</div>";

  $("#table_analyses").html(html);
  $("#select_analyses_pages option[value="+db["analyses"]["records_per_page"]+"]").prop('selected', true);
  tippy('.btn', {theme: 'light', interactive: true});
}

function make_analyses_pagination_html() {
  db["analyses"]["all_pages"] = Math.ceil(db["analyses"]["query"]["count"]/db["analyses"]["records_per_page"]);
  navigation_html = "<div class='pagination'>";
  display_page_from = db["analyses"]["current_page"]/db["analyses"]["display_pages"] >> 0;
  displaying_to = Math.min(db["analyses"]["query"]["count"], ((db["analyses"]["current_page"]+1)*db["analyses"]["records_per_page"]))
  if (db["analyses"]["current_page"]>0) {
    navigation_html += "<a href='javascript:go_to_page_analyses(" + (db["analyses"]["current_page"]-1) + ")'>&laquo;</a> ";
  } else {
    navigation_html += "<a>&laquo;</a> ";
  }
  for (var i=display_page_from*db["analyses"]["display_pages"]; i<(display_page_from*db["analyses"]["display_pages"]+db["analyses"]["display_pages"]); i++) {
    if (i==db["analyses"]["current_page"]) {
      navigation_html += "<a href='javascript:go_to_page_analyses(" + i + ")' class='active'>" + (i+1) + "</a> ";
    } else if (i<db["analyses"]["all_pages"]) {
      navigation_html += "<a href='javascript:go_to_page_analyses(" + i + ")'>" + (i+1) + "</a> ";
    } else {
      navigation_html += "<a class='inactive'>" + (i+1) + "</a> ";
    }
  }
  if (db["analyses"]["current_page"]<(db["analyses"]["all_pages"]-1)) {
    navigation_html += "<a href='javascript:go_to_page_analyses(" + (db["analyses"]["current_page"]+1) + ")'>&raquo;</a> ";
  } else {
    navigation_html += "<a class='inactive'>&raquo;</a> ";
  }
  navigation_html += "<select style='outline: none; margin-left: 5px; margin-right: 12px; margin-top: 1px;' id='select_analyses_pages' onchange='analyses_change_page_items(this);'><option value=20>20</option><option value=50>50</option><option value=100>100</option><option value=200>200</option></select>";
  navigation_html += "</div>";
  return navigation_html;
}

function go_to_page_analyses(page) {
  db["analyses"]["current_page"] = page;
  search_analyses();
}

function analyses_change_page_items(element) {
  db["analyses"]["current_page"] = 0;
  db["analyses"]["records_per_page"] = $("#" + element.id + " option:selected").text();
  search_analyses();
}

tippy('.btn', {theme: 'light', interactive: true});

function analyses_tags_reinit() {
  $('#area_analyses_search').tagEditor('destroy');
  $('#area_analyses_search').val("");
  //$('#area_analyses_search').tagEditor({initialTags: [], forceLowercase: false, delimiter: "||", placeholder: 'Enter keywords ...', autocomplete: {delay: 250, minLength:2}});
  $('#area_analyses_search').tagEditor({initialTags: [], beforeTagSave: area_analyses_search_beforesave, beforeTagDelete: area_analyses_search_tagdelete, forceLowercase: false, delimiter: "||", placeholder: 'Enter keywords ...', onChange: area_analyses_search_changed});
}

function area_analyses_search_beforesave() {

}

function area_analyses_search_changed(field, editor, tags) {
  search_analyses();
}

function area_analyses_search_tagdelete(field, editor, tags, val) {
  var new_tags = tags;
  var index = new_tags.indexOf(val);
  if (index > -1)
    new_tags.splice(index, 1);
  search_analyses_with(new_tags.join("|||"));
}

function search_analyses_with(tags) {
  analyses_tags_reinit();
  tags = tags.split("|||");
  for (var i=0; i<tags.length; i++) {
    $('#area_analyses_search').tagEditor('addTag', tags[i]);
  }
  search_analyses();
}

function add_analyses_filter(filter) {
  $('#area_analyses_search').tagEditor('addTag', filter);
}

analyses_tags_reinit();
