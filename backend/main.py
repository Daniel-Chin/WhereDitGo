import sys
import os
from os import path
import json
from robust_persistent_data_solution import Storage, git
from server import Server

def main():
    assert path.dirname(path.abspath(__file__)) == os.getcwd() ####
    port = int(sys.argv[1])
    database = Database()
    with Server(port) as (server, serverSock):
        server.handleOne(database, lambda _, target: (
            target == 'getAll'
        ))

class Database:
    def __init__(self):
        self.list = []
        self.to_delete = None
    
    def expectStr(self, s, f, size):
        for char in s:
            while size != 0:
                got = f.read(1)
                size -= 1
                if got == char:
                    break
                if got not in ' \n\r\t':
                    raise AssertionError(
                        f'Expecting "{char}" in "{s}", got "{got}"'
                    )
            else:
                continue
            raise EOFError(f'Expecting "{s}", but reached EOF"')
        return size


    def loadFromStorage(self):
        with Storage('r') as (f, size):
            size = self.expectStr('[', f, size)
            while True:
                # load an entry
                size = self.expectStr('{"token":"', f, size)

main()
