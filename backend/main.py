from threading import Thread, Lock, Condition
from socket import socket
import sys
import os
from os import path
import pickle

LISTEN = 8
DATABASE_FILENAME = ''

def main():
    assert path.dirname(path.abspath(__file__)) == os.getcwd() ####
    port = int(sys.argv[1])
    server = launchServer(port)
    database = loadDatabase()

def launchServer(port):
    server = socket()
    server.bind(('localhost', port))
    server.listen(LISTEN)
    return server

def loadDatabase():
    with open(DATABASE_FILENAME, 'rb')

main()
