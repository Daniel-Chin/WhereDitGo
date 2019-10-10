from os import path
from robust_persistent_data_solution import Storage, git
from urllib.parse import unquote
import json

PAGE = 4096

class RequestHandler:
    def __init__(self, sock, addr, database):
        self.sock = sock
        self.addr = addr
        self.database = database
    
    def do(self, validator):
        print('Serving', self.addr, end = ' ', flush = True)
        try:
            verb, target, _ = self.recvUntil(b'\r\n').split(' ')
            if '?' in target:
                target, query = target.split('?', 1)
            else:
                query = None
            print(verb, target)
            if validator(self.addr, target):
                try:
                    return self.__getattribute__(target)(query)
                except AttributeError:
                    print("Sadly, we don't provide such a service. ")
            else:
                raise AssertionError('Request validation failed')
        except (ConnectionAbortedError, ConnectionResetError):
            print(self.addr, 'aborted. ')
        finally:
            self.sock.close()
        return True
    
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
    
    def respondHeader(self, content_len):
        self.sock.sendall(b'HTTP/1.1 200 OK\r\n')
        self.sock.sendall(b'Connection: close\r\n')
        self.sock.sendall(b'Content-Length: %d\r\n' % content_len)
        self.sock.sendall(b'Content-Type: text/html\r\n\r\n')
    
    def respondOK(self):
        self.respondHeader(2)
        self.sock.sendall(b'OK')

    def getAll(self, _):
        self.drainRequest()
        with Storage('r') as (f, size):
            self.respondHeader(size)
            self.sock.sendfile(f)
        return True
    
    def add(self, query):
        self.drainRequest()
        key, value = query.split('=', 1)
        assert key == 'entry'
        entry = json.loads(unquote(value))
        self.database.to_add = entry
        self.database.saveToStorage()
        self.respondOK()
        self.database.loadFromStorage()
        return True
