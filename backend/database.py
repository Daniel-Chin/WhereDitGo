import json
from robust_persistent_data_solution import Storage, git

class Database:
    def __init__(self):
        self.list = []
        self.to_add = None
        self.to_delete = None

    def loadFromStorage(self):
        with Storage('r') as (f, _):
            self.list = json.load(f)
        self.to_add = None
        self.to_delete = None
    
    def entryIter(self):
        # localize variable to reduce overhead
        to_delete = self.to_delete
        to_add = self.to_add
        if to_add is not None:
            to_add_time = to_add['time']
        for entry in self.list:
            if to_delete is not None and (
                entry['token'] == to_delete
            ):
                to_delete = None
            else:
                if to_add is not None and (
                    to_add_time > entry['time']
                ):
                    yield to_add
                    to_add = None
                yield entry

    def saveToStorage(self):
        first = True
        with Storage('w') as (f, _):
            f.write('[\n')
            for entry in self.entryIter():
                if first:
                    first = False
                else:
                    f.write(',\n')
                json.dump(entry, f)
            f.write('\n]\n')
