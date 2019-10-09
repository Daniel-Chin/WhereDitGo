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

main()
