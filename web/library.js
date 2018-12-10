menu_select("link_search");

function edit_library() {
  html = "<b>Library Edit</b> (" + library.lib_id + ")<br>";
  public_library = "";
  library_access = Object.assign([], library.access); // make object copy
  var index = library_access.indexOf("public");
  if (index > -1) {
      library_access.splice(index, 1);
      public_library = "checked";
  }
  library_owner = Object.assign([], library.owner); // make object copy
  columns = [];
  for (var i=0; i<library.columns.length; i++) {
    columns.push(library.columns[i][0]);
  }
  vex.dialog.open({
      unsafeMessage: html,
      input: [
          '<textarea name="lib_name" rows=1 placeholder="Name of Library" style="margin-bottom:10px;">' + library.name + '</textarea>',
          '<textarea name="lib_notes" rows=4 placeholder="Additional Notes">' + library.notes + '</textarea>',
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top width=270>',
          'Annotation Fields:<textarea style="margin-top: 3px;" name="lib_columns" rows=6 placeholder="Annotation Fields (one per line)">' + columns.join("\n") + '</textarea>',
          '</td><td valign=top width=270>',
          'Fields to Display:<textarea style="margin-top: 3px;" name="lib_columns_display" rows=6 placeholder="Display in Table (one per line)">' + columns.join("\n") + '</textarea>',
          '</td></tr></table>',
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top width=270>',
          'Allow access to:<textarea style="margin-top: 3px;" name="lib_access" rows=3 placeholder="Enter one e-mail per line">' + library_access.join("\n") + '</textarea>',
          '<input type=checkbox ' + public_library + ' id="lib_public" name="lib_public"><label class=unselectable for="lib_public">Make Library Public (visible to everyone)</label>',
          '</td><td valign=top width=270>',
          'Owners (can edit):<textarea style="margin-top: 3px;" name="lib_owner" rows=3 placeholder="Enter one e-mail per line">' + library_owner.join("\n") + '</textarea>',
          '</td></tr></table>',
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Save' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            if (data.lib_name==undefined) {
              data.lib_name = "";
            }
            if (data.lib_notes==undefined) {
              data.lib_notes = "";
            }
            if (data.lib_access==undefined) {
              data.lib_access = "";
            }
            data.lib_access = data.lib_access.split("\n");
            if (data.lib_public) {
              data.lib_access.push("public");
            }
            if (data.lib_owner==undefined) {
              data.lib_owner = "";
            }
            data.lib_owner = data.lib_owner.split("\n");
            save_library(library.lib_id, data);
          }
      }
  })
}

function delete_library() {
  html = "<b>Library Delete</b><br>";
  html += "Are you really sure you would like to delete this library and all it's experimental data? This is not reversible and you will have to re-upload the data in case you would still like to use the library." + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Delete' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            delete_library_do(library.lib_id);
          }
      }
  })
}

var upload_request = null;

function upload_experiment() {
  html = "<b>Experiment Upload</b><br>";
  html += "Here you can upload a gzipped FASTQ (.fastq.bz2) of your experiment sequence data. You can edit the experiment annotation after the upload.<br><br>"
  html += "<table border=0 style='font-size: inherit; color: #444;'>";
  html += "<tr>";
  html += "<td valign=top>";
  html += "<form id='form_eu' style='outline: none !important; margin-left: -8px;' name='form_eu' method='post' action='/expressrna_gw/index.py' enctype='multipart/form-data'>";
  html += "<label for='newfile' class='cfu'>Select FASTQ file</label>";
  html += "<input type='file' id='newfile' name='newfile' style='display: none;' accept='.gz,.bz2'>";
  html += "<input type='hidden' name='action' value='upload_file'>";
  html += "<input type='hidden' name='lib_id' value='" + library.lib_id + "'>";
  html += "</form>";
  html += "</td>";
  html += "<td valign=top>";
  html += "<div id='newfile_name' style=''>No file currently selected for upload</div>";
  html += "</td>";
  html += "</tr></table>";
  html += "<div id='div_library_progress' style='display:none; padding-left: 20px;'>";
  html += "Uploading file, please do not close this dialog until upload completes.<br>";
  html += "<div style='border-radius: 5px; border: 1px solid #999999; width: 500; color: #111111; text-align: center'><div id='div_library_perc' style='float: left; position: absolute; z-index: -1; width: 0; background-color: #779ecb;'>&nbsp;</div><div id='div_library_perc_text'>100%</div></div>";
  html += "</div>";
  var vex_upload = vex.dialog.open({unsafeMessage:html, showCloseButton: false, escapeButtonCloses: false, overlayClosesOnClick: false, buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Upload', id:'btn_library_upload' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel', id:'btn_library_cancel' })
        ],
        afterOpen: function(event) {
          $('input[name=newfile]').change(function(event) {
            filename = this.value;
            filename = filename.replace(/.*[\/\\]/, '');
            $("#newfile_name").html(filename + " (" + Math.round(this.files[0].size/1e6) + " MB)");
          });
        },
        onSubmit: function(event) {
            // prevent submit to close the dialog
            event.preventDefault();
            event.stopPropagation();
            $("#div_library_progress").show();
            // data = vex_upload.data; // not needed here, but could be used to get additional form data
            var buttons = document.getElementsByTagName('button');
            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                // disable Upload button
                if ($(button).html()=="Upload") {
                  button.disabled = true;
                  $(button).css("opacity", 0.1);
                  $(button).css("cursor", "default");
                }
            }
            upload_request = $.ajax({
                    url:'/expressrna_gw/index.py',
                    type:'post',
                    async: true,
                    cache: false,
                    contentType: false,
                    processData: false,
                    data:new FormData($('#form_eu')[0]),
                    xhr: function() {
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) {
                            // For handling the progress of the upload
                            myXhr.upload.addEventListener('progress', function(e) {
                              perc = Math.round(e.loaded / e.total * 100);
                              $("#div_library_perc").css("width", Math.round(500*(perc/100.0)));
                              $("#div_library_perc_text").html(perc + "%");
                            } , false);
                        }
                        return myXhr;
                    },
                    success:function(){
                        vex.close(vex_upload); // close dialog
                        get_library(library.lib_id); // refresh library experiments
                    }
                });

        },
        callback: function (data) {
            if (!data) {
              // cancel ajax call, upload cancelled
              if (upload_request!=null) {
                upload_request.abort();
                upload_request = null;
              }
            }
        }
      }
    );
}

  hide_library_all();

  function hide_library_all() {
    $("#btn_library_ex").css("background-color", "#e1e1e1");
    $("#btn_library_q").css("background-color", "#e1e1e1");
    $("#div_library_ex").hide();
    $("#div_library_q").hide();
  }

  function open_library_div(library_module) {
    hide_library_all();
    $("#div_library_" + library_module).show();
    $("#btn_library_" + library_module).css("background-color", "#c1c1c1");
  }

  function get_library(library_id) {
    db["library"]["library_id"] = library_id;
    $("body").addClass("waiting");
    post_data = {};
    post_data["action"] = "get_library";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["library_id"] = library_id;
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
            $("body").removeClass("waiting");
            library = $.parseJSON(result);
            db["library"]["query"] = library;
            html_library_genome = "<b>Genome</b>: " + library.genome_desc;
            html_library_method = "<b>Method</b>: " + library.method_desc;
            //if (library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) {
            if (google_user!=undefined)
              if (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com") {
                $("#btn_library_edit").show();
                $("#btn_library_upload").show();
                $("#btn_library_delete").show();
                html_library_genome += " | <a href=javascript:change_library_genome();>Change</a>";
                html_library_method += " | <a href=javascript:change_method();>Change</a>";
              }
            $("#lbl_library_id").html("<b>Library ID</b>: " + library.lib_id);
            $("#lbl_library_name").html("<b>Name</b>: " + library.name);
            $("#lbl_library_notes").html("<b>Notes</b>: " + library.notes);
            $("#lbl_library_genome").html(html_library_genome);
            $("#lbl_library_method").html(html_library_method);
            display_library_experiments(library.experiments)
            multiq_link = "https://expressrna.org/share/data/" + library_id + "/multiqc_report.html"+ "?nocache="+nocache;
            $.get(multiq_link).done(function () {
              $("#lbl_quality").html("Quality control of the data with MultiQC and Fastqc. You can also open the <a href=" + multiq_link +" target=_new>MultiQC report in a separate window</a>.");
              $("#plot1").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_adapter_content_plot_1.png?nocache="+nocache);
              $("#plot2").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_overrepresented_sequencesi_plot_1.png?nocache="+nocache);
              $("#plot3").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_per_base_n_content_plot_1.png?nocache="+nocache);
              $("#plot4").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_per_base_sequence_quality_plot_1.png?nocache="+nocache);
              $("#plot5").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_gc_content_plot_Counts.png?nocache="+nocache);
              $("#plot6").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_gc_content_plot_Percentages.png?nocache="+nocache);
              $("#plot7").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_quality_scores_plot_1.png?nocache="+nocache);
              $("#plot8").attr("src", "https://expressrna.org/share/data/" + library_id + "/multiqc_plots/png/mqc_fastqc_sequence_duplication_levels_plot_1.png?nocache="+nocache);
              $("#btn_library_q").show();
            }).fail(function () {
              $("#btn_library_q").hide();
              $("body").removeClass("waiting");
            });
            // final open library steps
            open_library_div(db["library"]["library_module"]);
        })
        .error(function(){
          $("body").removeClass("waiting");
    });
  }

  function save_library(library_id, data) {
    post_data = {};
    post_data["action"] = "save_library";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["library_id"] = library_id;
    post_data["lib_name"] = data.lib_name;
    post_data["lib_notes"] = data.lib_notes;
    post_data["lib_access"] = data.lib_access.join(",");
    post_data["lib_owner"] = data.lib_owner.join(",");
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
          get_library(library_id); // read back data from updated library
        })
        .error(function(){
    });
  }

  function delete_library_do(library_id) {
    post_data = {};
    post_data["action"] = "delete_library";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["library_id"] = library_id;
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
          open_libraries();
        })
        .error(function(){
    });
  }

function display_library_experiments(experiments) {
  html = "<center><br>";
  html += "List of all experiments in the library that you have access to.<br><br>"

  html += "<table class='es_table'>";
  html += "<tr style='background-color: #dfdfdf;'>";

  help_id = "Number of the experiment in the library, starting with 1 (e1).";
  help_aligned = "Percentage of uniquely aligned reads to the reference genome.";
  help_identifier = "The identifier links the experiment to the library. The identification is composed of: library_id (e.g. 20171212_data) + experiment_id (e.g. e1). This ID uniquely identifies the experiment data in expressRNA.";

  html += "<td><font color=gray><b>Number</b></font><font class='btn' title='" + help_id + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  //html += "<td><font color=gray><b>Identifier</b></font><font class='btn' title='" + help_identifier + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  for (var i=0; i<library.columns.length; i++) {
    html += "<td><font color=gray><b>" + library.columns[i][0] + "</b></font></td>";
  }
  html += "<td class=nowrap><font color=gray><b>Reads [M]</b></font></td>";
  html += "<td class=nowrap><font color=gray><b>Aligned [%]</b></font><font class='btn' title='" + help_aligned+ "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "<td class=nowrap><font color=gray><b>Downloads</b></font></td>";
  html += "</tr>";

  for (var i=0; i<experiments.length; i++)
  {
    html += "<tr style='font-weight: 300;'>";
    code_edit = "";
    if (google_user!=undefined)
      if (library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1)
          code_edit = "<a href='javascript:edit_experiment(" + experiments[i].exp_id + ");'><img src=media/edit.png style='height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'></a>";
    html += "<td class=nowrap align=center>" + code_edit + "e" + experiments[i].exp_id + "</td>";
    //html += "<td class=notes>" + experiments[i].lib_id + "_e" + experiments[i].exp_id + "</td>";

    for (var j=0; j<library.columns.length; j++) {
      column_name = library.columns[j][1];
      column_value = experiments[i][column_name];
      if (column_name=="method") {
        column_value = experiments[i]["method_desc"]
      }
      html += "<td class=nowrap>" + column_value + "</td>";
    }

    html += "<td class=nowrap align=center>" + experiments[i].stats[0] + " M</td><td class=nowrap align=center>" + experiments[i].stats[1] + "</td>";
    lib_id = experiments[i].lib_id;
    exp_id = experiments[i].exp_id;
    fastq_link = "https://expressrna.org/share/data/" + lib_id + "/e" + exp_id + "/" + lib_id + "_e" + exp_id + ".fastq.bz2";
    bam_link = "https://expressrna.org/share/data/" + lib_id + "/e" + exp_id + "/m1/" + lib_id + "_e" + exp_id + "_m1.bam";
    html += "<td class=nowrap><a href=" + fastq_link + ">FastQ</a> | <a href=" + bam_link + ">BAM</a></td>";
    html += "</tr>";
  }
  html += "</table>";
  $("#div_library_ex").html(html);
  tippy('.btn', {theme: 'light', interactive: true});
}

  function edit_experiment(exp_id) {
  }

tippy('.btn', {theme: 'light', interactive: true});
