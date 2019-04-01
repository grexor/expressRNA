menu_select("menu_contributors");

function scroll_to(name) {
  window.scrollTo(0, $(name).position().top-60);
}

function show_info(name) {
  open_info();
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
        var pie_data = [];
        var sum_all = 0;
        exp = data["data"]["experiments"];
        for (var el in exp) {
          sum_all += Number(exp[el]);
        }
        for (var el in exp) {
          var element_inner = {};
          element_inner.value = Number(exp[el]);
          element_inner.fraction = element_inner.value / sum_all;
          element_inner.display_value = element_inner.value
          element_inner.display_value1 = element_inner.value
          element_inner.display_value2 = element_inner.value
          element_inner.label = el + ", " + element_inner.value + " exps"
          element_inner.display_label = el + "<br>" + element_inner.value + " experiments"
          element_inner.color = "#f1f1f1";
          pie_data.push(element_inner);
        }

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



        $("#div_stats_reads").html("");
        var pie_data = [];
        var sum_all = 0;
        exp = data["data"]["reads"];
        for (var el in exp) {
          sum_all += Number(exp[el]);
        }
        for (var el in exp) {
          var element_inner = {};
          element_inner.value = Number(exp[el]).toFixed(2);
          element_inner.fraction = element_inner.value / sum_all;
          element_inner.display_value = element_inner.value
          element_inner.display_value1 = element_inner.value
          element_inner.display_value2 = element_inner.value
          element_inner.label = el + ", " + element_inner.value + "M";
          element_inner.display_label = el + "<br>" + element_inner.value + " million reads<br>"+Number(100*element_inner.fraction).toFixed(0)+"% of all reads";
          element_inner.color = "#f1f1f1";
          pie_data.push(element_inner);
        }
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

      })
      .error(function(){
  });


}
