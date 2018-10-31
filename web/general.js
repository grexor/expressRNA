var months = [ "January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December" ];

function format_date_time(date) {
  day = date.getDay()+1;
  month = {1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"May", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"}[(date.getMonth()+1)];
  year = date.getFullYear();
  hour = String(date.getHours());
  minutes = String(date.getMinutes());
  if (hour.length<2) {
    hour = "0"+hour;
  }
  if (minutes.length<2) {
    minutes = "0"+minutes;
  }
  return day + " " + month + " " + year + " " + hour + ":" + minutes +"h";
}

function resize_iframe(iframe) {
  iframe.height = 0;
  iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
  iframe.height = "400px";
}

function load_page(name, force=false) {
  $("body").addClass("waiting");
  if (page_loaded!=name) {
    page_loaded = name;
    $("#div_main").load(name+"?nocache="+nocache, "", load_page_complete);
    return;
  }
  if (force) {
    page_loaded = name;
    $("#div_main").load(name+"?nocache="+nocache, "", load_page_complete);
    return;
  }
}

function load_page_complete(responseText, textStatus, jqXHR) {
  // when loading pages, we need to allow history creation only when the page is already loaded
  push_history = true;
  // for search, we need the query to remove the wait
  if (["search.html"].indexOf(page_loaded)==-1) {
    $("body").removeClass("waiting");
  }
}
