import sys
import os
from os import path
from server import Server
from database import Database

def main():
    assert path.dirname(path.abspath(__file__)) == os.getcwd() ####
    port = int(sys.argv[1])
    database = Database()
    with Server(port) as (server, serverSock):
        server.handleOne(database, lambda _, target: (
            target == 'getAll'
        ))

if __name__ == '__main__':
    main()
