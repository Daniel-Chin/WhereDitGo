from socket import socket
from request_handler import RequestHandler

LISTEN = 3 * 1  # Axios better not be smart

def returnTrue(*args, **kw):
    return True

class Server:
    def __init__(self, port):
        self.port = port
    
    def __enter__(self):
        self.sock = socket()
        self.sock.bind(('localhost', port))
        self.sock.listen(LISTEN)
        return self, self.sock
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.sock.close()
    
    def handleOne(self, database, validator = returnTrue):
        s, addr = self.sock.accept()
        RequestHandler(s, addr, database).do(validator)
