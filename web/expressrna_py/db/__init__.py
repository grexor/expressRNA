from sqlalchemy import *
from sqlalchemy.orm import mapper, relationship, backref, validates, sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
import datetime
import json
import expressrna_py

def dthandler(datetime_object):
    if isinstance(datetime_object, datetime.datetime):
        return "%04g/%02g/%02g %02g:%02g" % (datetime_object.year, datetime_object.month, datetime_object.day, datetime_object.hour, datetime_object.minute)
    if isinstance(datetime_object, datetime.date):
        return "%04g/%02g/%02g" % (datetime_object.year, datetime_object.month, datetime_object.day)
    if isinstance(datetime_object, datetime.timedelta):
        hours = datetime_object.seconds/3600
        minutes = (datetime_object.seconds - hours*3600)/60
        seconds = datetime_object.seconds - hours*3600 - minutes*60
        return "%02gh:%02gm:%02gs" % (hours, minutes, seconds)

engine = create_engine('mysql://%s:%s@%s/%s' % (expressrna_py.config.mysql_username, expressrna_py.config.mysql_password, expressrna_py.config.mysql_host, expressrna_py.config.mysql_database), pool_size = expressrna_py.config.mysql_pool_size, pool_recycle=5)

metadata = MetaData(bind=engine)
Session = scoped_session(sessionmaker(bind=engine))

def create_json(results, records="", status=""):
    r = {}
    r["records"] = len(results) if records=="" else records
    r["status"] = status
    data = []
    for result in results:
        data.append(result.get_json())
    r["data"] = data
    return json.dumps(r, default=dthandler)

class Basic(object):
    def get_json(self):
        d = {}
        for j in self.__dict__.keys():
            if j in ["_sa_instance_state"]:
                continue
            d[j] = self.__dict__[j]
        return d

class Users(Basic):
    pass

class Comps(Basic):
    pass

class Comps_perm(Basic):
    pass

class Tickets(Basic):
    pass

meta = MetaData()
meta.reflect(bind=engine, views=True)

users_table = meta.tables["users"]
mapper(Users, users_table)

comps_table = meta.tables["comps"]
mapper(Comps, comps_table)

comps_perm_table = meta.tables["comps_perm"]
mapper(Comps_perm, comps_perm_table)

tickets_table = meta.tables["tickets"]
mapper(Tickets, tickets_table)
