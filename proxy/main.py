from threading import Thread, Event
from socket import socket, timeout, SHUT_WR
import sys
import platform
if platform.system().lower() != 'windows':
  from select import select
else:
  select = None

PAGE = 8192

def main():
  proxy_port, front_port, back_port = [int(x) for x in sys.argv[1:]]
  serverSock = socket()
  serverSock.bind(('localhost', proxy_port))
  serverSock.listen(5)
  print('Proxy online...')
  while True:
    sock, addr = serverSock.accept()
    Forwarder(sock, addr, proxy_port, front_port, back_port).start()

class Forwarder(Thread):
  def __init__(self, sock, addr, proxy_port, front_port, back_port):
    super().__init__()
    self.sock = sock
    self.addr = addr
    self.proxy_port = proxy_port
    self.front_port = front_port
    self.back_port = back_port
    self.setName(f'Proxy {addr}')

  def recvUntil(self, terminator, max_length = 99999):
    assert type(terminator) is bytes
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

  def print(self, *arg, **kw):
    print('Proxy:', self.addr, *arg, **kw)

  def run(self):
    self.print('New socket')
    carry_over = b''
    while True: # keep-alive
      try:
        first_line = carry_over + self.recvUntil(b'\n')
        if len(first_line) == len(carry_over):
          raise ConnectionAbortedError
      except ConnectionAbortedError:
        try:
          self.sock.close()
        finally:
          return
      _, target, _ = first_line.decode().split(' ')
      if target.lstrip('/')[:7] == 'BACKEND':
        self.print('BACKEND relay')
        port = self.back_port
      else:
        self.print('FRONTEND relay')
        port = self.front_port
      otherSock = socket()
      otherSock.connect(('localhost', port))
      self.print('Connect to other:', port)
      otherSock.sendall(first_line)

      # Change "host"
      while port == self.front_port:
        try:
          line = self.recvUntil(b'\n')
          if line == b'':
            raise ConnectionAbortedError
        except ConnectionAbortedError:
          try:
            self.sock.close()
          finally:
            return
        if line.startswith(b'Host:'):
          line = line.replace(
            str(self.proxy_port).encode(), str(port).encode()
          )
          otherSock.sendall(line)
          break
        else:
          otherSock.sendall(line)
      
      buffer = b''
      while buffer != b'\r\n\r\n':
        recved = self.sock.recv(PAGE)
        if recved == b'':
          otherSock.close()
          self.sock.close()
          self.print('Connection lost with incomplete request.')
          return
        otherSock.sendall(recved)
        # print(recved)
        buffer = (buffer + recved)[-4:]
      self.print('Request relayed.')
      if select:
        to_read = [self.sock, otherSock]
        to_except = to_read.copy()
      else:
        listener = Listener(self.sock)
        otherSock.settimeout(.05)
      while True:
        if select:
          readable, _, exceptional = select(to_read, [], to_except)
          try:
            if exceptional:
              raise ConnectionAbortedError
            if self.sock in readable:
              break
            assert readable[0] == otherSock
            recved = otherSock.recv(PAGE)
            if recved == b'':
              self.sock.shutdown(SHUT_WR)
              to_read.remove(otherSock)
            else:
              self.sock.sendall(recved)
          except ConnectionAbortedError:
            try:
              self.sock.close()
            finally:
              otherSock.close()
            return
        else:
          try:
            if listener.event.is_set():
              if type(listener.recved) is not bytes or listener.recved == b'':
                self.print(listener.recved)
                raise ConnectionAbortedError
              carry_over = listener.recved
              listener.join()
              break
            else:
              try:
                recved = otherSock.recv(PAGE)
              except timeout:
                continue
              except Exception as e:
                self.print(e)
                raise ConnectionAbortedError
              if recved == b'':
                self.sock.shutdown(SHUT_WR)
              else:
                self.sock.sendall(recved)
          except ConnectionAbortedError:
            try:
              otherSock.close()
            finally:
              self.sock.close()
            return

class Listener(Thread):
  def __init__(self, sock):
    super().__init__()
    self.sock = sock
    self.event = Event()

  def run(self):
    try:
      self.recved = self.sock.recv(1)
    except Exception as e:
      self.recved = e
    self.event.set()

if __name__ == '__main__':
  main()
