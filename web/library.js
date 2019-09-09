menu_select("link_search");

var file1ok = false;
var file2ok = false;
var experiment_display_function = "display_library_experiments2";
var timer_get_library_status;
var last_lib_status = "";

function edit_library() {
  html = "<b>Library Edit</b> (" + library.lib_id + ")<br>";
  html += "<div style='font-size: 12px; color: #444444;'>Annotating your experiments is super easy, simply provide annotation fields (one per line), and also provide which fields you would like to show in the table of the experiment (some fields can remain hidden).</div>"
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
  columns_display = [];
  for (var i=0; i<library.columns_display.length; i++) {
    columns_display.push(library.columns_display[i][0]);
  }
  vex.dialog.open({
      unsafeMessage: html,
      input: [
          '<textarea name="name" rows=1 placeholder="Name of Library" style="margin-bottom:10px;">' + library.name + '</textarea>',
          '<textarea name="notes" rows=4 placeholder="Additional Notes">' + library.notes.replace(/<br>/g,"\n") + '</textarea>',
          '<textarea name="tags" rows=2 placeholder="Tags">' + library.tags + '</textarea>',
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top width=270>',
          'Annotation Fields:<textarea style="margin-top: 3px;" name="columns" rows=6 placeholder="Annotation Fields (one per line)">' + columns.join("\n") + '</textarea>',
          '</td><td valign=top width=270>',
          'Fields to Display (show in experiments table):<textarea style="margin-top: 3px;" name="columns_display" rows=6 placeholder="Display in Table (one per line)">' + columns_display.join("\n") + '</textarea>',
          '</td></tr></table>',
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top width=270>',
          'Allow access to:<textarea style="margin-top: 3px;" name="access" rows=3 placeholder="Enter one e-mail per line">' + library_access.join("\n") + '</textarea>',
          '<input type=checkbox ' + public_library + ' id="lib_public" name="lib_public"><label class=unselectable for="lib_public">Make Library Public (visible to everyone)</label>',
          '</td><td valign=top width=270>',
          'Owners (can edit):<textarea style="margin-top: 3px;" name="owner" rows=3 placeholder="Enter one e-mail per line">' + library_owner.join("\n") + '</textarea>',
          '</td></tr></table>',
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Save' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            library.name = data.name;
            if (data.notes!=undefined) {
              library.notes = data.notes.replace(/\r\n|\r|\n/g,"<br>");
            } else {
              library.notes = "";
            }
            library.tags = data.tags;
            library.access = data.access.split("\n");
            if (data.lib_public)
              library.access.push("public");
            library.owner = data.owner;
            library.owner = data.owner.split("\n");
            // take care of columns
            library.columns = data.columns.split("\n");
            for (var i=0; i<library.columns.length; i++)
              library.columns[i] = [library.columns[i], library.columns[i].replace(" ", "_").toLowerCase()];
            if (library.columns[library.columns.length-1]==",") // remove last element if empty
              library.columns.pop();
            library.columns_display = data.columns_display.split("\n");
            for (var i=0; i<library.columns_display.length; i++)
              library.columns_display[i] = [library.columns_display[i], library.columns_display[i].replace(" ", "_").toLowerCase()];
            if (library.columns_display[library.columns_display.length-1]==",") // remove last element if empty
              library.columns_display.pop();
            save_library(library);
          }
      }
  })
}

function delete_library() {
  html = "<b>Library Delete for " + library.lib_id+ "</b><br>";
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

function delete_experiment(exp_id) {
  html = "<b>Experiment e" + exp_id + " from library " + library.lib_id+ "</b><br>";
  html += "Are you really sure you would like to delete this experiment from your library?" + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Delete' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            delete_experiment_do(exp_id);
          }
      }
  })
}

var upload_request = null;

function upload_experiment() {
    if (google_user==undefined)
      return;

    alevel = db["access_levels"][db["user"]["usertype"]];
    if (Number(db["user"]["experiments"])>=Number(alevel["experiments"])) {
      html = "<b>Upload Experiment</b><br>";
      html += "Unfortunatelly, you reached the maximum number of experiments you can create with your account type. Please <a href='mailto:gregor.rot@gmail.com?subject=expressRNA account upgrade'>contact us</a> for upgrading your account." + "<br>";
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

    if (library.genome=="") {
      html = "<b>Reference genome not selected</b><br>";
      html += "Please choose the reference genome of the library before uploading experiments. Simply click on the <b>Change</b> link near the <b>Genome: not selected</b> in the library page.<br>";
      vex.dialog.open({
          unsafeMessage: html,
          buttons: [
              $.extend({}, vex.dialog.buttons.NO, { text: 'OK' })
          ],
          callback: function (data) {
          }
      })
      return;
    }

  if (library.method=="") {
    html = "<b>Method not selected</b><br>";
    html += "Please choose the method of the library before uploading experiments. Simply click on the <b>Change</b> link near the <b>Method: not selected</b> in the library page.<br>";
    vex.dialog.open({
        unsafeMessage: html,
        buttons: [
            $.extend({}, vex.dialog.buttons.NO, { text: 'OK' })
        ],
        callback: function (data) {
        }
    })
    return;
  }

  html = "<b>Experiment Upload</b><br>";
  html += "Here you can upload a gzipped FASTQ (.fastq.bz2) of your experiment sequence data. You can edit the experiment annotation after the upload.<br><br>"
  html += "<form id='form_eu' style='outline: none !important; margin-left: -8px;' name='form_eu' method='post' action='/expressrna_gw/index.py' enctype='multipart/form-data'>";
  html += "<table border=0 style='font-size: inherit; color: #444;'>";
  html += "<tr>";
  html += "<td valign=top style='padding-bottom: 5px'>";
  if (library.seq_type=="single") {
    html += "<label for='newfile' class='cfu'>Select FASTQ file</label>";
    html += "<input type='file' id='newfile' name='newfile' style='display: none;' accept='.gz,.bz2'>";
    html += "<input type='hidden' name='action' value='upload_file'>";
    html += "<input type='hidden' name='email' value='" + google_user.getBasicProfile().getEmail() + "'>";
    html += "<input type='hidden' name='lib_id' value='" + library.lib_id + "'>";
    html += "</td>";
    html += "<td valign=top>";
    html += "<div id='newfile_name' style=''>Select FASTQ file</div>";
    html += "</td>";
    html += "</tr>";
  }
  if (library.seq_type=="paired") {
    html += "<label for='newfile' class='cfu'>Select FASTQ file (R1)</label>";
    html += "<input type='file' id='newfile' name='newfile' style='display: none;' accept='.gz,.bz2'>";
    html += "<input type='hidden' name='action' value='upload_file'>";
    html += "<input type='hidden' name='email' value='" + google_user.getBasicProfile().getEmail() + "'>";
    html += "<input type='hidden' name='lib_id' value='" + library.lib_id + "'>";
    html += "</td>";
    html += "<td valign=top>";
    html += "<div id='newfile_name' style=''>Select FASTQ file (R1)</div>";
    html += "</td>";
    html += "</tr>";
    html += "<tr>";
    html += "<td valign=top>";
    html += "<input type='file' id='newfile2' name='newfile2' style='display: none;' accept='.gz,.bz2'>";
    html += "<label for='newfile2' class='cfu'>Select FASTQ file (R2)</label>";
    html += "</td>";
    html += "<td valign=top>";
    html += "<div id='newfile2_name' style=''>Select FASTQ file (R2)</div>";
    html += "</td>";
    html += "</tr>";
  }
  html += "</table>";
  html += "<div id='div_library_progress' style='display:none; padding-left: 20px;'>";
  html += "Uploading file(s), please do not close this dialog until upload completes.<br>";
  html += "<div style='border-radius: 5px; border: 1px solid #999999; width: 500; color: #111111; text-align: center'><div id='div_library_perc' style='float: left; position: absolute; z-index: -1; width: 0; background-color: #779ecb;'>&nbsp;</div><div id='div_library_perc_text'>100%</div></div>";
  html += "</div>";
  html += "<br><label class=unselectable><input type=checkbox name='chk_upload_email' id='chk_upload_email'>Send me an e-mail when processing (mapping) of experiment is done</label>";
  html += "</form>";

  var vex_upload = vex.dialog.open({unsafeMessage:html, showCloseButton: false, escapeButtonCloses: false, overlayClosesOnClick: false, buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Upload', id:'btn_library_upload' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel', id:'btn_library_cancel' })
        ],
        afterOpen: function(event) {
          setTimeout(adjust_library_ubutton, 1, true);
          // TODO: update and add size limit
          $('input[name=newfile]').change(function(event) {
            alevel = db["access_levels"][db["user"]["usertype"]];
            if (Math.round(this.files[0].size/1e6)>Number(alevel["diskspace"])) {
              setTimeout(adjust_library_ubutton, 1, true); // disable upload button
              $("#newfile_name").html("File size too large for your account (max " + Number(alevel["diskspace"]) + " MB)");
              return;
            }
            if (library.seq_type=="single")
              setTimeout(adjust_library_ubutton, 1, false); // enable upload button
            if ((library.seq_type=="paired")&&(file2ok==true))
              setTimeout(adjust_library_ubutton, 1, false); // enable upload button
            file1ok = true;
            filename = this.value;
            filename = filename.replace(/.*[\/\\]/, '');
            $("#newfile_name").html(filename + " (" + Math.round(this.files[0].size/1e6) + " MB)");
          });
          if (library.seq_type=="paired") {
            $('input[name=newfile2]').change(function(event) {
              alevel = db["access_levels"][db["user"]["usertype"]];
              if (Math.round(this.files[0].size/1e6)>Number(alevel["diskspace"])) {
                setTimeout(adjust_library_ubutton, 1, true); // disable upload button
                $("#newfile2_name").html("File size too large for your account (max " + Number(alevel["diskspace"]) + " MB)");
                return;
              }
              if (file1ok==true)
                setTimeout(adjust_library_ubutton, 1, false); // enable upload button
              file2ok = true;
              filename = this.value;
              filename = filename.replace(/.*[\/\\]/, '');
              $("#newfile2_name").html(filename + " (" + Math.round(this.files[0].size/1e6) + " MB)");
            });
          } // paired
        },
        onSubmit: function(event) {
            // prevent submit to close the dialog
            event.preventDefault();
            event.stopPropagation();
            $("#div_library_progress").show();
            // data = vex_upload.data; // not needed here, but could be used to get additional form data
            setTimeout(adjust_library_ubutton, 1, true); // disable upload button
            upload_request = $.ajax({
                    url:'/expressrna_gw/index.py',
                    type:'post',
                    async: true,
                    cache: false,
                    contentType: false,
                    processData: false,
                    data:new FormData($('#form_eu')[0]),
                    xhr: function() {
                        $("#chk_upload_email").prop("disabled", true); // disable check box
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) {
                            // For handling the progress of the upload
                            myXhr.upload.addEventListener('progress', function(e) {
                              perc = Math.round(e.loaded / e.total * 100);
                              $("#div_library_perc").css("width", Math.round(498*(perc/100.0)));
                              $("#div_library_perc_text").html(perc + "%");
                            } , false);
                        }
                        return myXhr;
                    },
                    success:function(){
                        vex.close(vex_upload); // close dialog
                        get_library(library.lib_id); // refresh library experiments
                        update_user_usage();
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

function adjust_library_ubutton(sw) {
  var buttons = document.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      // disable Upload button
      if ($(button).html()=="Upload") {
        if (sw) {
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

  hide_library_all();

  function hide_library_all() {
    $("#btn_library_ex").css("background-color", "#e1e1e1");
    $("#btn_library_q").css("background-color", "#e1e1e1");
    $("#btn_library_ge").css("background-color", "#e1e1e1");
    $("#btn_library_ep").css("background-color", "#e1e1e1");
    $("#div_library_ex").hide();
    $("#div_library_q").hide();
    $("#div_library_ge").hide();
    $("#div_library_ep").hide();
  }

  function open_library_div(library_module) {
    db["library"]["library_module"] = library_module;
    hide_library_all();
    $("#div_library_" + library_module).show();
    $("#btn_library_" + library_module).css("background-color", "#c1c1c1");
    add_history({"action":"library", "library_id":library.lib_id, "module":library_module}, "index.html?action=library&library_id=" + library.lib_id + "&module="+library_module);
    if (library_module=="ep") {
      show_div_ep();
    }
  }

  function get_library(library_id) {
    db["library"]["library_id"] = library_id;
    $("body").addClass("waiting");
    try  {
      clearInterval(timer_get_library_status);
    } catch (err) {}
    timer_get_library_status = setInterval(get_library_status, 3000);
    post_data = {};
    post_data["action"] = "get_library";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["library_id"] = library_id;
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
            $("body").removeClass("waiting");
            if (result=="empty") {
              console.log("got empty library result");
              return;
            }
            library = $.parseJSON(result);
            db["library"]["query"] = library;
            html_library_genome = library.genome_desc;
            html_library_method = library.method_desc;
            html_library_seq_type = library.seq_type;
            html_library_tags = library.tags;
            if (google_user!=undefined)
            if ((library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) || (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")) {
                $("#btn_library_edit").show();
                $("#btn_library_upload").show();
                $("#btn_library_delete").show();
                html_library_genome += " | <a href=javascript:change_library_genome();>Change</a>";
                html_library_method += " | <a href=javascript:change_library_method();>Change</a>";
              }
            $("#lbl_library_id").html(library.lib_id);
            $("#lbl_library_name").html(library.name);
            $("#lbl_library_notes").html(library.notes);
            $("#lbl_library_genome").html(html_library_genome);
            $("#lbl_library_method").html(html_library_method);
            $("#lbl_library_seq_type").html(html_library_seq_type);
            $("#lbl_library_tags").html(html_library_tags);
            //display_library_experiments2(library.experiments)
            window[experiment_display_function](library.experiments);
            display_library_ge();
            multiq_link = config["data_url"] + library_id + "/multiqc_report.html"+ "?nocache="+nocache;
            $.get(multiq_link).done(function () {
              $("#lbl_quality").html("Quality control of the data with MultiQC and Fastqc. You can also open the <a href=" + multiq_link +" target=_new>MultiQC report in a separate window</a>.");

              // no adapter contamination? no image, check
              $.get(config["data_url"] + library_id + '/multiqc_plots/png/mqc_fastqc_adapter_content_plot_1.png?nocache='+nocache).done(function () {
                $("#plot1").show();
                $("#plot1").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_adapter_content_plot_1.png?nocache="+nocache);
              })
              .error(function(){
                $("#plot1").hide();
              });

              // no overrepresented? no image, check
              $.get(config["data_url"] + library_id + '/multiqc_plots/png/mqc_fastqc_overrepresented_sequencesi_plot_1.png?nocache='+nocache).done(function () {
                $("#plot2").show();
                $("#plot2").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_overrepresented_sequencesi_plot_1.png?nocache="+nocache);
              })
              .error(function(){
                $("#plot2").hide();
              });

              $("#plot3").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_per_base_n_content_plot_1.png?nocache="+nocache);
              $("#plot4").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_per_base_sequence_quality_plot_1.png?nocache="+nocache);
              $("#plot5").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_gc_content_plot_Counts.png?nocache="+nocache);
              $("#plot6").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_gc_content_plot_Percentages.png?nocache="+nocache);
              $("#plot7").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_per_sequence_quality_scores_plot_1.png?nocache="+nocache);
              $("#plot8").attr("src", config["data_url"] + library_id + "/multiqc_plots/png/mqc_fastqc_sequence_duplication_levels_plot_1.png?nocache="+nocache);
              $("#btn_library_q").show();
            }).fail(function () {
              $("#btn_library_q").hide();
              $("body").removeClass("waiting");
            });
            // final open library steps
            if (db["library"]["library_module"]==undefined) // default library module
              db["library"]["library_module"] = "ex";
            open_library_div(db["library"]["library_module"]);

            get_library_status();

            get_ep(initialize=1);

        })
        .error(function(){
          $("body").removeClass("waiting");
    });
  }

  function get_library_status() {
    post_data = {};
    post_data["action"] = "get_library_status";
    post_data["lib_id"] = library.lib_id;
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
          if (result!="") {
            $("#lbl_library_status").html('<b><font color=#aa0000>Library Status: processing</font></b><img src=media/spinner.gif style="height: 16px; margin-top:-3px;vertical-align:middle; padding-right: 3px; opacity: 0.7">')
            $('#div_library_ge').css("opacity", "0.2");
            $('#div_library_q').css("opacity", "0.2");
            $('#div_library_ep').css("opacity", "0.2");
          } else {
            $('#div_library_ge').css("opacity", "1");
            $('#div_library_q').css("opacity", "1");
            $('#div_library_ep').css("opacity", "1");
            $("#lbl_library_status").html('<b><font color=#00aa00>Library Status: complete</font></b>');
          }
          if (last_lib_status!=result)
            get_library(library.lib_id);
          last_lib_status = result;
        })
        .error(function(){
    });
  }


  function save_library(data) {
    post_data = {};
    post_data["action"] = "save_library";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["lib_id"] = data.lib_id;
    post_data["name"] = data.name;
    post_data["notes"] = data.notes;
    post_data["tags"] = data.tags;
    post_data["access"] = data.access.join(",");
    post_data["owner"] = data.owner.join(",");
    post_data["genome"] = data.genome;
    post_data["method"] = data.method;
    // add column if user added it to columns_display but not to columns
    for (var item in data.columns_display) {
      element = data.columns_display[item];
      present = false;
      for (var item2 in data.columns) {
        element2 = data.columns[item2];
        if (element[1]==element2[1])
          present = true;
      }
      if (!present)
        data.columns.push(element);
    }

    post_data["columns"] = JSON.stringify(data.columns);
    post_data["columns_display"] = JSON.stringify(data.columns_display);
    post_data["experiments"] = JSON.stringify(data.experiments);
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
          get_library(data.lib_id); // read back data from updated library
          search_libraries(); // refresh library list
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
          search_libraries();
          open_libraries();
          update_user_usage();
        })
        .error(function(){
    });
  }

  function delete_experiment_do(exp_id) {
    post_data = {};
    post_data["action"] = "delete_experiment";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["lib_id"] = library.lib_id;
    post_data["exp_id"] = exp_id;
    $.post('/expressrna_gw/index.py', post_data)
        .success(function(result) {
          get_library(library.lib_id);
          update_user_usage();
        })
        .error(function(){
    });
  }

function display_library_experiments(experiments) {
  html = "<br><center>";
  help_id = "Number of the experiment in the library, starting with 1 (e1).";
  help_aligned = "Percentage of uniquely aligned reads to the reference genome.";
  help_identifier = "The identifier links the experiment to the library. The identification is composed of: library_id (e.g. 20171212_data) + experiment_id (e.g. e1). This ID uniquely identifies the experiment data in expressRNA.";

  if (Object.keys(experiments).length==0) {
    html += '<div id="btn_library_upload3" style="">You can start by <a href="javascript:upload_experiment();"><img src="media/upload.png" height=18 style="height: 16px; margin-top:-3px;vertical-align:middle; padding-right: 3px; opacity: 0.7">uploading the first experiment</a>.</div>';
  } else {
    html += "<center><a href='javascript:library_display_function(0);'><img src=media/list.svg style='opacity: 0.5; padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 0px;'></a><a href='javascript:library_display_function(1);'><img src=media/table.svg style='padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'></a>";
    html += "<b>Table of Experiments (switch between views, double click row to edit annotation)</b><br><br>";
  }

  for (exp_id in experiments)
  {
    html += "<table border=0 class='table_experiments'>"
    code_delete = "";
    code_edit = "";
    code_editable = "</div></td></tr>";
    if (google_user!=undefined)
      if ((library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) || (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")) {
          code_delete = "<a href='javascript:delete_experiment(" + experiments[exp_id].exp_id + ");'><img src=media/delete.png style='padding-left: 5px; opacity: 0.5; height: 12px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'>Delete</a>";
          code_edit = "<a href='javascript:edit_experiment(" + experiments[exp_id].exp_id + ");'><img src=media/edit.png style='padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'>Edit</a>";
          code_editable = " | " + code_edit + " | " + code_delete + "</div></td></tr>";
      }
    html += "<tr><td align='right'><div class='div_column'>Experiment identifier</div></td><td><div class='div_column_value'>" + "experiment <b>e" + experiments[exp_id].exp_id + "</b>" + code_editable;

    if (library["seq_type"]=="single") {
      fastq_link = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + ".fastq.bz2";
      bam_link = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_m1.bam";
      html += "<tr><td align='right'><div class='div_column_light'>Download links</div></td><td><div class='div_column_value'><a href=" + fastq_link + ">FastQ</a> | <a href=" + bam_link + ">BAM</a></div></td></tr>";
    } else {
      fastq_link1 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R1.fastq.bz2";
      fastq_link2 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R2.fastq.bz2";
      bam_link1 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R1_m1.bam";
      bam_link2 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R2_m1.bam";
      html += "<tr><td align='right'><div class='div_column_light'>Download links</div></td><td><div class='div_column_value'><a href=" + fastq_link1 + ">FastQ R1</a> | <a href=" + bam_link1 + ">BAM R1</a> | <a href=" + fastq_link2 + ">FastQ R2</a> | <a href=" + bam_link2 + ">BAM R2</a></div></td></tr>";
    }

    for (var j=0; j<library.columns_display.length; j++) {
      column_name = library.columns_display[j][1];
      column_name_human = library.columns_display[j][0];
      column_value = experiments[exp_id][column_name];
      if (column_name=="method") {
        column_value = experiments[exp_id]["method_desc"]
      }
      if (column_value=="")
        column_value = "&nbsp;";
      html += "<tr><td align='right'><div class='div_column_light'>" + column_name_human + "</div></td><td><div class='div_column_value'>" + column_value + "</div></td></tr>";
    }

    if (experiments[exp_id].stats[0]!="")
      html += "<tr><td><div class='div_column_light'>Mapping statistics</div></td><td><div class='div_column_value'>" + experiments[exp_id].stats[0] + " M reads; " + experiments[exp_id].stats[1] + " % mapped</div></td></tr>";
    lib_id = experiments[exp_id].lib_id;
    exp_id = experiments[exp_id].exp_id;
    html += "</table>";
    html += "<hr style='border: 1px solid #f1f1f1; color: #f1f1f1; width: 300px; margin-top: 15px; margin-bottom: 15px;'>";
  }
  $("#div_library_ex").html(html);
  tippy('.btn', {theme: 'light', interactive: true});
}

function library_display_function(f) {
  if (f==0) {
    experiment_display_function = "display_library_experiments2";
  }
  if (f==1) {
    experiment_display_function = "display_library_experiments";
  }
  window[experiment_display_function](library.experiments);
}

function display_library_experiments2(experiments) {
  html = "<br>";
  help_id = "Number of the experiment in the library, starting with 1 (e1).";
  help_aligned = "Percentage of uniquely aligned reads to the reference genome.";
  help_identifier = "The identifier links the experiment to the library. The identification is composed of: library_id (e.g. 20171212_data) + experiment_id (e.g. e1). This ID uniquely identifies the experiment data in expressRNA.";
  html += "<center>";

  if (Object.keys(experiments).length==0) {
    html += '<div id="btn_library_upload3" style="">You can start by <a href="javascript:upload_experiment();"><img src="media/upload.png" height=18 style="height: 16px; margin-top:-3px;vertical-align:middle; padding-right: 3px; opacity: 0.7">uploading the first experiment</a>.</div>';
  } else {
    html += "<a href='javascript:library_display_function(0);'><img src=media/list.svg style='padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 0px;'></a><a href='javascript:library_display_function(1);'><img src=media/table.svg style='opacity: 0.5; padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'></a>";
    html += "<b>Table of Experiments (switch between views, double click row to edit annotation)</b><br><br>";
  }

  html += "<table border=0 class='table_experiments'>";
  for (exp_id in experiments)
  {
    html += "<tr style='border-bottom: 1px solid #f1f1f1;' ondblclick='edit_experiment(" + experiments[exp_id].exp_id + ");'>";
    code_delete = "";
    code_edit = "";
    code_editable = "<td>";
    if (google_user!=undefined)
      if ((library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) || (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")) {
          code_delete = "<a href='javascript:delete_experiment(" + experiments[exp_id].exp_id + ");'><img src=media/delete.png style='padding-left: 5px; opacity: 0.5; height: 12px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'>Delete</a>";
          code_edit = "<a href='javascript:edit_experiment(" + experiments[exp_id].exp_id + ");'><img src=media/edit.png style='padding-left: 2px; height: 18px; margin-top:-2px;vertical-align:middle; padding-right: 3px;'>Edit</a>";
          code_editable = "<td>" + code_edit + "</td><td>" + code_delete + "</td>";
      }

    html += "<td class='exp_row' style='text-align:right'><div class='div_column_value'>" + "<b>e" + experiments[exp_id].exp_id + "</b></td>";
    for (var j=0; j<library.columns_display.length; j++) {
      column_name = library.columns_display[j][1];
      column_name_human = library.columns_display[j][0];
      column_value = experiments[exp_id][column_name];
      if (column_name=="method")
        column_value = experiments[exp_id]["method_desc"]
      if (column_value=="")
        column_value = "&nbsp;";
      html += "<td class='exp_row'><div class='div_column_value'>" + column_value + "</div></td>";
    }
    if ( (experiments[exp_id].stats[0]!="") && (experiments[exp_id].stats[0]!=0)) {
      map_text = experiments[exp_id].stats[0] + "M reads; " + experiments[exp_id].stats[1] + "%";
      map_width = Math.min(100, Number(experiments[exp_id].stats[1]).toFixed(0)) + "%";
      html += "<td class='exp_row' style='z-index: -2;'><div style='position: relative;'><div style='z-index: 2000; border: 1px solid #eeeeee; width: 130px; text-align: center; margin-bottom: 2px; padding-left: 3px; padding-right: 3px; border-radius: 3px; font-size: 11px;'>" + map_text + "</div><div style='width: " + map_width + "; text-align: center; height: 100%; border-radius: 3px; background-color: #e1e1e1; font-size: 10px; position: absolute; top: 0px; left: 0px; z-index: -5;'>&nbsp;</div></div></td>";
    } else {
      map_text = "processing / queued";
      html += "<td class='exp_row' style='z-index: -2;'><div style='position: relative;'><div style='z-index: 2000; border: 1px solid #eeeeee; width: 130px; text-align: center; margin-bottom: 2px; padding-left: 3px; padding-right: 3px; border-radius: 3px; font-size: 11px;'>" + map_text + "</div><div style='width: " + "0" + "; text-align: center; height: 100%; border-radius: 3px; background-color: #e1e1e1; font-size: 10px; position: absolute; top: 0px; left: 0px; z-index: -5;'>&nbsp;</div></div></td>";
    }

    lib_id = experiments[exp_id].lib_id;
    exp_id = experiments[exp_id].exp_id;

    if (library["seq_type"]=="single") {
      fastq_link = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + ".fastq.bz2";
      bam_link = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_m1.bam";
      html += "<td class='exp_row'><div class='div_column_value'><a href=" + fastq_link + ">FastQ</a> , <a href=" + bam_link + ">BAM</a></div></td>";
    } else {
      fastq_link1 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R1.fastq.bz2";
      fastq_link2 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R2.fastq.bz2";
      bam_link1 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R1_m1.bam";
      bam_link2 = config["data_url"] + experiments[exp_id].lib_id + "/e" + experiments[exp_id].exp_id + "/m1/" + experiments[exp_id].lib_id + "_e" + experiments[exp_id].exp_id + "_R2_m1.bam";
      html += "<td class='exp_row'><div class='div_column_value'><a href=" + fastq_link1 + ">FastQ R1</a>, <a href=" + bam_link1 + ">BAM R1</a>, <a href=" + fastq_link2 + ">FastQ R2</a>, <a href=" + bam_link2 + ">BAM R2</a></div></td>";
    }

    html += "<td>" + code_editable + "</td>";
    html += "</tr>";
  }
  html += "</table>";
  $("#div_library_ex").html(html);
  tippy('.btn', {theme: 'light', interactive: true});
}

function display_library_ge() {
  html = "<br>";

  if (google_user!=undefined)
  if ((library.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) || (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com"))
  {
    // add new analysis button
    html += '<div class="div_header" style="color:#555555"><b>Start New Analysis</b>: define a new analysis / comparison using the experiments from your library</div>';
    html += '<div id="div_control_library_newanalyses" style="float: left; padding-bottom: 10px">';
    html += '<a href="javascript:new_analysis_library()" class="title_link">';
    html += '<font style="font-size: 13px;"><img src="media/calculator.png" style="height: 20px; margin-top:-5px;vertical-align:middle; padding-right: 3px; opacity: 0.4">Differential Gene Expression<font>';
    html += '</a>';
    html += '</div><br><br>';
  }

  html += '<div class="div_header" style="color:#555555"><b>Downloads:</b> links to constructed polyA databases and gene expression tables</div>';
  polya_bed_link = config["polya_url"] + library.lib_id + ".bed.gz";
  html += "<div style='background-color: #e1e1e1; border-radius: 3px; float:left; padding-left: 3px; padding-right: 3px; margin-right: 5px;'>PolyA database</div><div class='div_column_value'><a target=_new href='" + polya_bed_link + "'>Download polyA database</a></div>";
  html += "<div style='font-size: 12px; color: #555555; padding-left: 3px;'>The polyA database is constructed from all experimental data in the library. Reads are grouped depending on library method (Quantseq Reverse, Quantseq Forward, Nanopore) and thresholds are applied to estimate RNA molecule ends. The results are reported in BED format. A detailed description is available in the <a href='javascript:open_help();'>Docs section</a>.</div>";
  html += "<br><br>";

  polya_expression_table_link = config["data_url"] + library.lib_id + "/" + library.lib_id + "_polya_expression.tab?nocache="+nocache;
  html += "<div style='background-color: #e1e1e1; border-radius: 3px; float:left; padding-left: 3px; padding-right: 3px; margin-right: 5px;'>PolyA Counts</div><div class='div_column_value'><a target=_new href='" + polya_expression_table_link + "'>Download polyA count table</a></div>";
  html += "<div style='font-size: 12px; color: #555555; padding-left: 3px;'>The polyA count table provides information on individual polyA site read count for each of the library experiments separately.</div>";
  html += "<br><br>";

  gene_expression_table_link = config["data_url"] + library.lib_id + "/" + library.lib_id + "_gene_expression.tab?nocache="+nocache;
  html += "<div style='background-color: #e1e1e1; border-radius: 3px; float:left; padding-left: 3px; padding-right: 3px; margin-right: 5px;'>Gene Counts</div><div class='div_column_value'><a target=_new href='" + gene_expression_table_link + "'>Download gene expression table</a></div>";
  html += "<div style='font-size: 12px; color: #555555; padding-left: 3px;'>The gene expression table provides information on global gene expression levels. Computed with htseq-count and aligned (.bam) files from each experiment in the library.</div>";

  $("#div_library_ge").html(html);
}

function edit_experiment(exp_id) {
  if (google_user==undefined)
    return;
  if ((library.owner.indexOf(google_user.getBasicProfile().getEmail())==-1) && (google_user.getBasicProfile().getEmail()!="gregor.rot@gmail.com"))
    return;
  library = db["library"]["query"];
  html = "<b>Editing experiment " + exp_id + "</b> for library " + library.lib_id + "</b><br>";
  html += "<div style='font-size: 12px; color: #444444;'>Annotating your experiment is super easy, simply enter (or copy/paste) values (one per line) for this experiment.</div>"
  public_library = "";
  columns = [];
  columns_values = [];
  for (var i=0; i<library.columns.length; i++) {
    columns.push(library.columns[i][0]);
    column_value = library.experiments[exp_id][library.columns[i][1]];
    if (column_value==undefined)
      column_value = "";
    columns_values.push(column_value);
  }
  document.execCommand("defaultParagraphSeparator", false, "br");
  vex.dialog.open({
      unsafeMessage: html,
      input: [
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top>',
          '<b>Annotation Fields</b>&nbsp;&nbsp;&nbsp;<div align="right" style="min-width: 120px; padding-top: 7px; font-size: 12px !important; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444; align:right; background-color: #FFFFFF; user-select: none !important; margin-top: 3px;">' + columns.join(":<br>") + ':</div>',
          '</td><td valign=top width=430 style="max-width: 400px">',
          '<b>Values</b><br><div style="padding-top: 2px; padding-left: 3px; outline: 1px solid #cccccc; background-color: #f1f1f1; max-width: 400px; max-height: 600px; min-width: 200px; margin-top: 5px; font-size: 12px !important; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" name="divtest" id="divtest" contenteditable>' + columns_values.join("<br>") + '<br></div>',
          '</td></tr></table>'
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Save' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      afterOpen: function(event) {
        setTimeout(disable_paste_format, 1, $("#divtest"));
      },
      callback: function (data) {
          if (!data) {
          } else {
            // take care of column values
            new_column_values = $("#divtest").html().split("<br>");
            for (var i=0; i<library.columns.length; i++) {
              column_name = library.columns[i][1];
              column_value = new_column_values[i].replace("\n", "");
              library.experiments[exp_id][column_name] = column_value;
            }
            save_library(library);
          }
      }
  })
  }

  function change_library_genome() {
    library = db["library"]["query"];
    html = "<b>Library Genome Selection</b>";
    html += "<div style='font-size: 12px; color: #444444;'>Please select the genome assembly and annotation of your library.</div>"
    if (library.genome!="")
      html += "<div style='font-size: 12px; color: #942020;'>Please be aware that if you change the genome of the library, all experiments will be re-mapped to the newly selected genome (can take some time).</div>"
    genomes_html = "<select id='select_genome' name='select_genome' size=10 style='margin-left: 2px; width: 400px; font-size: 12px; outline: none;'>";
    for (var genome in genomes) {
      if (library.genome==genome)
        genomes_html += "<option selected value='" + genome + "'>" + genomes[genome][1] + "</option>";
      else
        genomes_html += "<option value='" + genome + "'>" + genomes[genome][1] + "</option>";
    }
    genomes_html += "</select>";
    vex.dialog.open({
        unsafeMessage: html,
        input: [
            '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top>',
            '<b>Available Genomes</b>&nbsp;&nbsp;&nbsp;<div align="left" style="min-width: 120px; padding-top: 7px; font-size: 12px !important; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444; align:right; background-color: #FFFFFF; user-select: none !important; margin-top: 3px;">' + genomes_html + '</div>',
            '</td></tr></table>',
        ].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Select' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
        ],
        callback: function (data) {
            if (!data) {
            } else {
              library.genome = $('#select_genome').find(":selected").val();
              save_library(library);
            }
        }
    })
  }

  function change_library_method() {
    library = db["library"]["query"];
    html = "<b>Library Method Selection</b>";
    html += "<div style='font-size: 12px; color: #444444;'>Please select the sequencing method / protocol of your library.</div>"
    if (library.method!="")
      html += "<div style='font-size: 12px; color: #942020;'>Please be aware that if you change the method of the library, the experiments (in some cases, like Nanopore) will be re-mapped to the reference genome, which can take some time.</div>"
    methods_html = "<select id='select_method' name='select_method' size=10 style='margin-left: 2px; font-size: 12px; outline: none; width:400px'>";
    for (var method in methods) {
      if (library.method==method)
        methods_html += "<option selected value='" + method + "'>" + methods[method][1] + "</option>";
      else
        methods_html += "<option value='" + method + "'>" + methods[method][1] + "</option>";
    }
    methods_html += "</select>";
    vex.dialog.open({
        unsafeMessage: html,
        input: [
            '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top>',
            '<b>Available Methods</b>&nbsp;&nbsp;&nbsp;<div align="left" style="min-width: 120px; padding-top: 7px; font-size: 12px !important; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444; align:right; background-color: #FFFFFF; user-select: none !important; margin-top: 3px;">' + methods_html + '</div>',
            '</td></tr></table>',
        ].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Select' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
        ],
        callback: function (data) {
            if (!data) {
            } else {
              library.method = $('#select_method').find(":selected").val();
              save_library(library);
            }
        }
    })
  }

function disable_paste_format(object) {
  // prevent pressing ENTER in edit experiment
  object.keypress(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
  });
  object.on("paste", function(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  });
}

function new_analysis_library() {

  if (Object.keys(library.experiments).length < 3) {
    html = "<b>Differential Gene Expression</b><br>";
    html += "You need at least 4 experiments to define a differential gene expression (DGE) analysis." + "<br>";
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

  html = "<b>Differential Gene Expression Analysis</b><br>";
  html += "Here you define new differential gene expression analysis. Please choose experiment groupA (control) and groupB (test) below." + "<br>";

  html += "<textarea name='analysis_name' id='analysis_name' rows=2 style='border-radius: 5px; margin-top: 10px; outline: none; resize: none; width: 400px; font-size: 13px; color: #777777;' placeholder='Analysis name'></textarea>";

  analysis_html = "<br><br>Mark (distribute) experiments into group A (control) and group B (test).<br>Minimum 2 replicates per group.<br>";
  analysis_html += "<table border=0><tr><td>";
  analysis_html += "<div id='comp_experiment_select'>" + make_html_experiment_select(); + "</div>";
  analysis_html += "</td>";
  analysis_html += "<td style='padding-left: 10px;' valign=top><input type=button value=' Group A ' onclick='mark_experiment(\"groupA\");'><br><br><input type=button value=' Group B ' onclick='mark_experiment(\"groupB\");'></td>";
  analysis_html += "</tr></table>";
  html += analysis_html + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Create', id:'btn_analysis_create' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel',  id:'btn_analysis_cancel' })
      ],
      afterOpen: function(event) {
        setTimeout(adjust_analysis_cbutton_library, 1); // this trick somehow works, otherwise the buttons are not yet in DOM
      },
      callback: function (data) {
          if (!data) {
            for (exp_id in library.experiments)
                library.experiments[exp_id]["analysis_set"] = undefined;
          } else {
            if (google_user==undefined) // no logged in user? quit
              return;
            post_data = {};
            post_data["action"] = "new_analysis";
            post_data["email"] = google_user.getBasicProfile().getEmail();
            post_data["lib_id"] = library.lib_id;
            post_data["method"] = library.method;
            post_data["genome"] = library.genome;
            post_data["analysis_type"] = "dge"; // dge, apa"
            post_data["analysis_name"] = $('#analysis_name').val();
            post_data["experiments"] = JSON.stringify(library.experiments);

            $.post('/expressrna_gw/index.py', post_data)
                .success(function(result) {
                  result = $.parseJSON(result);
                  search_analyses();
                  open_analysis(result["analysis_id"]);
                })
                .error(function(){
            });

          }
      }
  })
}

function mark_experiment(value) {
  selected_array = $('#select_experiments').val();
  for (item in selected_array) {
    exp_id = selected_array[item];
    library.experiments[exp_id].analysis_set = value;
  }
  $("#comp_experiment_select").html(make_html_experiment_select());
  adjust_analysis_cbutton_library();
}

function make_html_experiment_select() {
  analysis_html = "<select multiple id='select_experiments' onchange='adjust_analysis_cbutton_library()' name='select_experiments' size=" + Math.min(15, Object.keys(library.experiments).length+2) + " style='margin-left: 2px; width: 400px; font-size: 12px; outline: none; color: #777777; border-radius: 2px;'>";
  for (exp_id in library.experiments) {
    var exp_desc = ["exp_" + exp_id];
    for (var j=0; j<library.columns_display.length; j++) {
      column_name = library.columns_display[j][1];
      column_name_human = library.columns_display[j][0];
      column_value = library.experiments[exp_id][column_name];
      if (column_name=="method")
        column_value = library.experiments[exp_id]["method_desc"]
      if (column_value=="")
        column_value = "&nbsp;";
      if (column_value!="&nbsp;") {
        exp_desc.push(column_value);
      }
    }
    exp_desc = exp_desc.join(", ");
    if (library.experiments[exp_id]["analysis_set"]!=undefined)
      exp_desc = library.experiments[exp_id]["analysis_set"] + " : " + exp_desc;
    analysis_html += "<option value='" + exp_id + "'>" + exp_desc + "</option>";
  }
  analysis_html += "</select>";
  return analysis_html;
}

function adjust_analysis_cbutton_library() {
  $('#btn_analysis_create').css("display", "none");
  var buttons = document.getElementsByTagName('button');
  var buttons = document.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      if ($(button).html()=="Create") {
        num_groupA = 0;
        num_groupB = 0;
        for (exp_id in library.experiments) {
          if (library.experiments[exp_id].analysis_set=="groupA")
            num_groupA += 1
          if (library.experiments[exp_id].analysis_set=="groupB")
            num_groupB += 1
        }
        if ((num_groupA>=2) && (num_groupB>=2))
        {
          button.disabled = false;
          $(button).css("opacity", 1);
          $(button).css("cursor", "pointer");
        } else {
          button.disabled = true;
          $(button).css("opacity", 0.1);
          $(button).css("cursor", "default");
        }
      }
  }
}

function show_div_ep() {

  window.layout_ep = {
    title: '',
    margin: {
      l: 50,
      r: 25,
      b: 35,
      t: 15
    },
    font: {
      family: 'Arial',
      size: 9,
      color: '#7f7f7f'
    },
    xaxis: {
      //range: [-200, 200],
      title: 'experiment id',
      titlefont: {
              family: 'Arial',
              size: 12,
              color: '#7f7f7f'
      },
      tickfont: {
              family: 'Arial',
              size: 11,
              color: '#7f7f7f'
      },
      zerolinecolor:'#cc0000',
      hoverformat: '+f',
    },
    yaxis: {
      //range: [-100, 100],
      title: 'gene expression',
      titlefont: {
              family: 'Arial',
              size: 12,
              color: '#7f7f7f'
      },
      tickfont: {
              family: 'Arial',
              size: 11,
              color: '#7f7f7f'
      },
      //exponentformat:'e',
      // https://github.com/mbostock/d3/wiki/Formatting#numbers
      hoverformat: '+.2f', // show mouse over values with 2 decimal precisions
    },
    width: 900,
    height: 300,
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    hovermode: 'closest',
    showlegend: true,
  };
}

function get_ep(initialize=0) {
  var post_data = {};
  post_data["action"] = "get_ep";
  post_data["lib_id"] = library.lib_id;
  post_data["initialize"] = initialize;
  try {
    post_data["genes"] = String($('#area_genes_search').tagEditor('getTags')[0].tags.join(","));
  } catch (err) { }
  console.log(post_data["genes"]);
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
        data = $.parseJSON(result);
        traces = [];
        gene_names = [];
        for (var i=0; i<data.length; i++) {
          x = [];
          y = [];
          for (var j=2; j<data[i].length; j++) {
            y.push(Number(data[i][j]))
            x.push(j-1)
          }
          gene_name = data[i][0];
          if (data[i][1]!="")
            gene_name += ", " + data[i][1];
          trace = {"x":x, "y":y, "type":"scatter", "name":gene_name};
          gene_names.push(gene_name);
          traces.push(trace);
        }
        Plotly.newPlot('div_ep1', traces, layout_ep, { displayModeBar: false });
        if (initialize==1)
          search_library_with(gene_names.join("|||"));
      })
      .error(function(){
        return undefined;
  });
}

function library_tags_reinit() {
  $('#area_genes_search').tagEditor('destroy');
  $('#area_genes_search').val("");
  $('#area_genes_search').tagEditor({initialTags: [], beforeTagSave: area_library_search_beforesave, beforeTagDelete: area_library_search_tagdelete, forceLowercase: false, delimiter: "||", placeholder: 'Enter genes ...', onChange: area_library_search_changed});
}

function area_library_search_beforesave() {
}

function area_library_search_changed(field, editor, tags) {
  get_ep();
}

function area_library_search_tagdelete(field, editor, tags, val) {
  var new_tags = tags;
  var index = new_tags.indexOf(val);
  if (index > -1)
    new_tags.splice(index, 1);
  search_library_with(new_tags.join("|||"));
}

function search_library_with(tags) {
  library_tags_reinit();
  tags = tags.split("|||");
  for (var i=0; i<tags.length; i++) {
    $('#area_genes_search').tagEditor('addTag', tags[i]);
  }
  get_ep(initialize=0);
}

function add_library_filter(filter) {
  $('#area_genes_search').tagEditor('addTag', filter);
}

library_tags_reinit();

tippy('.btn', {theme: 'light', interactive: true});
