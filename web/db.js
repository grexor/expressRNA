var google_user = undefined;

var email = "public";
var nocache = Math.floor(Math.random() * 9999999);
var analysis_id = "";
var analysis_name = "";
var analysis_module = "es";
var help_url = "";
var tab_to_load = "";
var pop_state = false;
var push_latest = -1;

var apa_software_dic = {}
apa_software_dic["DEX"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";
apa_software_dic["DEX4"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";
apa_software_dic["DEXSEQ"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";

var polyadb_help_dic = {}
polyadb_help_dic["hg19_polyasite"] = "To determine polyA site usage, polyAsite hg19 atlas was used and the aligned reads from the experiments were assigned to the given polyA site loci. Explore more at <a href=http://polyasite.unibas.ch/#download target=_new>http://polyasite.unibas.ch</a>."

var db = {};

db["libraries"] = {};
db["libraries"]["current_column_sort"] = "name:asc";
db["libraries"]["display_pages"] = 3;
db["libraries"]["records_per_page"] = 20;
db["libraries"]["current_page"] = 0;

db["analyses"] = {};
db["analyses"]["current_column_sort"] = "last_change:desc";
db["analyses"]["display_pages"] = 3;
db["analyses"]["records_per_page"] = 20;
db["analyses"]["current_page"] = 0;

db["library"] = {};

db["analysis"] = {};

db["user"] = {};
