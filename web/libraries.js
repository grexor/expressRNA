function new_library() {

  alevel = db["access_levels"][db["user"]["usertype"]];
  if (Number(db["user"]["libs"])>=Number(alevel["libraries"])) {
    html = "<b>New Library</b><br>";
    html += "Unfortunatelly, you reached the maximum number of libraries you can create with your account type. Please <a href='mailto:gregor.rot@gmail.com?subject=expressRNA account upgrade'>contact us</a> for upgrading your account." + "<br>";
    vex.dialog.open({
        unsafeMessage: html,
        buttons: [
            $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
        ],
        callback: function (data) {
        }
    })
    return;
  }

  html = "<b>New Library</b><br>";
  html += "<div style='font-size: 13px'>Create new library: a container for your experiments sequence data</div>";

  genomes_html = "<select data-placeholder='Genome reference assembly and annotation (click to select)' onchange='adjust_library_cbutton();' id='select_genome' name='select_genome' size=7 style='margin-left: 2px; width: 450px; outline: none;'>";
  for (var genome in genomes)
      genomes_html += "<option style='font-size: 12px;' value='" + genome + "'>" + genomes[genome][1] + "</option>";
  genomes_html += "</select>";

  methods_html = "<select data-placeholder='Sequencing protocol (click and select)' onchange='adjust_library_cbutton();' id='select_method' name='select_method' size=10 style='margin-left: 2px; font-size: 12px; outline: none; width:400px'>";
  for (var method in methods)
      methods_html += "<option style='font-size: 12px;' value='" + method + "'>" + methods[method][1] + "</option>";
  methods_html += "</select>";

  seq_type_html = "";
  seq_type_html += "<label><input type='radio' style='margin-right: 5px;' name='seq_type' value='single' checked>Single-end sequencing</label>&nbsp;&nbsp;&nbsp;";
  seq_type_html += "<label><input type='radio' style='margin-right: 5px;' name='seq_type' value='paired'>Paired-end sequencing</label><br>";

  html += "<br>" + genomes_html + "<br>";
  html += "<br>" + methods_html + "<br>";
  html += "<br>" + seq_type_html;

  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Create', id:'btn_library_create' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel',  id:'btn_library_cancel' })
      ],
      afterOpen: function(event) {
        setTimeout(adjust_library_cbutton, 1); // this trick somehow works, otherwise the buttons are not yet in DOM
        $("#select_genome").chosen();
        $("#select_method").chosen();
      },
      callback: function (data) {
          if (!data) {
          } else {
            method = $('#select_method').find(":selected").val();
            genome = $('#select_genome').find(":selected").val();
            seq_type = $('input[name=seq_type]:checked').val();
            //new_library_do();
            new_library_do(genome, method, seq_type);
          }
      }
  })
}

function adjust_library_cbutton() {
  $('#btn_library_create').css("display", "none");
  var buttons = document.getElementsByTagName('button');
  var buttons = document.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      if ($(button).html()=="Create") {
        if ( ($('#select_method').find(":selected").val()==undefined) || ($('#select_genome').find(":selected").val()==undefined))
        {
          button.disabled = true;
          $(button).css("opacity", 0.1);
          $(button).css("cursor", "default");
        } else {
          button.disabled = false;
          $(button).css("opacity", 1);
          $(button).css("cursor", "pointer");
        }
      }
  }
}

function new_library_do(genome, method, seq_type) {
  post_data = {};
  post_data["action"] = "new_library";
  post_data["email"] = google_user.getBasicProfile().getEmail();
  post_data["genome"] = genome;
  post_data["method"] = method;
  post_data["seq_type"] = seq_type;
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
          search_libraries(); // refresh library list
          data = $.parseJSON(result);
          open_library({"ctrlKey":0, "metaKey":0}, "https://devel.expressrna.org/index.html?action=library&library_id="+data.lib_id, data.lib_id);
          update_user_usage();
      })
      .fail(function(){
  })
}

function search_libraries() {
  $("body").addClass("waiting");
  $("#label_search_libraries").show();

  /*
  try {
    lbl_search = String($('#area_libraries_search').tagEditor('getTags')[0].tags.join("|||"));
  } catch (err) {
    lbl_search = "";
  }
  */

  try {
    lbl_search = String($("#tags_libraries_search").tagsinput('items').join("|||"));
  } catch (err) {
    lbl_search = "";
  }

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
      .done(function(result) {
          $("body").removeClass("waiting");
          db["libraries"]["query"] = $.parseJSON(result);
          display_libraries(db["libraries"]["query"]);
      })
      .fail(function(){
        $("body").removeClass("waiting");
  })
}

function sort_libraries_by(column_id) {
  db["libraries"]["current_page"] = 0; // when sorting by clicking on a column, always reset page to 1 (0)
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
      $("#div_control_libraries").show();
  help_last_change = "Date of last update.";
  help_identifier = "The unique library identifier (ID), usually simply a date_name identifier which uniquelly locates the data in expressRNA. You can explore (view) the library contents by clicking on this link."
  help_type = "Currently supported sequencing protocols include:<br><br>Lexogen Quantseq Forward<br>Lexogen Quantset Reverse<br>Nanopore<br>Illumina RNA-seq<br><br>Other sequencing data can be added on request.";
  help_status = "Status of the library:<br><br>Complete: library is processed (aligned to the reference) and ready for exploration<br><font color=green>Processing</font>: library is currently processing<br><font color=red>Queued</font>: library is queued for processing<br><br>Queued libraries start processing when resources are available.";

  html_header = "<div style='float:left;'>"
  html_header += "<div onclick=\"sort_libraries_by('name')\" style='user-select: none; width: 80px; text-align: center; cursor: pointer; margin-right: 15px; float: left; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Name <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "name") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('notes')\" style='user-select: none; width: 80px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Notes <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "notes") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('method')\" style='user-select: none; width: 80px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Method <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "method") + "</div></div>";
  html_header += "<div onclick=\"sort_libraries_by('lib_id')\" style='user-select: none; width: 100px; text-align: center; cursor: pointer; margin-right: 15px; display: inline-block; border-radius: 5px; padding-left: 6px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px; background: #e1e1e1;'>Library ID <div class=arrow>" + html_arrow_libraries(db["libraries"]["current_column_sort"], "lib_id") + "</div></div>";
  html_header += "</div>";

  html_header += "<div>" + make_libraries_pagination_html() + "</div>"

  num_experiments = 0;
  for (var i=0; i<Math.min(100, temp.length); i++) {
    num_experiments += temp[i].num_experiments;
  }

  html_header += "<div style='font-size=11px; padding-top: 10px; padding-bottom: 5px;'>Displaying " + Math.min(temp.length, 100) + " of " + db["libraries"]["query"].count + " libraries. Displayed libraries store " + num_experiments + " experiments.</div>";

  $("#table_libraries_header").html(html_header);

  html = "";

  for (var i=0; i<Math.min(100, temp.length); i++) {
      lib_id = temp[i].lib_id;
      lib_id_search = temp[i].lib_id_search;
      name = temp[i].name;
      name_search = temp[i].name_search;
      notes = temp[i].notes;
      notes_search = temp[i].notes_search;
      last_change = format_date_time(new Date(temp[i].last_change));
      library_id_descriptive = "<b>" + lib_id + "</b>" + ", stores <b>" + temp[i].num_experiments + " experiments</b>";
      html += "<div class=div_library_result>";
      html += "<div style='color: #009900;'><img src='media/icon_data.png' style='height:12px; padding-right: 3px;'>";
      link_url = "https://expressrna.org/index.html?action=library&library_id=" + lib_id;
      html += "<a onclick=\"javascript:open_library(event, '" + link_url + "', '" + lib_id + "', 'ex'); return false;\" href=\"" + link_url + "\">" + library_id_descriptive + "</a></div>"
      html += "<div style='padding-left: 15px;'>";
      html += "<div><b>Name</b>: " + name_search + "</div>"
      html += "<div><b>Notes</b>: " + notes_search + "</div>";
      html += "<div><b>Genome</b>: " + temp[i].genome_search + "</div>";
      html += "<div><b>Method</b>: " + temp[i].method_search + "</div>";
      if (temp[i].tags_search!="")
        html += "<div><b>Tags</b>: " + temp[i].tags_search + "</div>";
      html += "<div><b>Status</b>: " + "<font color=gray>Complete</font>" + "</div>";
      html += "</div>";
      html += "</div>";
  }

  html += "";

  $("#table_libraries").html(html);
  $("#select_libraries_pages option[value="+db["libraries"]["records_per_page"]+"]").prop('selected', true);
  tippy('.etippy', {theme: 'light', interactive: true});
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

tippy('.etippy', {theme: 'light', interactive: true});

function libraries_tags_reinit() {
  $('#area_libraries_search').tagEditor('destroy');
  $('#area_libraries_search').val("");
  $('#area_libraries_search').tagEditor({initialTags: [], beforeTagSave: area_libraries_search_beforesave, beforeTagDelete: area_libraries_search_tagdelete, forceLowercase: false, delimiter: "||", placeholder: 'Enter keywords ...', onChange: area_libraries_search_changed});
}

function area_libraries_search_beforesave() {

}

function area_libraries_search_changed(field, editor, tags) {
  search_libraries();
}

function area_libraries_search_tagdelete(field, editor, tags, val) {
  var new_tags = tags;
  var index = new_tags.indexOf(val);
  if (index > -1)
    new_tags.splice(index, 1);
  search_libraries_with(new_tags.join("|||"));
}

function search_libraries_with(tags) {
  libraries_tags_reinit();
  tags = tags.split("|||");
  for (var i=0; i<tags.length; i++) {
    $('#area_libraries_search').tagEditor('addTag', tags[i]);
  }
  search_libraries();
}

function add_libraries_filter(filter) {
  $('#area_libraries_search').tagEditor('addTag', filter);
}

libraries_tags_reinit();

tippy('.etippy', {theme: 'light', interactive: true});
