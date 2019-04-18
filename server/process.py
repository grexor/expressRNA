import os
import time
import sys
import config
sys.path
sys.path.append(config.expressrna_folder)
import expressrna_py
from expressrna_py.db import *

while True:
    conn = Session()
    print "expressRNA_server v1, checking for open tickets, %s" % (datetime.datetime.now())
    time.sleep(1)
    q = conn.query(Tickets).filter(Tickets.date_started==None).order_by(Tickets.tid).all()
    for rec in q:
        print "==="
        print "processing TID=%s" % rec.tid
        print rec.command
        rec.date_started = datetime.datetime.now()
        rec.status = 1 # processing
        conn.commit()
        os.system(rec.command)
        rec.date_finished = datetime.datetime.now()
        rec.status = 2 # finished done
        rec.minutes = round((rec.date_finished - rec.date_started).total_seconds() / 60.0, 2) # compute processing time in minutes
        conn.commit()
        print "==="
        print
        conn.flush()
    conn.close()
