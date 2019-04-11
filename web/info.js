menu_select("menu_contributors");

function scroll_to(name) {
  window.scrollTo(0, $(name).position().top-60);
}

function show_info(name) {
  hide_all();
  $("#content_info").show();
  menu_select("menu_info");
  add_history({"action":"info", "section":name}, "index.html?action=info&section="+name);
  buttons = ["news", "contributors", "server", "contact"];
  for (var i=0; i<buttons.length; i++) {
    $("#div_"+buttons[i]).hide();
    $("#btn_"+buttons[i]).css("background-color", "#f1f1f1");
  }
  $("#div_"+name).show();
  $("#btn_"+name).css("background-color", "#FFA07A");
  $(window).scrollTop(0);
  if (name=="server") {
    show_stats_experiments();
  }
}

show_info("news");

function show_stats_experiments() {

  post_data = {};
  post_data["action"] = "get_server_data_stats";
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
        data = $.parseJSON(result);

        $("#div_stats_experiments").html("");
        var table_stats_experiments = "<table border=0 style='font-size: 12px; color: #555555;'>";
        var pie_data = [];
        var sum_all = 0;
        exp = data["data"]["experiments"];
        var temp = [];
        for (var el in exp) {
          sum_all += Number(exp[el]);
          temp.push([Number(exp[el]), el]);
        }
        temp.sort(function(a,b) { return - (a[0] - b[0]); } );
        for (var el in temp) {
          num = Number(temp[el][0]);
          item = temp[el][1];
          var element_inner = {};
          element_inner.value = num;
          element_inner.fraction = element_inner.value / sum_all;
          element_inner.display_value = element_inner.value
          element_inner.display_value1 = element_inner.value
          element_inner.display_value2 = element_inner.value
          element_inner.label = item + ", " + element_inner.value + " exps"
          element_inner.display_label = item + "<br>" + element_inner.value + " experiments"
          element_inner.color = "#f1f1f1";
          pie_data.push(element_inner);
          table_stats_experiments += "<tr><td align=right style='border-right: 1px solid #cacaca; padding-right: 5px;'>" + item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</td><td align=right>" + element_inner.value + " experiments</td></tr>";
        }
        table_stats_experiments += "<tr><td colspan=2 align=right style='font-weight: 600; color: #777777; padding-right: 5px;'>" + sum_all.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " experiments total</td></tr>";
        var stats_experiments_config = {
            containerId: "div_stats_experiments",
            highlightColor: "#FFB347",
            data: pie_data,
            label: function(d) {
              if (d.data.fraction>0.03) {
                return d.data.label;
              } else {
                return "";
              }
          },
          tooltip: function(d) {
              return d.dislay_label;
          },
          transitionDuration: 200,
          width: 200,
          height: 200,
        };
        var pie_stats_experiments = new psd3.Pie(stats_experiments_config);
        table_stats_experiments += "</table>";
        $("#table_stats_experiments").html(table_stats_experiments);

        $("#div_stats_methods").html("");
        var table_stats_methods = "<table border=0 style='font-size: 12px; color: #555555;'>";
        var pie_data = [];
        var sum_all = 0;
        exp = data["data"]["methods"];
        var temp = [];
        for (var el in exp) {
          sum_all += Number(exp[el]);
          temp.push([Number(exp[el]), el]);
        }
        temp.sort(function(a,b) { return - (a[0] - b[0]); } );
        for (var el in temp) {
          num = Number(temp[el][0]);
          item = temp[el][1];
          var element_inner = {};
          element_inner.value = num.toFixed(0);
          element_inner.fraction = element_inner.value / sum_all;
          element_inner.display_value = element_inner.value
          element_inner.display_value1 = element_inner.value
          element_inner.display_value2 = element_inner.value
          element_inner.label = item + ", " + element_inner.value;
          element_inner.display_label = item + "<br>" + element_inner.value + " experiments<br>"+Number(100*element_inner.fraction).toFixed(0)+"% of all experiments";
          element_inner.color = "#f1f1f1";
          pie_data.push(element_inner);
          table_stats_methods += "<tr><td align=right style='border-right: 1px solid #cacaca; padding-right: 5px;'>" + item + "</td><td align=right>" + element_inner.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " experiments (" + Number(100*element_inner.fraction).toFixed(0)+"% of all experiments)</td></tr>";
        }
        table_stats_methods += "<tr><td colspan=2 align=right style='font-weight: 600; color: #777777; padding-right: 5px;'>" + sum_all.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " experiments total</td></tr>";
        var stats_methods_config = {
            containerId: "div_stats_methods",
            highlightColor: "#FFB347",
            data: pie_data,
            label: function(d) {
              if (d.data.fraction>0.03) {
                return d.data.label;
              } else {
                return "";
              }
          },
          tooltip: function(d) {
              return d.display_label;
          },
          transitionDuration: 200,
          width: 200,
          height: 200,
        };
        var pie_stats_methods = new psd3.Pie(stats_methods_config);
        table_stats_methods += "</table>";
        $("#table_stats_methods").html(table_stats_methods);

        $("#div_stats_reads").html("");
        var table_stats_reads = "<table border=0 style='font-size: 12px; color: #555555;'>";
        var pie_data = [];
        var sum_all = 0;
        exp = data["data"]["reads"];
        var temp = [];
        for (var el in exp) {
          sum_all += Number(exp[el]);
          temp.push([Number(exp[el]), el]);
        }
        temp.sort(function(a,b) { return - (a[0] - b[0]); } );
        for (var el in temp) {
          num = Number(temp[el][0]);
          item = temp[el][1];
          var element_inner = {};
          element_inner.value = num.toFixed(0);
          element_inner.fraction = element_inner.value / sum_all;
          element_inner.display_value = element_inner.value
          element_inner.display_value1 = element_inner.value
          element_inner.display_value2 = element_inner.value
          element_inner.label = item + ", " + element_inner.value + "M";
          element_inner.display_label = item + "<br>" + element_inner.value + " million reads<br>"+Number(100*element_inner.fraction).toFixed(0)+"% of all reads";
          element_inner.color = "#f1f1f1";
          pie_data.push(element_inner);
          table_stats_reads += "<tr><td align=right style='border-right: 1px solid #cacaca; padding-right: 5px;'>" + item + "</td><td align=right>" + element_inner.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " million reads (" + Number(100*element_inner.fraction).toFixed(0)+"% of all reads)</td></tr>";
        }
        table_stats_reads += "<tr><td colspan=2 align=right style='font-weight: 600; color: #777777; padding-right: 5px;'>" + sum_all.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " million reads total</td></tr>";
        var stats_reads_config = {
            containerId: "div_stats_reads",
            highlightColor: "#FFB347",
            data: pie_data,
            label: function(d) {
              if (d.data.fraction>0.03) {
                return d.data.label;
              } else {
                return "";
              }
          },
          tooltip: function(d) {
              return d.display_label;
          },
          transitionDuration: 200,
          width: 200,
          height: 200,
        };
        var pie_stats_reads = new psd3.Pie(stats_reads_config);
        table_stats_reads += "</table>";
        $("#table_stats_reads").html(table_stats_reads);

      })
      .error(function(){
  });


}
