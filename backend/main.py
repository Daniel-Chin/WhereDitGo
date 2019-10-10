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
        database.loadFromStorage()
        server.serveLoop(database)

if __name__ == '__main__':
    try:
        main()
    except:
        print('\n Uh oh, exception from `main()`:\n')
        import traceback
        traceback.print_exc()
        input('Press enter to terminate...')
        # So that termux doesn't close, so we can see the error
        raise
    input('Successfully terminated. Enter...')
