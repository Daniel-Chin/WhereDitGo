from socket import socket
import sys
import os
from os import path
import json
from request_handler import RequestHandler
from robust_persistent_data_solution import Storage, git

LISTEN = 3 * 1  # Axios better not be smart

Entry = namedtuple('Entry', [
    'token', 
    'amount', 
    'currency_type', 
    'time', 
    'tags', 
    'comment', 
])
TagExplanation = namedtuple('TagExplanation', [
    'token', 
    'time', 
    'tag', 
    'explanation', 
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
        self.shall_stop = False
        
        self.database = database
        self.databaseLock = databaseLock
        self.port = port
        self.RequestHandler = RequestHandler
    
    def stop():
        self.shall_stop = True
        waker = socket()
        try:
            waker.connect(('localhost', self.port))
            waker.close()
        except ConnectionRefusedError:
            pass
    
    def run(self):
        try:
            while not self.shall_stop:
                sock, addr = self.server.accept()
                self.RequestHandler(sock, addr, self).start()
        finally:
            self.server.close()

def loadDatabase():

main()
