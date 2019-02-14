import json
import cgi
import os
import sys
import hashlib
import datetime
import smtplib
import random
import pybio
import expressrna_py
from expressrna_py.db import *
import apa
import glob
import shlex
import copy
import re
import shutil
from operator import itemgetter

upload_folder = '/home/gregor/expressrna_dev/web/uploads'

db = {}
db["methods"] = {}
db["methods"][""] = {"desc": "not selected"}

db["methods"]["lexrev"] = {}
db["methods"]["lexrev"]["desc"] = "<a href='%s' target=_new>Lexogen Quantseq Reverse<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>"
db["methods"]["lexrev"]["link"] = "http://www.lexogen.com"

db["methods"]["lexfwd"] = {}
db["methods"]["lexfwd"]["desc"] = "<a href='%s' target=_new>Lexogen Quantseq Forward<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>"
db["methods"]["lexfwd"]["link"] = "http://www.lexogen.com"

db["genomes"] = {}
db["genomes"][""] = {"desc" : "not selected"}

db["genomes"]["at"] = {}
db["genomes"]["at"]["desc"] = "<i>Arabidopsis Thaliana</i>, Assembly: <a href='%s' target=_new'>at6<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>, Annotation: <a href='%s' target=_new>GTF Ensembl 39<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>";
db["genomes"]["at"]["link_assembly"] = "ftp://ftp.ensemblgenomes.org/pub/plants/release-39/fasta/arabidopsis_thaliana/dna/Arabidopsis_thaliana.TAIR10.dna.toplevel.fa.gz"
db["genomes"]["at"]["link_annotation"] = "ftp://ftp.ensemblgenomes.org/pub/plants/release-39/gtf/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.39.gtf.gz"

db["genomes"]["hg19"] = {}
db["genomes"]["hg19"]["desc"] = "<i>Homo sapiens</i>, Assembly: <a href='%s' target=_new'>hg19<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>, Annotation: <a href='%s' target=_new>GTF Ensembl 75<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>";
db["genomes"]["hg19"]["link_assembly"] = "ftp://ftp.ensembl.org/pub/release-75/fasta/homo_sapiens/dna/Homo_sapiens.GRCh37.75.dna.primary_assembly.fa.gz"
db["genomes"]["hg19"]["link_annotation"] = "ftp://ftp.ensembl.org/pub/release-75/gtf/homo_sapiens/Homo_sapiens.GRCh37.75.gtf.gz"

db["genomes"]["hg38"] = {}
db["genomes"]["hg38"]["desc"] = "<i>Homo sapiens</i>, Assembly: <a href='%s' target=_new'>hg38<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>, Annotation: <a href='%s' target=_new>GTF Ensembl 90<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>";
db["genomes"]["hg38"]["link_assembly"] = "ftp://ftp.ensembl.org/pub/release-90/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz"
db["genomes"]["hg38"]["link_annotation"] = "ftp://ftp.ensembl.org/pub/release-90/gtf/homo_sapiens/Homo_sapiens.GRCh38.90.chr.gtf.gz"

db["genomes"]["mm10"] = {}
db["genomes"]["mm10"]["desc"] = "<i>Mus musculus</i>, Assembly: <a href='%s' target=_new'>mm10<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>, Annotation: <a href='%s' target=_new>GTF Ensembl 90<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>";
db["genomes"]["mm10"]["link_assembly"] = "ftp://ftp.ensembl.org/pub/release-90/fasta/mus_musculus/dna/Mus_musculus.GRCm38.dna.primary_assembly.fa.gz"
db["genomes"]["mm10"]["link_annotation"] = "ftp://ftp.ensembl.org/pub/release-90/gtf/mus_musculus/Mus_musculus.GRCm38.90.gtf.gz"

db["genomes"]["rn6"] = {}
db["genomes"]["rn6"]["desc"] = "<i>Rattus norvegicus</i>, Assembly: <a href='%s' target=_new'>rn6<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>, Annotation: <a href='%s' target=_new>GTF Ensembl 91<img src=media/linkout.png style='height:10px; padding-left: 2px; padding-right: 2px;'></a>";
db["genomes"]["rn6"]["link_assembly"] = "ftp://ftp.ensembl.org/pub/release-91/fasta/rattus_norvegicus/dna/Rattus_norvegicus.Rnor_6.0.dna.toplevel.fa.gz"
db["genomes"]["rn6"]["link_annotation"] = "ftp://ftp.ensembl.org/pub/release-91/gtf/rattus_norvegicus/Rattus_norvegicus.Rnor_6.0.91.chr.gtf.gz"

class TableClass():

    def log(self, message):
        print >> self.environ['wsgi.errors'], message

    def __init__(self, environ, start_response):
        self.environ = environ
        self.start = start_response
        self.get_done = "Get done."
        self.string_remove = "Remove done."
        self.string_put = "Save done."
        self.string_insert = "Save done."
        self.string_save = "Save done."
        self.string_key_conflict = "Key conflict."
        self.pars = self.parse_fields(self.environ)
        self.username = self.pars.get("username", "public")
        self.password = self.pars.get("password", "public")
        self.db = {}

    def __iter__(self):
        status = '200 OK'
        response_headers = [('Content-type','text/plain')]
        self.stream_out = self.start(status, response_headers)
        method = getattr(self, self.pars.get("action", "version"))
        yield method()

    def parse_fields(self, environ):
        request_method = environ["REQUEST_METHOD"]
        if environ["REQUEST_METHOD"]=="GET":
            pars = cgi.parse_qs(environ['QUERY_STRING'])
            for par, [val] in pars.items():
                pars[par] = val
        if environ["REQUEST_METHOD"]=="POST":
            self.formdata = cgi.FieldStorage(environ=environ, fp=environ['wsgi.input'])
            pars = {}
            for key in self.formdata.keys():
                  pars[key] = self.formdata[key].value
        return pars

    def version(self):
        return "expressRNA v1.0 %s" % datetime.datetime.now()

    # find is case insensitive, replace is case sensitive (doesn't change the original text)
    # wraps s1 with up and down -> up + s1 + down, and replaces the construct in text
    def replace_ignorecase(self, s1, up, down, text):
        new_string = ""
        last_x = 0
        for x in [m.start() for m in re.finditer(s1, text, flags=re.IGNORECASE)]:
            new_string += text[last_x:x]
            new_string += up
            new_string += text[x:x+len(s1)]
            new_string += down
            last_x = x+len(s1)
        new_string += text[last_x:]
        return new_string

    def upload_file(self):
        if 'newfile' in self.formdata and self.formdata['newfile'].filename != '':
            file_data = self.formdata['newfile'].file.read()
            filename = self.formdata['newfile'].filename
            lib_id = self.pars.get("lib_id", None)
            if lib_id==None:
                return
            target = os.path.join(upload_folder, filename)
            f = open(target, 'wb')
            f.write(file_data)
            f.close()
            library = apa.annotation.libs[lib_id]
            library.add_empty_experiment()
            library.save()
        return "done"

    def send_email(self, address_to, subject, message):
        server = smtplib.SMTP_SSL('smtp.googlemail.com', 465)
        server.login("expressrna@gmail.com", "pprepxprkkwudnrs")
        server.ehlo()
        message = "From: %s\nTo: %s\nSubject: %s\n\n%s" % ("expressRNA <expressrna@gmail.com>", address_to, subject, message)
        server.sendmail("expressRNA <expressrna@gmail.com>", address_to, message)

    def get(self):
        conn = Session()
        search = self.pars.get("search", "").replace(" ", "")
        species = self.pars.get("species", "hg19")
        loc = search.split(":")
        if len(loc)==2:
            chr = loc[0].lstrip("chr")
            pos = loc[1].split("-")
            if len(pos)!=2:
                pos = loc[1].split("..")
            if len(pos)==2:
                try:
                    pos_from, pos_to = int(pos[0]), int(pos[1])
                    q = conn.query(Apadb).filter(Apadb.species==species).filter(and_(Apadb.chr==chr, Apadb.pos>=pos_from, Apadb.pos<=pos_to)).all()
                except:
                    pass
        else:
            q = conn.query(Apadb).filter(Apadb.species==species).filter(or_(Apadb.gene_id.like("%%%s%%" % search), Apadb.gene_name.like("%%%s%%" % search))).all()
        result = {'status': 'done', 'data': []}
        for rec in q:
            result['data'].append(rec.get_json())
        result['records'] = len(result['data'])
        return str(json.dumps(result))

    def list_analysis(self):
        """
        Return list of all analysis for the logged-in user or for "public"
        TODO: delete list_comps, older version
        """
        email = self.pars.get("email", "public")
        email = self.check_login(email)
        sort_by, sort_order = self.pars.get("sort_by", "name:asc").split(":")
        current_page = int(self.pars.get("current_page", 0))
        records_per_page = int(self.pars.get("records_per_page", 5))
        search = self.pars.get("search", "").lower()
        conn = Session()
        result = []
        config_files = glob.glob("/home/gregor/apa/data.comps/*/*.config")
        for fname in config_files:
            comps_id = os.path.basename(fname).replace(".config", "")
            try:
                comps = apa.comps.Comps(comps_id)
            except:
                comps = None
                continue
            last_change = os.stat(fname).st_mtime
            r = {}
            r["config_file"] = fname
            r["comps_id"] = comps.comps_id
            r["analysis_id"] = comps.comps_id
            r["comps_name"] = comps.name
            r["name"] = comps.name
            r["comps_name_search"] = comps.name
            r["last_change"] = datetime.datetime.fromtimestamp(last_change)
            r["notes"] = comps.notes
            r["notes_search"] = comps.notes
            r["authors"] = comps.authors
            r["authors_search"] = comps.authors
            r["method"] = comps.method
            r["method_search"] = db["methods"][comps.method]["desc"]
            r["genome"] = comps.genome
            r["genome_search"] = db["genomes"][comps.genome]["desc"]
            if r["method_search"]!="not selected":
                r["method_search"] = r["method_search"] % (db["methods"][r["method"]]["link"])
            if r["genome_search"]!="not selected":
                r["genome_search"] = r["genome_search"] % (db["genomes"][r["genome"]]["link_assembly"], db["genomes"][r["genome"]]["link_annotation"])
            include_analysis = True
            if len(search)>=2:
                include_analysis = False
                if comps.name.lower().find(search)!=-1 or comps.notes.lower().find(search)!=-1 or comps.authors.lower().find(search)!=-1 or comps.comps_id.lower().find(search)!=-1:
                    include_analysis = True
                    r["comps_name_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["comps_name_search"])
                    r["notes_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["notes_search"])
                    r["authors_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["authors_search"])
                    if r["method_search"]!="not selected":
                        r["method_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["method_search"])
                    if r["genome_search"]!="not selected":
                        r["genome_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["genome_search"])
            if (email in comps.access) or ("public" in comps.access):
                if include_analysis:
                    result.append(r)

        result = sorted(result, key=itemgetter(sort_by))
        count = len(result)
        if sort_order=="desc":
            result.reverse()
        result = result[current_page * records_per_page: current_page * records_per_page + records_per_page]
        return json.dumps({"data":result, "count":count}, default=dthandler)

    def list_libraries(self):
        """
        Return list of all libraries for the logged-in user or for "public"
        """
        apa.annotation.init()
        email = self.pars.get("email", "public")
        email = self.check_login(email)
        current_page = int(self.pars.get("current_page", 0))
        records_per_page = int(self.pars.get("records_per_page", 5))
        search = self.pars.get("search", "").lower()
        sort_by, sort_order = self.pars.get("sort_by", "name:asc").split(":")
        conn = Session()
        result = []
        libs = apa.annotation.libs
        for lib_id, lib_data in libs.items():
            if (not "public" in lib_data.access) and (not email in lib_data.access):
                continue
            r = {}
            r["lib_id"] = lib_id
            r["lib_id_search"] = lib_id
            r["name"] = lib_data.name
            r["name_search"] = lib_data.name
            r["notes"] = lib_data.notes
            r["notes_search"] = lib_data.notes
            r["method"] = lib_data.method
            r["method_search"] = db["methods"][lib_data.method]["desc"]
            r["genome"] = lib_data.genome
            r["genome_search"] = db["genomes"][lib_data.genome]["desc"]
            include_library = True
            if len(search)>=2:
                include_library = False
                if r["lib_id"].lower().find(search)!=-1 or r["name"].lower().find(search)!=-1 or r["notes"].lower().find(search)!=-1 or r["method_search"].lower().find(search)!=-1 or r["genome_search"].lower().find(search)!=-1:
                    include_library = True
                    r["lib_id_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["lib_id_search"])
                    r["name_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["name_search"])
                    r["notes_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["notes_search"])
                    if r["method_search"]!="not selected":
                        r["method_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["method_search"])
                        r["method_search"] = r["method_search"] % (db["methods"][r["method"]]["link"])
                    if r["genome_search"]!="not selected":
                        r["genome_search"] = self.replace_ignorecase(search, "<div style='display: inline; font-weight: bold; color: #FF0000'>", "</div>", r["genome_search"])
                        r["genome_search"] = r["genome_search"] % (db["genomes"][r["genome"]]["link_assembly"], db["genomes"][r["genome"]]["link_annotation"])
            if include_library:
                result.append(r)

        result = sorted(result, key=itemgetter(sort_by))
        count = len(result)
        if sort_order=="desc":
            result.reverse()
        result = result[current_page * records_per_page: current_page * records_per_page + records_per_page]
        return json.dumps({"data":result, "count":count}, default=dthandler)

    def get_analysis(self):
        apa.annotation.init()
        stats = {}
        involved_libs = set()

        def read_stats(lib_id):
            if stats.get(lib_id, None)==None:
                fname = os.path.join(apa.path.lib_folder(lib_id), "%s_m%s.stats.tab" % (lib_id, 1))
                res = {}
                f = open(fname, "rt")
                r = f.readline()
                r = f.readline()
                while r:
                    r = r.replace("\r", "").replace("\n", "").split("\t")
                    res[int(r[0])] = (r[-3], r[-1])
                    r = f.readline()
                f.close()
                stats[lib_id] = res

        def make_table(comps_data):
            res = []
            for (cid, exp_list, name) in comps_data:
                for exp_rec in exp_list:
                    lib_id = "_".join(exp_rec.split("_")[:-1])
                    involved_libs.add(lib_id)
                    exp_id = int(exp_rec.split("_")[-1][1:])
                    ann = copy.copy(apa.annotation.libs[lib_id].experiments[exp_id])
                    ann["method_desc"] = ann["method"]
                    ann["lib_id"] = lib_id
                    ann["exp_id"] = exp_id
                    ann["cid"] = cid
                    read_stats(lib_id)
                    ann["stats"] = copy.copy(stats[lib_id][exp_id])
                    res.append(ann)
            return res

        comps_id = self.pars.get("comps_id", None)
        if comps_id==None:
            return "empty"
        comps = apa.comps.Comps(comps_id)
        email = self.pars.get("email", "public")
        pair_type = self.pars.get("pair_type", "same")

        folder = os.path.join(apa.path.comps_folder, comps_id)
        last_change = os.stat(folder).st_mtime
        r = {}
        r["comps_id"] = comps_id
        r["comps_name"] = comps.name
        r["CLIP"] = comps.CLIP
        r["site_selection"] = comps.site_selection
        r["significance_thr"] = comps.significance_thr
        r["cDNA_thr"] = comps.cDNA_thr
        r["presence_thr"] = comps.presence_thr
        r["last_change"] = datetime.datetime.fromtimestamp(last_change)
        r["notes"] = comps.notes
        r["control"] = make_table(comps.control)
        r["test"] = make_table(comps.test)
        r["polya_db"] = comps.polya_db

        r["genome_desc"] = db["genomes"][comps.genome]["desc"]
        self.log(r["genome_desc"])
        if r["genome_desc"]!="not selected":
            r["genome_desc"] = db["genomes"][comps.genome]["desc"] % (db["genomes"][comps.genome]["link_assembly"], db["genomes"][comps.genome]["link_annotation"])
        r["method"] = comps.method
        r["method_desc"] = db["methods"][comps.method]["desc"]
        if r["method_desc"]!="not selected":
            r["method_desc"] = db["methods"][comps.method]["desc"] % db["methods"][comps.method]["link"]

        # if experiments of the analysis come from various libraries, create a consensus library columns (annotation)
        columns = []
        involved_libs = list(involved_libs)
        for lib_id in involved_libs:
            lib = apa.annotation.libs[lib_id]
            for column in lib.columns:
                if column not in columns:
                    if column[1] not in ["method", "map_to"]:
                        columns.append(column)
        r["columns"] = columns
        self.log(r["columns"])

        go = {} # read GO files
        for aspect in ["P", "C"]:
            for reg_type in ["enhanced", "repressed"]:
                fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "go_%s_%s_%s.json" % (reg_type, pair_type, aspect))
                if os.path.exists(fname):
                    go["%s_%s_%s" % (reg_type, pair_type, aspect)] = json.loads(open(fname, "rt").readline())
                else:
                    go["%s_%s_%s" % (reg_type, pair_type, aspect)] = []
                for site_type in ["proximal", "distal"]:
                    fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "go_%s_%s_%s_%s.json" % (reg_type, site_type, pair_type, aspect))
                    if os.path.exists(fname):
                        go["%s_%s_%s_%s" % (reg_type, site_type, pair_type, aspect)] = json.loads(open(fname, "rt").readline())
                    else:
                        go["%s_%s_%s_%s" % (reg_type, site_type, pair_type, aspect)] = []
        r["go"] = go
        return json.dumps(r, default=dthandler)

    # DELETE v1.1
    def get_comps(self):
        stats = {}

        def read_stats(lib_id):
            if stats.get(lib_id, None)==None:
                fname = os.path.join(apa.path.lib_folder(lib_id), "%s_m%s.stats.tab" % (lib_id, 1))
                res = {}
                f = open(fname, "rt")
                r = f.readline()
                r = f.readline()
                while r:
                    r = r.replace("\r", "").replace("\n", "").split("\t")
                    res[int(r[0])] = (r[-3], r[-1])
                    r = f.readline()
                f.close()
                stats[lib_id] = res

        def make_table(comps_data):
            res = []
            for (cid, exp_list, name) in comps_data:
                for exp_rec in exp_list:
                    lib_id = "_".join(exp_rec.split("_")[:-1])
                    exp_id = int(exp_rec.split("_")[-1][1:])
                    ann = copy.copy(apa.annotation.libs[lib_id].experiments[exp_id])
                    ann["lib_id"] = lib_id
                    ann["exp_id"] = exp_id
                    ann["cid"] = cid
                    read_stats(lib_id)
                    ann["stats"] = copy.copy(stats[lib_id][exp_id])
                    res.append(ann)
            return res

        comps_id = self.pars.get("comps_id", None)
        if comps_id==None:
            return "empty"
        comps = apa.comps.Comps(comps_id)
        email = self.pars.get("email", "public")
        pair_type = self.pars.get("pair_type", "same")

        folder = os.path.join(apa.path.comps_folder, comps_id)
        last_change = os.stat(folder).st_mtime
        r = {}
        r["comps_id"] = comps_id
        r["comps_name"] = comps.name
        r["CLIP"] = comps.CLIP
        r["site_selection"] = comps.site_selection
        r["last_change"] = datetime.datetime.fromtimestamp(last_change)
        r["notes"] = comps.notes
        r["control"] = make_table(comps.control)
        r["test"] = make_table(comps.test)

        go = {} # read GO files
        for aspect in ["P", "C"]:
            for reg_type in ["enhanced", "repressed"]:
                fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "go_%s_%s_%s.json" % (reg_type, pair_type, aspect))
                if os.path.exists(fname):
                    go["%s_%s_%s" % (reg_type, pair_type, aspect)] = json.loads(open(fname, "rt").readline())
                else:
                    go["%s_%s_%s" % (reg_type, pair_type, aspect)] = []
                for site_type in ["proximal", "distal"]:
                    fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "go_%s_%s_%s_%s.json" % (reg_type, site_type, pair_type, aspect))
                    if os.path.exists(fname):
                        go["%s_%s_%s_%s" % (reg_type, site_type, pair_type, aspect)] = json.loads(open(fname, "rt").readline())
                    else:
                        go["%s_%s_%s_%s" % (reg_type, site_type, pair_type, aspect)] = []
        r["go"] = go
        return json.dumps(r, default=dthandler)

    def get_library(self):

        apa.annotation.init()

        def read_stats(lib_id):
            result = {}
            fname = os.path.join(apa.path.lib_folder(lib_id), "%s_m%s.stats.tab" % (lib_id, 1))
            if os.path.exists(fname):
                f = open(fname, "rt")
                r = f.readline()
                r = f.readline()
                while r:
                    r = r.replace("\r", "").replace("\n", "").split("\t")
                    result[int(r[0])] = (r[-3], r[-1])
                    r = f.readline()
                f.close()
            return result

        library_id = self.pars.get("library_id", None)
        stats = read_stats(library_id)
        library = apa.annotation.libs.get(library_id, None)
        if library==None:
            return "empty"
        email = self.pars.get("email", "public")
        library_folder = os.path.join(apa.path.data_folder, library_id)
        r = {}
        r["lib_id"] = library_id
        r["name"] = library.name
        r["notes"] = library.notes
        r["columns"] = [(e1, e2) for (e1, e2) in library.columns if e2 not in ["method", "map_to"]]
        r["owner"] = library.owner
        r["access"] = library.access
        r["genome"] = library.genome
        r["genome_desc"] = db["genomes"][library.genome]["desc"]
        if r["genome_desc"]!="not selected":
            r["genome_desc"] = db["genomes"][library.genome]["desc"] % (db["genomes"][library.genome]["link_assembly"], db["genomes"][library.genome]["link_annotation"])
        r["method"] = library.method
        r["method_desc"] = db["methods"][library.method]["desc"]
        if r["method_desc"]!="not selected":
            r["method_desc"] = db["methods"][library.method]["desc"] % db["methods"][library.method]["link"]
        experiments = []
        for exp_id, exp_data in library.experiments.items():
            exp_map_stats = stats.get(exp_id, ("", ""))
            exp_data["stats"] = [exp_map_stats[0], exp_map_stats[1]]
            exp_data["lib_id"] = library_id
            experiments.append(exp_data)
        r["experiments"] = experiments
        return json.dumps(r, default=dthandler)

    def save_library(self):
        apa.annotation.init()
        r = {"status":"fail"}
        lib_id = self.pars.get("library_id", None)
        library = apa.annotation.libs.get(lib_id, None)
        email = self.pars.get("email", "public")
        if (email=="public"):
            return json.dumps(r, default=dthandler)
        if (email not in library.owner):
            return json.dumps(r, default=dthandler)
        library.name = self.pars.get("lib_name", "")
        library.notes = self.pars.get("lib_notes", "")
        library.access = self.pars.get("lib_access", "").split(",")
        library.owner = self.pars.get("lib_owner", "").split(",")
        library.save()
        r = {"status":"success"}
        return json.dumps(r, default=dthandler)

    def new_library(self):
        def new_lib_id():
            data_folder = apa.path.data_folder
            prefix = "%s_" % (datetime.datetime.now().strftime("%Y%m%d"))

            libs = glob.glob(os.path.join(data_folder, "%s*" % prefix))
            if len(libs)==0:
                postfix = "1"
            else:
                postfix = 0
                for lib_id in libs:
                    postfix = max(postfix, int(lib_id.split(prefix)[1]), postfix)
                postfix += 1

            lib_id = "%s%s" % (prefix, postfix)
            return lib_id

        email = self.check_login(self.pars.get("email", "public"))
        if email=="public":
            r = {"status":"fail"}
            return json.dumps(r, default=dthandler)
        lib_id = new_lib_id()
        lib_folder = os.path.join(apa.path.data_folder, lib_id)
        os.makedirs(lib_folder)
        library = apa.annotation.Library(lib_id)
        library.owner = [email]
        library.access = [email]
        library.save()
        r = {"status":"success", "lib_id":lib_id}
        return json.dumps(r, default=dthandler)

    def delete_library(self):
        apa.annotation.init()
        email = self.check_login(self.pars.get("email", "public"))
        if email=="public":
            r = {"status":"fail"}
            return json.dumps(r, default=dthandler)
        lib_id = self.pars.get("library_id", None)
        if lib_id==None:
            r = {"status":"fail"}
            return json.dumps(r, default=dthandler)
        if len(lib_id)<=6:
            r = {"status":"fail"}
            return json.dumps(r, default=dthandler)
        library = apa.annotation.libs[lib_id]
        if (email not in library.owner):
            r = {"status":"fail"}
            return json.dumps(r, default=dthandler)
        lib_folder = os.path.join(apa.path.data_folder, lib_id)
        if lib_folder.startswith("/home/gregor/apa/data.apa/") and len(lib_folder)>(len("/home/gregor/apa/data.apa/")+6):
            shutil.rmtree(lib_folder)
        r = {"status":"success", "lib_id":lib_id}
        return json.dumps(r, default=dthandler)

    def rnamap(self):
        clip_index = self.pars.get("clip_index", 0)
        comps_id = self.pars.get("comps_id", None)
        pair_type = self.pars.get("pair_type", "same")
        site_type = self.pars.get("site_type", "proximal")
        fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "clip%s.%s.%s.tab" % (clip_index, pair_type, site_type))
        if os.path.exists(fname):
            return open(fname).readline()
        else:
            return json.dumps({"status":"no results"})

    def rnaheat(self):
        comps_id = self.pars.get("comps_id", None)
        reg = self.pars.get("reg", "pos")
        clip_index = self.pars.get("clip_index", "0")
        pair_type = self.pars.get("pair_type", "samen")
        site_type = self.pars.get("site_type", "proximal")
        fname = os.path.join(apa.path.comps_folder, comps_id, "rnamap", "clip%s_heat.%s.%s_%s_json.tab" % (clip_index, pair_type, site_type, reg))
        if os.path.exists(fname):
            return open(fname).readline()
        else:
            return json.dumps({"status":"no results"})

    def apamap(self):
        analysis_id = self.pars.get("analysis_id", None)
        pair_type = self.pars.get("pair_type", "same")
        pairs_filename = os.path.join(apa.path.comps_folder, analysis_id, "%s.pairs_de.tab" % analysis_id)
        plot_data = {"enhanced" : {"x":[], "y":[], "gene_id":[]}, "repressed" : {"x":[], "y":[], "gene_id":[]}, "control_up" : {"x":[], "y":[], "gene_id":[]}, "control_down" : {"x":[], "y":[], "gene_id":[]}}
        f = open(pairs_filename, "rt")
        header = f.readline().replace("\r", "").replace("\n", "").split("\t")
        r = f.readline()
        while r:
            r = r.replace("\r", "").replace("\n", "").split("\t")
            data = dict(zip(header, r))
            if data["pair_type"]==pair_type or pair_type=="combined":
                plot_data[data["gene_class"]]["x"].append(float(data["proximal_fc"]))
                plot_data[data["gene_class"]]["y"].append(float(data["distal_fc"]))
                plot_data[data["gene_class"]]["gene_id"].append("%s: %s" % (data["gene_id"], data["gene_name"]))
            r = f.readline()
        f.close()
        return json.dumps(plot_data)

    def check_login(self, email="public"):
        conn = Session()
        q = conn.query(Users).filter(and_(Users.email==email)).all()
        if len(q)==1:
            return q[0].email
        else:
            return "public"

    def login(self, email="public"):
        email = self.pars.get("email", email)
        conn = Session()
        q = conn.query(Users).filter(Users.email==email).all()
        result = {}
        if len(q)==0:
            u = Users()
            u.email = email
            u.last_login = datetime.datetime.now()
            conn.add(u)
            conn.commit()
            result["news"] = 1
            result["email"] = email
            result["status"] = "ok"
            if email!="gregor.rot@gmail.com":
                self.send_email("gregor.rot@gmail.com", "expressRNA: user login", "Dear Gregor,\n\n%s is a new user with expressRNA!,\n\nBest,\nexpressRNA" % email)
        if len(q)==1:
            q[0].last_login = datetime.datetime.now()
            conn.commit()
            result["news"] = q[0].news
            result["email"] = q[0].email
            result["status"] = "ok"
        return json.dumps(result)

    def save_login(self):
        data = self.pars.get("data", None)
        if data==None:
            return "fail"
        data = json.loads(data)
        conn = Session()
        q = conn.query(Users).filter(Users.email==data["email"]).all()
        if len(q)==1:
            q[0].last_login = datetime.datetime.now()
            q[0].news = data["news"]
            conn.commit()
        return "saved"

    def close(self):
        Session.remove()

application = TableClass
