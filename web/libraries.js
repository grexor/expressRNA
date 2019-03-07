function new_library() {
  html = "<b>New Library</b><br>";
  html += "Would you like to create a new library, a place where you can upload your experiments?" + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Create' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            new_library_do();
          }
      }
  })
}

function new_library_do() {
  post_data = {};
  post_data["action"] = "new_library";
  post_data["email"] = google_user.getBasicProfile().getEmail();
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
          search_libraries(); // refresh library list
          data = $.parseJSON(result);
          open_library(data.lib_id);
      })
      .error(function(){
  })
}

function search_libraries() {
  $("body").addClass("waiting");
  $("#label_search_libraries").show();
  lbl_search = $("#label_search_libraries").val();
  clear_selection();
  $("#icon_library").attr("src", "media/library.png");
  $("#div_libraries").attr("class", "title_font_selected");
  post_data = {};
  post_data["action"] = "list_libraries";
  post_data["sort_by"] = db["libraries"]["current_column_sort"];
  post_data["current_page"] = db["libraries"]["current_page"];
  post_data["records_per_page"] = db["libraries"]["records_per_page"];
  post_data["search"] = lbl_search;
  if (google_user!=undefined)
    post_data["email"] = google_user.getBasicProfile().getEmail();
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
          $("body").removeClass("waiting");
          db["libraries"]["query"] = $.parseJSON(result);
          display_libraries(db["libraries"]["query"]);
      })
      .error(function(){
        $("body").removeClass("waiting");
  })
}

function sort_libraries_by(column_id) {
  columns = ["name", "notes", "method", "lib_id"]
  for (var i=0; i<columns.length; i++) {
    if ( (db["libraries"]["current_column_sort"]==columns[i]+":asc") && (column_id==columns[i]) ) {
      db["libraries"]["current_column_sort"] = columns[i] + ":desc";
      search_libraries();
      return;
    }
    if ( (db["libraries"]["current_column_sort"]==columns[i]+":desc") && (column_id==columns[i]) ) {
      db["libraries"]["current_column_sort"] = columns[i]+":asc";
      search_libraries();
      return;
    }
    if ( (db["libraries"]["current_column_sort"]!=columns[i]+":desc") && (db["libraries"]["current_column_sort"]!=columns[i]+":asc") && (column_id==columns[i]) ) {
      db["libraries"]["current_column_sort"] = columns[i]+":asc";
      search_libraries();
      return;
    }
  }
}

function html_arrow_libraries(order_by, column_id) {
  columns = ["name", "method", "notes", "lib_id"]
  for (var i=0; i<columns.length; i++) {
    if ( (db["libraries"]["current_column_sort"]==columns[i] + ":asc") && (column_id==columns[i]) ) {
      return "&#9660;"
    }
    if ( (db["libraries"]["current_column_sort"]==columns[i]+":desc") && (column_id==columns[i]) ) {
      return "&#9650;"
    }
  }
  return "";
}

function display_libraries() {
  temp = db["libraries"]["query"]["data"];
  $("#div_control_libraries").hide();
  if (db["user"]["usertype"]=="level2")
    $("#div_control_libraries").show();
  if (google_user!=undefined)
    if (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")
      $("#div_control_libraries").show();
  help_last_change = "Date of last update.";
  help_identifier = "The unique library identifier (ID), usually simply a date_name identifier which uniquelly locates the data in expressRNA. You can explore (view) the library contents by clicking on this link."
  help_type = "Currently supported sequencing protocols include:<br><br>Lexogen Quantseq Forward<br>Lexogen Quantset Reverse<br>Nanopore<br>Illumina RNA-seq<br><br>Other sequencing data can be added on request.";
  help_status = "Status of the library:<br><br>Complete: library is processed (aligned to the reference) and ready for exploration<br><font color=green>Processing</font>: library is currently processing<br><font color=red>Queued</font>: library is queued for processing<br><br>Queued libraries start processing when resources are available.";

  html_header = "<div style='float:left;'>"
  html_header += "<div onclick=\"sort_libraries_by('name')\" style='user-select: none; width: 60px; text-align: center; cursor: pointer; margin-right: 15px; float: left; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Name <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "name") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('notes')\" style='user-select: none; width: 60px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Notes <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "notes") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('method')\" style='user-select: none; width: 60px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Method <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "method") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('lib_id')\" style='user-select: none; width: 80px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Library ID <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "lib_id") + "</div></div>";
  html_header += "</div>";

  html_header += "<div>" + make_libraries_pagination_html() + "</div>"

  html_header += "<div style='font-size=11px; padding-top: 10px; padding-bottom: 5px;'>Displaying " + Math.min(temp.length, 100) + " of " + db["libraries"]["query"].count + " libraries</div>";

  $("#table_libraries_header").html(html_header);

  html = "<div style='padding-top: 150px'>";

  for (var i=0; i<Math.min(100, temp.length); i++) {
      lib_id = temp[i].lib_id;
      lib_id_search = temp[i].lib_id_search;
      name = temp[i].name;
      name_search = temp[i].name_search;
      notes = temp[i].notes;
      notes_search = temp[i].notes_search;
      last_change = format_date_time(new Date(temp[i].last_change));
      library_id_descriptive = lib_id;
      html += "<div class=div_library_result>";
      html += "<div style='color: #009900;'><img src='media/icon_data.png' style='height:12px; padding-right: 3px;'><a href=\"javascript:open_library('" + lib_id + "');\">" + library_id_descriptive + "</a></div>"
      html += "<div style='padding-left: 15px;'>";
      html += "<div><b>Name</b>: " + name_search + "</div>"
      html += "<div><b>Notes</b>: " + notes_search + "</div>";
      html += "<div><b>Genome</b>: " + temp[i].genome_search + "</div>";
      html += "<div><b>Method</b>: " + temp[i].method_search + "</div>";
      html += "<div><b>Status</b>: " + "<font color=gray>Complete</font>" + "</div>";
      html += "</div>";
      html += "</div>";
  }

  html += "</div>";

  $("#table_libraries").html(html);
  $("#select_libraries_pages option[value="+db["libraries"]["records_per_page"]+"]").prop('selected', true);
  tippy('.btn', {theme: 'light', interactive: true});
}

function clear_selection() {
  $("#icon_library").attr("src", "media/library.png");
  $("#div_libraries").attr("class", "title_font");
}

function make_libraries_pagination_html() {
  db["libraries"]["all_pages"] = Math.ceil(db["libraries"]["query"]["count"]/db["libraries"]["records_per_page"]);
  navigation_html = "<div class='pagination'>";
  display_page_from = db["libraries"]["current_page"]/db["libraries"]["display_pages"] >> 0;
  displaying_to = Math.min(db["libraries"]["query"]["count"], ((db["libraries"]["current_page"]+1)*db["libraries"]["records_per_page"]))
  if (db["libraries"]["current_page"]>0) {
    navigation_html += "<a href='javascript:go_to_page_libraries(" + (db["libraries"]["current_page"]-1) + ")'>&laquo;</a> ";
  } else {
    navigation_html += "<a>&laquo;</a> ";
  }
  for (var i=display_page_from*db["libraries"]["display_pages"]; i<(display_page_from*db["libraries"]["display_pages"]+db["libraries"]["display_pages"]); i++) {
    if (i==db["libraries"]["current_page"]) {
      navigation_html += "<a href='javascript:go_to_page_libraries(" + i + ")' class='active'>" + (i+1) + "</a> ";
    } else if (i<db["libraries"]["all_pages"]) {
      navigation_html += "<a href='javascript:go_to_page_libraries(" + i + ")'>" + (i+1) + "</a> ";
    } else {
      navigation_html += "<a class='inactive'>" + (i+1) + "</a> ";
    }
  }
  if (db["libraries"]["current_page"]<(db["libraries"]["all_pages"]-1)) {
    navigation_html += "<a href='javascript:go_to_page_libraries(" + (db["libraries"]["current_page"]+1) + ")'>&raquo;</a> ";
  } else {
    navigation_html += "<a class='inactive'>&raquo;</a> ";
  }
  navigation_html += "<select style='outline: none; margin-left: 5px; margin-right: 12px; margin-top: 1px;' id='select_libraries_pages' onchange='libraries_change_page_items(this);'><option value=20>20</option><option value=50>50</option><option value=100>100</option><option value=200>200</option></select>";
  navigation_html += "</div>";
  return navigation_html;
}

function go_to_page_libraries(page) {
  db["libraries"]["current_page"] = page;
  search_libraries();
}

function libraries_change_page_items(element) {
  db["libraries"]["current_page"] = 0;
  db["libraries"]["records_per_page"] = $("#" + element.id + " option:selected").text();
  search_libraries();
}

tippy('.btn', {theme: 'light', interactive: true});
