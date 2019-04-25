import urllib2
import json
import datetime
from operator import itemgetter, attrgetter, methodcaller
import config
import os

def populate_commits(url, repo):
    data = urllib2.urlopen(url).read()
    data = json.loads(data)
    for i in range(10):
      data[i]["repo"] = repo
      data[i]["date"] = datetime.datetime.strptime(data[i]["commit"]["author"]["date"], "%Y-%m-%dT%H:%M:%SZ")
      data[i]["sortdate"] = data[i]["date"].strftime("%Y%m%d")
      commits.append(data[i]);

commits = [];

populate_commits("https://api.github.com/repos/grexor/apa/commits", "apa")
populate_commits("https://api.github.com/repos/grexor/pybio/commits", "pybio")
populate_commits("https://api.github.com/repos/grexor/rnamotifs2/commits", "rnamotifs2")

commits = sorted(commits, key=lambda k: k['sortdate'], reverse=True)

div = []
for i in range(25):
    message = commits[i]["commit"]["message"];
    date = commits[i]["date"];
    date = commits[i]["date"].strftime("%d %B %Y")
    url = commits[i]["html_url"];
    repo = commits[i]["repo"];
    div.append("<div class='commits_font'><img src=media/checkbox.png width=12px>&nbsp;" + repo + "&nbsp;<a target='_commit' href='" + url + "'>" + date + ": " + message+"</a></div>");

if len(div)>20:
    f = open(os.path.join(config.expressrna_folder, "github.txt"), "wt")
    f.write("".join(div))
    f.close()
