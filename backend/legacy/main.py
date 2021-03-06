import sys
import os
from os import path
from server import Server
from database import Database

def main():
    assert path.dirname(path.abspath(__file__)) == os.getcwd() ####
    port = int(sys.argv[1]) # PORT = 2344, see ../termux_script
    with Server(port) as (server, _):
        print('Waiting for the first getAll...')
        server.handleOne(None, lambda _, target: (
            target == 'getAll'
        ))
        database = Database()
        database.loadFromStorage()
        print('ServeLoop starts. ')
        server.serveLoop(database)

if __name__ == '__main__':
    try:
        main()
    except:
        print('\n Uh oh, exception from `main()`:\n')
        import traceback
        traceback.print_exc()
        input('\n Press enter to terminate...')
        # So that termux doesn't close, so we can see the error
        sys.exit(1)
    else:
        input('Successfully terminated. Enter...')
