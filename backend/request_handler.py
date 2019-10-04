PAGE = 4096

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
