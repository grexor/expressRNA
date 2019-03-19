function get_server_stats() {
  post_data = {};
  post_data["action"] = "get_server_stats";
  $.post('/expressrna_gw/index.py', post_data)
      .success(function(result) {
        data = $.parseJSON(result);
        for (var i=0; i<data["cpu"].length; i++) {
          cpu_perc = String(data["cpu"][i].toFixed(0));
          if (cpu_perc.length==1)
            cpu_perc = "&nbsp;&nbsp;"+cpu_perc;
          else if (cpu_perc.length==2)
            cpu_perc = "&nbsp;"+cpu_perc;
          $("#div_cpu" + (i+1) + "_text").html("CPU"+(i+1)+": " + cpu_perc + "%");
          $("#div_cpu" + (i+1) + "_width").css("width", data["cpu"][i].toFixed(0)+"%");
        }
      })
      .error(function(){
  });
}

var get_server_stats_interval = setInterval(get_server_stats, 5000);
