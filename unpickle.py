import _pickle
import _pickle as securepickle
import pickle

import cPickle
import cPickle as safePickle

try:
    import cPickle as testpickle
except:
    import pickle as testpickle


from http.server import BaseHTTPRequestHandler

class GetHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        tainted = urlparse.urlparse(self.path).query

        # ruleid: tainted-pickle
        unpickler = pickle.Unpickler(tainted)
        unpickler.load()
        unpickler.persistent_load(5)

        # ok: tainted-pickle
        unpickler = pickle.Unpickler(s)
        unpickler.load()
        unpickler.persistent_load(5)


        # ruleid: tainted-pickle
        unpickler = _pickle.Unpickler(tainted)
        unpickler.load()
        unpickler.persistent_load(5)

        # ok: tainted-pickle
        unpickler = _pickle.Unpickler(s)
        unpickler.load()
        unpickler.persistent_load(5)

        # ruleid: tainted-pickle
        unpickler = cPickle.Unpickler(tainted)
        unpickler.load()
        unpickler.persistent_load(5)

        # ok: tainted-pickle
        unpickler = cPickle.Unpickler(s)
        unpickler.load()
        unpickler.persistent_load(5)

        # ruleid: tainted-pickle
        unpickler = safePickle.Unpickler(tainted)
        unpickler.load()
        unpickler.persistent_load(5)

        # ruleid: tainted-pickle
        unpickler = securepickle.Unpickler(tainted)
        unpickler.load()
        unpickler.persistent_load(5)