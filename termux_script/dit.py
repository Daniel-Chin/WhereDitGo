from subprocess import Popen
import os
from os import path

def main():
    os.chdir(path.dirname(__file__))
    os.chdir('../frontend')
    p = Popen(['echo'])
