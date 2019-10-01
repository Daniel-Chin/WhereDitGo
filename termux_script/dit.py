from subprocess import Popen
import os
from os import path
from os import system as terminal

SIGINT = 2
PORT_FRONT = 2343
PORT_BACK = 2344

def main():
    os.chdir(path.dirname(path.abspath(__file__)))
    os.chdir('../frontend/build')
    frontendProcess = Popen(['python', '-m', 'http.server', str(PORT_FRONT)])
    terminal(f'am start --user 0 -a android.intent.action.VIEW -d http://localhost:{PORT_FRONT}')
    os.chdir('../../backend/')
    backendProcess = Popen(['python', 'main.py', str(PORT_BACK)])
    backendProcess.wait()
    os.kill(frontendProcess.pid, 2)

main()
