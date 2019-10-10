from socket import socket
from request_handler import RequestHandler

LISTEN = 3 * 1  # Axios better not be smart

class Server:
    def __init__(self, port):
        self.port = port
    
    def __enter__(self):
        self.sock = socket()
        self.sock.bind(('localhost', self.port))
        self.sock.listen(LISTEN)
        return self, self.sock
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.sock.close()
    
    def handleOne(self, database, validator = lambda *a, **k : True):
        s, addr = self.sock.accept()
        return RequestHandler(s, addr, database).do(validator)
    
    def serveLoop(self, database):
        while self.handleOne(database):
            pass
