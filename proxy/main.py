from threading import Thread
from socket import socket
import sys
from select import select

PAGE = 8192

def main():
  proxy_port, front_port, back_port = [int(x) for x in sys.argv[1:]]
  serverSock = socket()
  serverSock.bind(('localhost', proxy_port))
  serverSock.listen(5)
  print('Proxy online...')
  while True:
    sock, _ = serverSock.accept()
    Forwarder(sock, front_port, back_port).start()

class Forwarder(Thread):
  def __init__(self, sock, front_port, back_port):
    super().__init__()
    self.sock = sock
    self.front_port = front_port
    self.back_port = back_port

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

  def run(self):
    print('Proxy: New socket')
    while True: # keep-alive
      try:
        first_line = self.recvUntil(b'\n')
      except ConnectionAbortedError:
        try:
          self.sock.close()
        finally:
          return
      _, target, _ = first_line.decode().split(' ')
      if target.lstrip('/')[:7] == 'BACKEND':
        print('Proxy: BACKEND relay')
        port = self.back_port
      else:
        print('Proxy: FRONTEND relay')
        port = self.front_port
      otherSock = socket()
      otherSock.connect(('localhost', port))
      otherSock.sendall(first_line)
      buffer = b''
      while buffer != b'\r\n\r\n':
        recved = self.sock.recv(PAGE)
        if recved == b'':
          otherSock.close()
          self.sock.close()
          print('Connection lost with incomplete request.')
          return
        otherSock.sendall(recved)
        buffer = (buffer + recved)[-4:]
      socks = [self.sock, otherSock]
      while True:
        readable, _, exceptional = select([socks], [], [socks])
        try:
          if exceptional:
            raise ConnectionAbortedError
          if self.sock in readable:
            break
          assert readable[0] == otherSock
          recved = otherSock.recv(PAGE)
          if recved == b'':
            raise ConnectionAbortedError
          self.sock.sendall(recved)
        except ConnectionAbortedError:
          try:
            self.sock.close()
          finally:
            otherSock.close()
          return

if __name__ == '__main__':
  main()
