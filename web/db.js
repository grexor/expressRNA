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
polyadb_help_dic["hg38_polyasite"] = "To determine polyA site usage, polyAsite hg38 atlas was used and the aligned reads from the experiments were assigned to the given polyA site loci. Explore more at <a href=http://polyasite.unibas.ch/#download target=_new>http://polyasite.unibas.ch</a>."

genomes = {};
genomes["hg38"] = ["hg38", "Homo sapiens, hg38, Ensembl 98"]
genomes["hg19"] = ["hg19", "Homo sapiens, hg19, Ensembl 75"]
genomes["mm10"] = ["mm10", "Mus musculus, mm10, Ensembl 98"]
genomes["mm9"] = ["mm9", "Mus musculus, mm9, Ensembl 67"]
genomes["dm6"] = ["dm6", "Drosophila melanogaster, dm6, Ensembl 90"]
genomes["dd"] = ["dd", "Dictyostelium discoideum, dd2.7, Ensembl 44"]
genomes["at"] = ["at", "Arabidopsis thaliana, at, Ensembl 39"]
genomes["mar3"] = ["mar3", "Marchantia polymorpha, mar3, Ensembl 44"]
genomes["tt"] = ["tt", "Tetrahymena thermophila, Ciliate assembly and annotation"]
genomes["mar5"] = ["mar5", "Marchantia polymorpha, mar5"]

methods = {};
methods["RNAseq"] = ["RNAseq", "RNA-seq"]
methods["lexrev"] = ["lexrev", "QuantSeq reverse, Lexogen, 3'-end targeted"]
methods["lexfwd"] = ["lexrev", "QuantSeq forward, Lexogen, 3'-end targeted"]
methods["nano"] = ["nano", "Nanopore, long-read sequencing (direct RNA)"]
methods["scRNA"] = ["scRNA", "scRNA, Single-cell 10x Genomics"]
methods["aseq"] = ["aseq", "ASEQ, 3'-end targeted protocol"]
methods["drs"] = ["drs", "DRS, 3'-end targeted protocol"]
methods["3reads"] = ["3reads", "3READS, 3'-end targeted protocol"]
methods["sapas"] = ["sapas", "SAPAS, 3'-end targeted protocol"]
methods["3pseq"] = ["3pseq", "3P-Seq, 3'-end targeted protocol"]
methods["polyaseq"] = ["polyaseq", "PolyA-Seq, 3'-end targeted protocol"]
methods["passeq"] = ["passeq", "PAS-Seq, 3'-end targeted protocol"]
methods["paperclip"] = ["paperclip", "PAPERCLIP, 3'-end targeted protocol"]
methods["3seq"] = ["3seq", "3'-seq, 3'-end targeted protocol"]
methods["paseq"] = ["paseq", "PA-seq, 3'-end targeted sequencing"]
methods["deffwd"] = ["deffwd", "RNA-seq, general forward 3'-end targeted"]
methods["bs"] = ["bs", "Bisulfite sequencing"]

analyses = {};
//analyses["apa"] = ["APA", "Alternative PolyAdenylation (APA) comparison"]
analyses["dge"] = ["dge", "Differential gene expression"]

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
db["access_levels"]["level1"]["diskspace"] = 250

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

//level4
db["access_levels"]["level4"] = {}
db["access_levels"]["level4"]["experiments"] = 20
db["access_levels"]["level4"]["libraries"] = 2
db["access_levels"]["level4"]["diskspace"] = 4000

//level5
db["access_levels"]["level5"] = {}
db["access_levels"]["level5"]["experiments"] = 2000
db["access_levels"]["level5"]["libraries"] = 100
db["access_levels"]["level5"]["diskspace"] = 3000
