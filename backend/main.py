from threading import Thread, Lock
from socket import socket
import sys
import os
from os import path
import pickle
from collections import namedtuple
from subprocess import Popen

LISTEN = 8
DATABASE_PATH = 'database/'
DATABASE_FILENAMES = ['0.pickle', '1.pickle']
WHICH_FILENAME = 'which_file_is_valid.onebyte'

Entry = namedtuple('Entry', [
    'token', 
    'amount', 
    'currency_type', 
    'time', 
    'tags', 
    'comment', 
])

def main():
    assert path.dirname(path.abspath(__file__)) == os.getcwd() ####
    port = int(sys.argv[1])
    database = []
    databaseLock = Lock()
    with databaseLock:
        serverThread = ServerThread(
            database, databaseLock, port, RequestHandler
        )
        serverThread.start()
        database.extend(loadDatabase()) # Just one node
    serverThread.join()

class ServerThread(Thread):
    def __init__(self, database, databaseLock, port, RequestHandler):
        super().__init__()
        self.server = socket()
        self.server.bind(('localhost', port))
        self.server.listen(LISTEN)
        self.RequestHandler = RequestHandler
        self.shall_stop = False
        self.port = port
    
    def stop():
        self.shall_stop = True
        waker = socket()
        try:
            waker.connect(('localhost', self.port))
            waker.close()
        except ConnectionRefusedError:
            pass
    
    def run():
        while not self.shall_stop:
            s, addr = self.server.accept()
            self.RequestHandler(s, addr, self.stop).start()

def loadDatabase():
    home = os.getcwd()
    os.chdir(DATABASE_PATH)
    try:
        with open(WHICH_FILENAME, 'rb') as f:
            which = f.read()[0]
        with open(DATABASE_FILENAMES[which], 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        print('Welcome to Where Dit Go! ')
        database = [None, None, None]
        for i in range(2):
            with open(DATABASE_FILENAMES[i], 'wb+') as f:
                pickle.dump(database, f)
        with open(WHICH_FILENAME, 'wb+') as f:
            f.write(b'\x00')
        print('Initialized database. ')
        gitInit = Popen(['git', 'init'])
        gitInit.wait()
        print('You are all set. ')
        return database
    finally:
        os.chdir(home)

main()
