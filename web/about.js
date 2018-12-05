menu_select("link_about");

function open_contacts()
{
  tab_to_load = 'contact';
  load_page("info.html");
}

  var combined = [];

  function get_commits(url, done_function) {
      $.ajax({type: "GET", url: url}).done(done_function);
  }

  $.ajax({
    type: "GET",
    url: "https://api.github.com/repos/meringlab/apa/commits",
    })
    .done(function(data) {
      var commits = [];
      for (i=0;i<=10;i++)
      {
        data[i].repo = "apa";
        data[i].date = new Date(data[i].commit.author.date);
        combined.push(data[i]);
      }
      $.ajax({
        type: "GET",
        url: "https://api.github.com/repos/grexor/rnamotifs2/commits",
        })
        .done(function(data2) {
          var commits = [];
          for (i=0;i<=10;i++)
          {
            data2[i].repo = "RNAmotifs2";
            data2[i].date = new Date(data2[i].commit.author.date);
            combined.push(data2[i]);
          }

          $.ajax({
            type: "GET",
            url: "https://api.github.com/repos/grexor/pybio/commits",
            })
            .done(function(data3) {
              var commits = [];
              for (i=0;i<=10;i++)
              {
                data3[i].repo = "pybio";
                data3[i].date = new Date(data3[i].commit.author.date);
                combined.push(data3[i]);
              }

            // finally, sort all the commits by date
            combined.sort(function(a, b) {
                a = new Date(a.commit.author.date);
                b = new Date(b.commit.author.date);
                return a>b ? -1 : a<b ? 1 : 0;
              });

            for (i=0;i<=30;i++)
            {
              var message = combined[i].commit.message;
              var date = combined[i].date;
              date = date.getDate() + " "+ months[(date.getMonth())] + " " + date.getFullYear();
              url = combined[i].html_url;
              repo = combined[i].repo;
              commits.push("<div class='commits_font'><img src=media/checkbox.png width=12px>&nbsp;" + repo + "&nbsp;<a target='_commit' href='" + url + "'>" + date + ": " + message+"</a></div>");
            }
            $("#lbl_commits").html(commits.join(""));
          });
        });
    });

  tippy('.btn', {theme: 'light', interactive: true});
