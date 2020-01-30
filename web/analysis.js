var timer_get_analysis_status;

menu_select("link_search");

  var trace1 = {
    mode: 'lines',
    type: 'scatter',
    fill: 'tozeroy',
    name: 'enhanced',
    line: {
      color: '#ff0000',
      width: 1
    }
  };

  var trace2 = {
    mode: 'lines',
    type: 'scatter',
    name: 'repressed',
    fill: 'tozeroy',
    line: {
      color: '#0000ff',
      width: 1
    }
  };

  var trace3 = {
    mode: 'lines',
    type: 'scatter',
    name: 'controls_up',
    line: {
      color: '#000000',
      width: 1
    },
    hoverinfo: 'none'
  };

  var trace4 = {
    mode: 'lines',
    type: 'scatter',
    name: 'controls_down',
    line: {
      color: '#000000',
      width: 1
    },
    hoverinfo: 'none'
  };

  var layout = {
    title: '',
    margin: {
      l: 65,
      r: 30,
      b: 30,
      t: 10
    },
    font: {
      family: 'Arial',
      size: 9,
      color: '#7f7f7f'
    },
    xaxis: {
      range: [-200, 200],
      title: 'distance from polyA site [nt]',
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
      range: [-100, 100],
      title: 'percentage of targets',
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
      exponentformat:'e',
      showexponent:'All',
      // https://github.com/mbostock/d3/wiki/Formatting#numbers
      hoverformat: '+.2f', // show mouse over values with 2 decimal precisions
    },
    width: 500,
    height: 150,
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    hovermode: 'closest',
    showlegend: false,
};

function display_analysis_rnamap(div_name, site_type, pair_type, clip_index) {
  post_data = {};
  post_data["action"] = "rnamap";
  post_data["comps_id"] = db["analysis"]["analysis_id"];
  post_data["site_type"] = site_type;
  post_data["pair_type"] = pair_type;
  post_data["clip_index"] = clip_index;
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
          data = $.parseJSON(result);
          if (data["status"]=="no results")
            return;
          data1 = jQuery.extend(true, {}, trace1);
          data2 = jQuery.extend(true, {}, trace2);
          data3 = jQuery.extend(true, {}, trace3);
          data4 = jQuery.extend(true, {}, trace4);
          data_layout = jQuery.extend(true, {}, layout);
          data1.x = data.x;
          data2.x = data.x;
          data3.x = data.x;
          data4.x = data.x;
          data1.y = data.vpos;
          data1.y = $.map( data1.y, function( n ) { return n * 100; });
          data2.y = data.vneg;
          data2.y = $.map( data2.y, function( n ) { return n * 100; });
          data3.y = data.cup;
          data3.y = $.map( data3.y, function( n ) { return n * 100; });
          data4.y = data.cdown;
          data4.y = $.map( data4.y, function( n ) { return n * 100; });
          lbl_pair_type = pair_type.replace("_", "-");
          if (site_type=="proximal") {
            //data_layout.title = ...
            $("#analysis_proximal_title").html("<b>proximal " + lbl_pair_type + "</b>, r=" + data.num_r + ", e=" + data.num_e + ", c=" + (data.num_cup+data.num_cdown));
          }
          else if (site_type=="distal") {
            //data_layout.title = ...
            $("#analysis_distal_title").html("<b>distal " + lbl_pair_type + "</b>, r=" + data.num_e + ", e=" + data.num_r + ", c=" + (data.num_cup+data.num_cdown));
          }
          else if (site_type=="s1") {
            //data_layout.title =
            $("#analysis_s1_title").html("<b>splice-site-1 " + lbl_pair_type + "</b>, r=" + data.num_e + ", e=" + data.num_r + ", c=" + (data.num_cup+data.num_cdown));
          }
          else if (site_type=="s2") {
            //data_layout.title = ...
            $("#analysis_s2_title").html("<b>splice-site-2 " + lbl_pair_type + "</b>, r=" + data.num_e + ", e=" + data.num_r + ", c=" + (data.num_cup+data.num_cdown));
          }

          data_layout.yaxis.range = [-Math.ceil(data.ymax*100), Math.ceil(data.ymax*100)];
          var plot_data = [data1, data2, data3, data4];
          Plotly.newPlot(div_name, plot_data, data_layout, {displaylogo: false, displayModeBar: false});

          if ((data.num_r==0) && (data.num_e==0)) {
            $("#btn_analysis_target").hide();
          } else {
            $("#btn_analysis_target").show();
          }
      })
      .fail(function(){
          $("body").removeClass("waiting");
  })
}

var track1_heat = {
  x: [],
  y: [],
  z: [],
  type: 'heatmap',
  colorscale: [],
  showscale: false,
  text : [['Text A', 'Text B', 'Text C']],
};

var layout_heat = {
  width: 450,
  height: 200,
  font: {
    family: 'Arial',
    size: 9,
    color: '#7f7f7f'
  },
  title: '<b>proximal same-exon</b> repressed',
  margin: {
    l: 100,
    r: 10,
    b: 15,
    t: 25
  },
  paper_bgcolor: '#ffffff',
  plot_bgcolor: '#ffffff',
  //hovermode: 'closest',
  annotations: [],
  xaxis: {
    ticks: '',
    side: 'bottom'
  },
  yaxis: {
    autotick : false,
    autosize: true,
    showticklabels: true,
    ticks: '',
    ticksuffix: ' ',
    tickfont: {
      family: 'Arial',
      size: 9,
      color: 'black'
    },
    showgrid : true,
  },
  xaxis: {
    showgrid : true,
    showticklabels: true,
    ticks: '',
    ticksuffix: ' ',
    tickfont: {
      family: 'Arial',
      size: 10,
      color: 'black'
    },

  }
};

function display_analysis_heat(div_name, site_type, pair_type, reg, clip_index) {
  post_data = {};
  post_data["action"] = "rnaheat";
  post_data["comps_id"] = db["analysis"]["analysis_id"];
  post_data["site_type"] = site_type;
  post_data["pair_type"] = pair_type;
  post_data["reg"] = reg;
  post_data["clip_index"] = clip_index;
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
        data = $.parseJSON(result);
        if (data["status"]=="no results")
          return;
        data.data = $.parseJSON(data.data);
        plot_data = jQuery.extend(true, {}, track1_heat);
        data_layout = jQuery.extend(true, {}, layout_heat);
        plot_data.x = data.x;
        plot_data.y = data.ylabels.reverse();
        plot_data.z = data.data.reverse();
        lbl_pair_type = pair_type.replace("_", "-");
        if (site_type=="proximal") {
          if (reg=="pos") {
            data_layout.title = "<b>proximal " + lbl_pair_type + "</b> top 20 <b>enhanced</b> targets";
          } else {
            data_layout.title = "<b>proximal " + lbl_pair_type + "</b> top 20 <b>repressed</b> targets";
          }
        }
        else if (site_type=="distal") {
          if (reg=="pos") {
            data_layout.title = "<b>distal " + lbl_pair_type + "</b> top 20 <b>enhanced</b> targets";
          } else {
            data_layout.title = "<b>distal " + lbl_pair_type + "</b> top 20 <b>repressed</b> targets";
          }
        }
        // colors
        if (reg=="pos") {
          var colorscaleValue = [ [0, '#ffffff'], [1, '#FF6666'] ];
        } else {
          var colorscaleValue = [ [0, '#ffffff'], [1, '#6666FF'] ];
        }
        plot_data.colorscale = colorscaleValue;
        Plotly.newPlot(div_name, [plot_data], data_layout, {displaylogo: false, displayModeBar: false});
      })
      .fail(function(){
  })
}

function display_analysis_apamap(div_name, pair_type) {
  $("body").addClass("waiting");
  post_data = {};
  post_data["action"] = "apamap";
  post_data["analysis_id"] = db["analysis"]["analysis_id"];
  post_data["pair_type"] = pair_type;
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
        apamap_data = $.parseJSON(result);
        apamap_enhanced = {x:apamap_data["enhanced"]["x"], y:apamap_data["enhanced"]["y"], text: apamap_data["enhanced"]["gene_id"], mode: 'markers', type: 'scatter', name: 'Enhanced: ' + apamap_data["enhanced"]["x"].length, marker: { size: 6, color: "#ff6961" }};
        apamap_repressed = {x:apamap_data["repressed"]["x"], y:apamap_data["repressed"]["y"], text: apamap_data["repressed"]["gene_id"], mode: 'markers', type: 'scatter', name: 'Repressed: ' + apamap_data["repressed"]["x"].length, marker: { size: 6, color: "#779ecb" }};
        apamap_control_up = {x:apamap_data["control_up"]["x"], y:apamap_data["control_up"]["y"], text: apamap_data["control_up"]["gene_id"], mode: 'markers', type: 'scatter', name: 'Control up: ' + apamap_data["control_up"]["x"].length, marker: { size: 6, color: "#f1f1f1" }};
        apamap_control_down = {x:apamap_data["control_down"]["x"], y:apamap_data["control_down"]["y"], text: apamap_data["control_down"]["gene_id"], mode: 'markers', type: 'scatter', name: 'Control down: ' + apamap_data["control_down"]["x"].length, marker: { size: 6, color: "#f1f1f1" }};

          var apamap_layout = {
            legend: {orientation:'h', yanchor: 'bottom', y: -0.35, x: 0.22, font: {family: 'Arial', size: 10, color: '#7f7f7f'}},
            margin: {
              l: 55,
              r: 30,
              b: 10,
              t: 0,
              pad: 1
            },
            xaxis: {
              zerolinecolor: '#f1f1f1',
              gridcolor: '#fafafa',
              gridwidth:0.5,
              zerolinewidth:0.5,
              title: "proximal polyA site (fold-change)"
            },
            yaxis: {
              zerolinecolor: '#f1f1f1',
              gridcolor: '#fafafa',
              gridwidth:0.5,
              zerolinewidth:0.5,
              title: "distal polyA site (fold-change)",
            },
            //title: 'Fold-changes (computed by DEXSeq) of proximal and distal polyA sites',
            hovermode:'closest',
            font: {
              family: 'Arial',
              size: 9,
              color: '#7f7f7f'
            }
        };

        var apamap_data = [ apamap_control_up, apamap_control_down, apamap_enhanced, apamap_repressed];
        $("#analysis_apamap_title").html("Fold-changes (computed by DEXSeq) of proximal and distal polyA sites [<a href=https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".pairs_de" + "." + db["analysis"]["pair_type"] + ".pdf target=_new>PDF</a>]");

        Plotly.newPlot(div_name, apamap_data, apamap_layout, {displayModeBar: false});
        $("body").removeClass("waiting");

      })
      .fail(function(){
          $("body").removeClass("waiting");
  })
}

  hide_analysis_div_all();

  function hide_analysis_div_all() {
    $("#btn_analysis_es").css("background-color", "#e1e1e1");
    $("#btn_analysis_rna").css("background-color", "#e1e1e1");
    $("#btn_analysis_go").css("background-color", "#e1e1e1");
    $("#btn_analysis_atlas").css("background-color", "#e1e1e1");
    $("#btn_analysis_download").css("background-color", "#e1e1e1");
    $("#btn_analysis_target").css("background-color", "#e1e1e1");
    $("#btn_analysis_splicing").css("background-color", "#e1e1e1");
    $("#div_analysis_es").hide();
    $("#div_analysis_target").hide();
    $("#div_analysis_rna").hide();
    $("#div_analysis_go").hide();
    $("#div_analysis_atlas").hide();
    $("#div_analysis_download").hide();
    $("#div_analysis_splicing").hide();
  }

  function open_analysis_div(analysis_module) {
    db["analysis"]["analysis_module"] = analysis_module;
    hide_analysis_div_all();
    $("#div_analysis_" + analysis_module).show();
    $("#btn_analysis_" + analysis_module).css("background-color", "#c1c1c1");
    add_history({"action":"analysis", "analysis_id":db["analysis"]["analysis_id"], "module":analysis_module, "pair_type":db["analysis"]["pair_type"]}, "index.html?action=analysis&analysis_id=" + db["analysis"]["analysis_id"] + "&module="+analysis_module+"&pair_type="+db["analysis"]["pair_type"]);
  }

  function open_analysis_pair_type(t_pair_type) {
    $("#btn_same").css("background-color", "#e1e1e1");
    $("#btn_skipped").css("background-color", "#e1e1e1");
    $("#btn_composite").css("background-color", "#e1e1e1");
    $("#btn_combined").css("background-color", "#e1e1e1");
    $("#btn_"+t_pair_type).css("background-color", "#c1c1c1");
    db["analysis"]["pair_type"] = t_pair_type;
    get_analysis(db["analysis"]["analysis_id"], db["analysis"]["pair_type"]);
  }

  function change_analysis_go(aspect) {
    db["analysis"]["go_aspect"] = aspect;
    display_analysis_go(comps_data.go);
  }

  function clip_analysis_selector_change() {
    db["analysis"]["clip_index"] = $("#clip_selector").prop('selectedIndex');
    //$("#btn_clip_download").html("&nbsp;&nbsp;<a href='https://www.expressrna.org/share/CLIP/" + db["analysis"]["query"].CLIP[$("#clip_selector").prop('selectedIndex')] + "'>Download</a>");
    get_analysis(db["analysis"]["analysis_id"]);
  }

  function get_analysis(analysis_id, pair_type) {
    try  {
      clearInterval(timer_get_analysis_status);
    } catch (err) {}
    timer_get_analysis_status = setInterval(get_analysis_status, 3000);
    db["analysis"]["pair_type"] = pair_type;
    db["analysis"]["analysis_id"] = analysis_id;
    pair_type = db["analysis"]["pair_type"];
    clip_index = db["analysis"]["clip_index"];
    post_data = {};
    post_data["action"] = "get_analysis";
    if (google_user!=undefined)
      post_data["email"] = google_user.getBasicProfile().getEmail();
    post_data["comps_id"] = db["analysis"]["analysis_id"];
    post_data["pair_type"] = db["analysis"]["pair_type"]
    post_data["clip_index"] = db["analysis"]["clip_index"]
    $.post('/expressrna_gw/index.py', post_data)
        .done(function(result) {
            data = $.parseJSON(result);
            db["analysis"]["query"] = data;
            if (db["analysis"]["analysis_module"]==undefined)
              db["analysis"]["analysis_module"] = "es";
            if (db["analysis"]["pair_type"]==undefined)
              db["analysis"]["pair_type"] = "same";
            if (google_user!=undefined)
            if ((data.owner.indexOf(google_user.getBasicProfile().getEmail())!=-1) || (google_user.getBasicProfile().getEmail()=="gregor.rot@gmail.com")) {
                $("#btn_analysis_delete").show();
                $("#btn_analysis_edit").show();
            }

            $("#btn_"+pair_type).css("background-color", "#c1c1c1");
            open_analysis_div(db["analysis"]["analysis_module"]);

            $("#lbl_analysis_id").html(data.comps_id);
            $("#lbl_analysis_name").html(data.comps_name);
            $("#lbl_analysis_authors").html(data.authors);
            $("#lbl_analysis_genome").html(data.genome_desc);
            $("#lbl_analysis_method").html(data.method_desc);

            if (data.CLIP.length>0) {
              clip_selector = '<br><form style="height: 5px;"><b>iCLIP:</b>&nbsp;<select id=clip_selector style="width:300px;" onchange="clip_analysis_selector_change();">';
              for (var i=0; i<data.CLIP.length; i++)
              {
                sel = "";
                if (String(i)==clip_index) {
                  sel = "selected";
                }
                clip_selector += '<option value="'+ i +'" ' + sel + '>' + data.CLIP[i] + '</option>'
                data.CLIP[i]
              }
              clip_selector += '</select>';
              clip_selector += "<div style='display: inline;' id='btn_clip_download'>&nbsp;&nbsp;<a href='https://www.expressrna.org/share/CLIP/" + data.CLIP[clip_index] + "'>Download</a></div>";
              clip_selector += "</form>";
              $("#lbl_analysis_clip").html(clip_selector);
              $("#div_analysis_clip").show();
              $("#btn_analysis_splicing").show();
            } else {
              $("#div_analysis_clip").hide(); // no CLIP data provided
              $("#btn_analysis_target").hide();
              $("#btn_analysis_splicing").hide();
            }
            $("#lbl_analysis_comps_notes").html(data.notes);
            $("#clip_selector").chosen();

            comps_data = jQuery.extend(true, {}, data);

            display_analysis_experiments(data.control, data.test, data);

            // common analysis code
            $("#link_analysis_download1").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".pairs_de.tab");
            $("#link_analysis_download2").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".genes_de.tab");
            $("#link_analysis_download3").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".expression_sites.tab");
            $("#link_analysis_download4").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".expression_genes.tab");
            $("#link_analysis_download5").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".heatmap.pdf");
            $("#link_analysis_download6").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".heatmap.tab");
            $("#link_analysis_download7").attr("href", "https://expressRNA.org/share/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".expression_genes_norm.tab");

            if (data.analysis_type=="apa") {
              $("#table_apa").show();
              $("#analysis_apamap_title").show();
              $("#div_analysis_apamap").show();
              $("#btn_analysis_atlas").show();
              $("#row_apa_switch_download").show();
              $("#row_apausage_download").show();
              $("#row_apaheat_download").show();
              $("#div_pair_type").show();
              display_analysis_go(comps_data.go);
              display_analysis_rnamap("analysis_proximal", "proximal", db["analysis"]["pair_type"], db["analysis"]["clip_index"]);
              display_analysis_rnamap("analysis_distal", "distal", db["analysis"]["pair_type"], db["analysis"]["clip_index"]);
              display_analysis_rnamap("analysis_s1", "s1", db["analysis"]["pair_type"], db["analysis"]["clip_index"]);
              display_analysis_rnamap("analysis_s2", "s2", db["analysis"]["pair_type"], db["analysis"]["clip_index"]);
              display_analysis_heat("analysis_heat_proximal_pos", "proximal", db["analysis"]["pair_type"], "pos", db["analysis"]["clip_index"]);
              display_analysis_heat("analysis_heat_proximal_neg", "proximal", db["analysis"]["pair_type"], "neg", db["analysis"]["clip_index"]);
              display_analysis_heat("analysis_heat_distal_pos", "distal", db["analysis"]["pair_type"], "pos", db["analysis"]["clip_index"]);
              display_analysis_heat("analysis_heat_distal_neg", "distal", db["analysis"]["pair_type"], "neg", db["analysis"]["clip_index"]);
              $("#img_analysis_atlas").attr("src", "/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + "_sites_per_gene.png?nocache="+nocache);
              $("#img_analysis_cluster").attr("src", "/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".cluster_genes.png?nocache="+nocache);
              $("#a_analysis_cluster").attr("href", "/comps/" + db["analysis"]["analysis_id"] + "/" + db["analysis"]["analysis_id"] + ".cluster_genes.png?nocache="+nocache);
              display_analysis_apamap("div_analysis_apamap", db["analysis"]["pair_type"]);

              $.get("/rnamotifs2/" + db["analysis"]["analysis_id"] + "_proximal_" + db["analysis"]["pair_type"] +"/rnamap/index.html?nocache="+nocache).done(function () {
                $("#btn_analysis_rna").show();
                //$("#iframe_analysis_proximal").attr("src", "/rnamotifs2/" + db["analysis"]["analysis_id"] + "_proximal_" + db["analysis"]["pair_type"] +"/rnamap/index.html?nocache="+nocache);
                $("#iframe_analysis_proximal").load("/rnamotifs2/" + db["analysis"]["analysis_id"] + "_proximal_" + db["analysis"]["pair_type"] +"/rnamap/index.html?nocache="+nocache);
                //$("#iframe_analysis_distal").attr("src", "/rnamotifs2/" + db["analysis"]["analysis_id"] + "_distal"+ "_" + db["analysis"]["pair_type"] +"/rnamap/index.html?nocache="+nocache);
                $("#iframe_analysis_distal").load("/rnamotifs2/" + db["analysis"]["analysis_id"] + "_distal_" + db["analysis"]["pair_type"] +"/rnamap/index.html?nocache="+nocache);
              }).fail(function () {
                $("#div_analysis_rna").hide();
                $("#btn_analysis_rna").hide();
              });
            } // analysis_type = apa

            if (data.analysis_type=="dge") {
              $("#div_analysis_clip").hide();
              $("#table_apa").hide();
              $("#analysis_apamap_title").hide();
              $("#div_analysis_apamap").hide();
              $("#btn_analysis_atlas").hide();
              $("#row_apa_switch_download").hide();
              $("#row_apausage_download").hide();
              $("#row_apaheat_download").hide();
              $("#div_pair_type").hide();
            }

            if (db["analysis"]["query"].status=="processing") {
              $('#div_analysis_download').css("opacity", "0.2");
              $("#lbl_analysis_status").html('<b><font color=#aa0000>Analysis Status: processing</font></b><img src=media/spinner.gif style="height: 16px; margin-top:-3px;vertical-align:middle; padding-right: 3px; opacity: 0.7">')
            } else {
              $("#lbl_analysis_status").html('<b><font color=#00aa00>Analysis Status: complete</font></b>');
            }
        })
        .fail(function(){
    });
  }

  function get_analysis_status() {
    post_data = {};
    post_data["action"] = "get_analysis_status";
    post_data["analysis_id"] = db["analysis"]["analysis_id"];
    $.post('/expressrna_gw/index.py', post_data)
        .done(function(result) {
          if (result=="processing") {
            $("#lbl_analysis_status").html('<b><font color=#aa0000>Analysis Status: processing</font></b><img src=media/spinner.gif style="height: 16px; margin-top:-3px;vertical-align:middle; padding-right: 3px; opacity: 0.7">')
            $('#div_analysis_download').css("opacity", "0.2");
            //$('#div_analysis_download a').click(function(e){ e.preventDefault(); });
            $('#div_analysis_es').css("opacity", "0.2");
            //$('#div_analysis_es a').click(function(e){ e.preventDefault(); });
          } else {
            $('#div_analysis_download').css("opacity", "1");
            $('#div_analysis_es').css("opacity", "1");
            $("#lbl_analysis_status").html('<b><font color=#00aa00>Analysis Status: complete</font></b>');
          }
        })
        .fail(function(){
    });
  }

  function display_analysis_parameters_fill(data) {
    html = "";
    if (data.analysis_type=="apa") {
      html += "Information about analysis parameters and experiments included in the analysis<br><br>"
      html += "<table class='es_table' width=850>";
      html += "<tr style='background-color: #efefef;'><td colspan=9><div style='font-weight: 600; color: #777777; padding-top: 5px; padding-bottom: 5px; font-size: 12px;'>Parameters of the analysis</div></td></tr>";
      html += "<tr style='background-color: #dfdfdf;'>";
      help_polya_db = "";
      html += "<td class=nowrap><font color=gray><b>Parameter Name</b></font></td>";
      html += "<td class=nowrap><font color=gray><b>Parameter Description</b></font></td>";
      html += "<td class=nowrap><font color=gray><b>Parameter Value</b></font></td>";
      html += "</tr>";
      polyadb_help = polyadb_help_dic[data["polya_db"]];
      html += "<tr><td class=nowrap>PolyA Database</td>";
      html += "<td>Genome-wide list of polyA sites used to compute the signal by clustering aligned reads around polyA sites.</td>";
      if (polyadb_help==undefined) {
        polyadb_help = "To determine polyA site usage, a novel polyA database (atlas) was constructed from the set of experiments used in the analysis or a broader set from the entire data library. Check which experiments were used in the <a href=https://expressRNA.org/share/polya/" + data["polya_db"] + ".config target=_new>" + data["polya_db"] + " database config file</a> for this analysis."
        polyadb_help = "<font color='darkgreen' class='btn' title='" + polyadb_help + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle;'></font>";
        html += "<td class=nowrap><a href='https://www.expressrna.org/share/polya/" + data["polya_db"] + ".bed.gz' target=_new>" + data["polya_db"] + "</a>" + polyadb_help + "</td></tr>";
      } else {
        polyadb_help = "<font color='darkgreen' class='btn' title='" + polyadb_help + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle;'></font>";
        html += "<td class=nowrap><a href='https://www.expressrna.org/share/polya/" + data["polya_db"] + ".bed.gz' target=_new>" + data["polya_db"] + "</a>" + polyadb_help + "</td></tr>";
      }

      html += "<tr><td class=nowrap>APA site selection</td>";
      html += "<td>The software applied to estimate differential polyA site usage.</td>";
      html += "<td>" + apa_software_dic[data["site_selection"]] + "</td></tr>";

      html += "<tr><td class=nowrap>PolyA site significance threshold</td>";
      html += "<td>FDR threshold value (control vs. test) for the individual polyA site to be considered undergoing a significant change.</td>";
      html += "<td>" + data["significance_thr"] + "</td></tr>";

      html += "<tr><td class=nowrap>PolyA site cDNA threshold</td>";
      html += "<td>Minimum number of reads (cDNA) at an individual polyA site for the site to be considered in the analysis.</td>";
      html += "<td>" + data["cDNA_thr"] + "</td></tr>";

      html += "<tr><td class=nowrap>PolyA site presence threshold</td>";
      html += "<td>Minimum proportion of experiments required to have the minimum cDNA threshold for an individual polyA site, for the polyA site to be considered in the analysis. This parameter is 1/n (1 = all experiments, 2 = half of the experiments, 3 = third of experiments).</td>";
      html += "<td>" + data["presence_thr"] + "</td></tr>";

      html += "<tr><td class=nowrap>PolyA site gene fraction threshold</td>";
      html += "<td>Minimum fraction of a polyA site in the gene compared to the most used polyA site in the gene for the polyA site to be considered in the analysis. Example: if a minor site has only 1% cDNA across all experiments compared to the polyA site with highest cDNA, and the threshold is 5%, the 1% polyA site will be ignored.</td>";
      html += "<td>" + "5%" + "</td></tr>";
      html += "</table>";

    } // analysis_type == apa

    return html;
  }

function display_analysis_experiments_fill(data_analysis, data, label) {
  html = "<table class='es_table'>";
  html += "<tr style='background-color: #efefef;'><td colspan=20><div style='font-weight: 600; color: #777777; padding-top: 5px; padding-bottom: 5px; font-size: 12px;'>" + label + "</div></td></tr>";
  html += "<tr style='background-color: #dfdfdf;'>";

  help_id = "Control experiment number in the analysis (c1, c2, ...) or test experiment number in the analysis (t1, t2, ...).";
  help_aligned = "Percentage of uniquely aligned reads to the reference genome.";
  help_identifier = "The identifier links the experiment to the library. The identification is composed of: library_id (e.g. 20171212_data) + experiment_id (e.g. e1). This identified uniquely maps the experiment to the data.<br><br>A click on the library identifier will open the display page for the library.";
  help_download = "Download data for each individual experiment:<br><br>FastQ: raw sequence data<br>BAM: unfiltered aligned reads<br>BED: polyA cDNA (computed for polyA sites in PolyA Database)<br><br>You can also copy the link and open the files directly in IGV for example.";

  html += "<td><font color=gray><b>Number</b></font><font class='btn' title='" + help_id + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "<td><font color=gray><b>Identifier</b></font><font class='btn' title='" + help_identifier + "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";

  for (var i=0; i<data_analysis.columns.length; i++) {
    html += "<td><font color=gray><b>" + data_analysis.columns[i][0] + "</b></font></td>";
  }

  html += "<td class=nowrap><font color=gray><b>Reads [M]</b></font></td>";
  html += "<td class=nowrap><font color=gray><b>Aligned [%]</b></font><font class='btn' title='" + help_aligned+ "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "<td class=nowrap>Downloads<font class='btn' title='" + help_download+ "'><img src=media/help.png style='height: 15px; margin-top:-2px;vertical-align:middle; padding-left: 3px;'></font></td>";
  html += "</tr>";
  for (var i=0; i<data.length; i++)
  {
    lib_id = data[i].lib_id;
    exp_id = data[i].exp_id;
    library_link = "javascript:open_library('" + lib_id + "');";
    html += "<tr style='font-weight: 300;'>";
    html += "<td class=nowrap align=center>" + data[i].cid + "</td><td class=notes><a href=" + library_link + ">" + data[i].lib_id + "</a>_e" + data[i].exp_id + "</td>";

    for (var j=0; j<data_analysis.columns.length; j++) {
      column_name = data_analysis.columns[j][1];
      column_value = data[i][column_name];
      if (column_name=="method") {
        column_value = data[i]["method_desc"]
      }
      html += "<td class=nowrap>" + column_value + "</td>";
    }

    html += "<td class=nowrap align=center>" + data[i].stats[0] + " M</td><td class=nowrap align=center>" + data[i].stats[1] + "</td>";

    fastq_link = "https://expressrna.org/share/data/" + lib_id + "/e" + exp_id + "/" + lib_id + "_e" + exp_id + ".fastq.gz";
    bam_link = "https://expressrna.org/share/data/" + lib_id + "/e" + exp_id + "/m1/" + lib_id + "_e" + exp_id + "_m1.bam";
    bed_link = "https://expressrna.org/share/data/" + lib_id + "/e" + exp_id + "/m1/" + lib_id + "_e" + exp_id + "_m1_db-" + data_analysis["polya_db"] + ".exp.bed.gz";
    html += "<td class=nowrap><a href=" + fastq_link + ">FastQ</a> | <a href=" + bam_link + ">BAM</a> | <a href=" + bed_link + ">BED</a></td>";
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function display_analysis_experiments(data_control, data_test, data) {
  html = "<center>";
  html += display_analysis_parameters_fill(data);
  html += "<br>";
  html += display_analysis_experiments_fill(data, data_control, "Control experiments");
  html += "<br>";
  html += display_analysis_experiments_fill(data, data_test, "Test experiments");
  $("#div_analysis_es").html(html);
  tippy('.btn', {theme: 'light', interactive: true});

  if (db["analysis"]["query"].status=="processing") {
    $('#div_analysis_es').css("opacity", "0.2");
  }
}

function display_analysis_go_fill(data) {
  html = "<table class='go_table'>";
  html += "<tr style='background-color: #dfdfdf;'>";
  html += "<td><font color=gray><b>GO term</b></font></td><td><font color=gray><b>GO name</b></font></td><td><font color=gray><b>GO genes</b></font></td><td><font color=gray><b>Depth</b></font></td><td><font color=gray><b>p-value</b></font></td><td><font color=gray><b>FDR</b></font></td><td><font color=gray><b>Red [%]</b></font></td><td><font color=gray><b>Enriched genes</b></font></td>";
  html += "</tr>";
  for (var i=0; i<Math.min(data.length, 10); i++)
  {
    data[i][0] = data[i][0].toFixed(5); // p-value
    if (data[i][0]>0.1) {
      continue;
    }
    data[i][6] = data[i][6].toFixed(5); // fdr
    data[i][4] = data[i][4].split(",").join(", ");
    html += "<tr>";
    html += "<td class=nowrap align=center>" + data[i][1] + "</td><td class=notes>" + data[i][3] + "</td><td class=nowrap align=center>" + data[i][5] + "</td><td class=nowrap align=center>" + data[i][2] + "</td><td class=nowrap align=center>" + data[i][0] + "</td><td class=nowrap align=center>" + data[i][6] + "</td><td class=nowrap align=center>" + data[i][7] + "</td><td class=genes>" + data[i][4] + "</td>";
    html += "</tr>";
  }
  html += "</table>";
  return html
}

function display_analysis_go(data) {
  pair_type = db["analysis"]["pair_type"];
  clip_index = db["analysis"]["clip_index"];
  go_aspect = db["analysis"]["go_aspect"];

  data = jQuery.extend(true, {}, data); // make deep copy, because we manipulate the data (float numbers etc), and load different go aspects several times (user switch)

  html = "<center>";
  html += "GO enrichment analysis (showing only top 10 terms with p-value<0.1)<a href=\"javascript:load_help('apaExpress_go.html');\"><img src=media/help.png height=16 style='padding-left:3px; margin-top:-2px;vertical-align:middle'></a><br>"

  html+= "<table border=0 class=gotype_menu><tr>";
  html+= "<td id='btn_go_P' onclick=\"javascript:change_go('P');\">biological process</td><td style='padding-left: 0px; padding-right: 0px; width:5px; background-color: transparent !important; cursor:default;'></td>";
  html+= "<td id='btn_go_C' onclick=\"javascript:change_go('C');\">cellular component</td>";
  html+= "</tr></table><br>";

  html += "<b>Repressed genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_repressed_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["repressed_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  html += "<b>Enhanced genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_enhanced_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["enhanced_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  html += "<b>Repressed proximal (protein bound) genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_repressed_proximal_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["repressed_proximal_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  html += "<b>Enhanced proximal (protein bound) genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_enhanced_proximal_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["enhanced_proximal_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  html += "<b>Repressed distal (protein bound) genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_repressed_distal_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["repressed_distal_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  html += "<b>Enhanced distal (protein bound) genes</b><img src=media/icon_download_small.png height=10 style='padding-left:5px; padding-right:3px; margin-top:-2px;vertical-align:middle'>";
  html += "<a href='/comps/" + db["analysis"]["analysis_id"] + "/rnamap/go_enhanced_distal_" + pair_type + ".tab' target=_download download>Download</a><br>";
  html += display_analysis_go_fill(data["enhanced_distal_"+pair_type+"_"+go_aspect]);
  html += "<br>";

  $("#div_analysis_go").html(html);

  // adjust buttons
  $("#btn_analysis_go_P").css("background-color", "#e1e1e1");
  $("#btn_analysis_go_C").css("background-color", "#e1e1e1");
  $("#btn_analysis_go_" + go_aspect).css("background-color", "#c1c1c1");

}

function delete_analysis() {
  html = "<b>Analysis Delete for " + db["analysis"]["analysis_id"] + "</b><br>";
  html += "Are you really sure you would like to delete this analysis and all it's results?" + "<br>";
  vex.dialog.open({
      unsafeMessage: html,
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Delete' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            delete_analysis_do(db["analysis"]["analysis_id"]);
          }
      }
  })
}

function delete_analysis_do(analysis_id) {
  post_data = {};
  post_data["action"] = "delete_analysis";
  if (google_user!=undefined)
    post_data["email"] = google_user.getBasicProfile().getEmail();
  post_data["analysis_id"] = analysis_id;
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
        search_analyses();
        open_analyses();
        update_user_usage();
      })
      .fail(function(){
  });
}

function edit_analysis() {
  adata = db["analysis"]["query"];
  html = "<b>Analysis Edit</b> (" + db["analysis"]["analysis_id"] + ")<br>";
  html += "<div style='font-size: 12px; color: #444444;'>Here you can edit some of the basic analysis text.</div>"
  public_analysis = "";
  analysis_access = Object.assign([], adata["access"]);
  analysis_owners = Object.assign([], adata["owner"]);
  if (analysis_owners.length==0) {
    analysis_owners.push(analysis_access[0]);
  }
  var index = analysis_access.indexOf("public");
  if (index > -1) {
      analysis_access.splice(index, 1);
      public_analysis = "checked";
  }
  vex.dialog.open({
      unsafeMessage: html,
      input: [
          '<textarea name="name" rows=1 placeholder="Name of Analysis" style="margin-bottom:10px;">' + adata["comps_name"] + '</textarea>',
          '<textarea name="notes" rows=4 placeholder="Additional Notes">' + adata["notes"] + '</textarea>',
          '<table style="font-size: inherit; font-weight: 200; font-family: \"Helvetica Neue\", sans-serif; color: #444;" border=0><tr><td valign=top width=270>',
          'Allow access to:<textarea style="margin-top: 3px;" name="access" rows=3 placeholder="Enter one e-mail per line">' + analysis_access.join("\n") + '</textarea>',
          '<input type=checkbox ' + public_analysis + ' id="ana_public" name="ana_public"><label class=unselectable for="ana_public">Make Analysis Public (visible to everyone)</label>',
          '</td><td valign=top width=270>',
          'Owners (can edit):<textarea style="margin-top: 3px;" name="owner" rows=3 placeholder="Enter one e-mail per line">' + analysis_owners.join("\n") + '</textarea>',
          '</td></tr></table>',
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Save' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: function (data) {
          if (!data) {
          } else {
            var analysis = {};
            analysis.analysis_id = db["analysis"]["analysis_id"];
            analysis.name = data.name;
            analysis.notes = data.notes;
            try {
              analysis.access = data.access.split("\n");
            } catch (err) {
              analysis.access = [];
            }
            try {
              analysis.owner = data.owner.split("\n");
            } catch (err) {
              analysis.owner = [];
            }
            if (data.ana_public)
              analysis.access.push("public");
            save_analysis(analysis);
          }
      }
  })
}

function save_analysis(data) {
  post_data = {};
  post_data["action"] = "save_analysis";
  if (google_user!=undefined)
    post_data["email"] = google_user.getBasicProfile().getEmail();
  post_data["analysis_id"] = data.analysis_id;
  post_data["name"] = data.name;
  post_data["notes"] = data.notes;
  post_data["access"] = data.access.join(",");
  post_data["owner"] = data.owner.join(",");
  $.post('/expressrna_gw/index.py', post_data)
      .done(function(result) {
        get_analysis(data.analysis_id);
        search_analyses();
      })
      .fail(function(){
  });
}

tippy('.btn', {theme: 'light', interactive: true});
