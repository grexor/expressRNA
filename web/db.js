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
var last_url = "";

var apa_software_dic = {}
apa_software_dic["DEX"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";
apa_software_dic["DEX4"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";
apa_software_dic["DEXSEQ"] = "<a href='http://bioconductor.org/packages/release/bioc/html/DEXSeq.html' target=_new>DEXSeq</a>";

var polyadb_help_dic = {}
polyadb_help_dic["hg19_polyasite"] = "To determine polyA site usage, polyAsite hg19 atlas was used and the aligned reads from the experiments were assigned to the given polyA site loci. Explore more at <a href=http://polyasite.unibas.ch/#download target=_new>http://polyasite.unibas.ch</a>."

genomes = {};
genomes["hg38"] = ["hg19", "hg38, <i>Homo sapiens</i>, assembly: hg38, annotation: Ensembl 90"]
genomes["hg19"] = ["hg19", "hg19, <i>Homo sapiens</i>, assembly: hg19, annotation: Ensembl 75"]
genomes["mm10"] = ["mm10", "mm10, Mus musculus, assembly: mm10, annotation: Ensembl 90"]
genomes["mm9"] = ["mm9", "mm9, Mus musculus, assembly: mm9, annotation: Ensembl 67"]
genomes["dm6"] = ["dm6", "dm6, <i>Drosophila melanogaster</i>, assembly: dm6, annotation: Ensembl 90"]
genomes["at"] = ["at", "at, <i>Arabidopsis thaliana</i>, assembly: at, annotation: Ensembl 39"]
genomes["mar3"] = ["mar3", "mar3, <i>Marchantia polymorpha</i>, assembly: mar3, annotation: mar3"]

methods = {};
methods["lexrev"] = ["lexrev", "Lexrev, Lexogen Quantseq Reverse, 3'-end targeted"]
methods["lexfwd"] = ["lexrev", "Lexfwd, Lexogen Quantseq Forward, 3'-end targeted"]
methods["RNAseq"] = ["RNAseq", "RNA-seq, classic whole transcriptome RNA-seq"]
methods["scRNA"] = ["scRNA", "scRNA, Single-cell 10x Genomics"]
methods["paseq"] = ["paseq", "PA-seq 3'-end targeted sequencing"]
methods["nano"] = ["nano", "Nanopore, long-read sequencing (direct RNA)"]
methods["bs"] = ["bs", "Bisulfite sequencing"]

var db = {};

db["libraries"] = {};
db["libraries"]["current_column_sort"] = "lib_id:desc";
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

db["access_levels"] = {}

// guest
db["access_levels"]["guest"] = {}
db["access_levels"]["guest"]["experiments"] = 0
db["access_levels"]["guest"]["libraries"] = 0
db["access_levels"]["guest"]["diskspace"] = 0

//level1
db["access_levels"]["level1"] = {}
db["access_levels"]["level1"]["experiments"] = 4
db["access_levels"]["level1"]["libraries"] = 1
db["access_levels"]["level1"]["diskspace"] = 100

//level2
db["access_levels"]["level2"] = {}
db["access_levels"]["level2"]["experiments"] = 8
db["access_levels"]["level2"]["libraries"] = 2
db["access_levels"]["level2"]["diskspace"] = 500

//level3
db["access_levels"]["level3"] = {}
db["access_levels"]["level3"]["experiments"] = 40
db["access_levels"]["level3"]["libraries"] = 2
db["access_levels"]["level3"]["diskspace"] = 2000

//level5
db["access_levels"]["level5"] = {}
db["access_levels"]["level5"]["experiments"] = 2000
db["access_levels"]["level5"]["libraries"] = 100
db["access_levels"]["level5"]["diskspace"] = 3000
