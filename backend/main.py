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
PAGE = 4096

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

class RequestHandler(Thread):
    def __init__(self, sock, addr, serverThread):
        super().__init__()
        self.sock = sock
        self.addr = addr
        self.database = serverThread.database
        self.databaseLock = serverThread.databaseLock
        self.setName(f'Handler of {addr}')
    
    def run(self):
        with self.databaseLock:
            print('Serving', self.addr, end = ' ', flush = True)
            try:
                target = recvUntil(b'\r\n').split(' ')[1]
                print(target)
                try:
                    self.__getattribute__(target)()
                except AttributeError:
                    print("Sadly, we don't provide such a service. ")
            except (ConnectionAbortedError, ConnectionResetError):
                pass
            finally:
                self.sock.close()
    
    def recvall(self, n_bytes):
        buffer = bytearray()
        remaining = n_bytes
        while remaining != 0:
            recved = self.sock.recv(remaining)
            if recved == b'':
                raise ConnectionAbortedError
            buffer.extend(recved)
            remaining -= len(recved)
        return buffer
    
    def recvUntil(self, terminator, max_length = 99999):
        buffer = bytearray()
        len_terminator = len(terminator)
        while buffer[- len_terminator:] != terminator:
            recved = self.sock.recv(1)
            if recved == b'':
                raise ConnectionAbortedError
            buffer.extend(recved)
            if len(buffer) > max_length:
                raise BufferError('recvUntil: message too long.')
        return buffer
    
    def drainRequest(self, max_length = 99999):
        buffer = bytearray()
        while buffer[-4:] != b'\r\n\r\n':
            recved = self.sock.recv(PAGE)
            if recved == b'':
                raise ConnectionAbortedError
            buffer.extend(recved)
            if len(buffer) > max_length:
                raise BufferError('drainRequest: too long.')
    
    def getAll(self):
        self.drainRequest()
        cursor = self.database
        while cursor[1] is not None:
            cursor = cursor[1]
            cursor[0]

main()
