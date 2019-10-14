from subprocess import Popen
import os
from os import path
from os import system as terminal
import platform

DEV_SERVER = True
SIGINT = 2
PORT_FRONT = 2343
PORT_BACK = 2344
if DEV_SERVER:
  PORT_FRONT = 3000

def main():
    os.chdir(path.dirname(path.abspath(__file__)))
    print(os.getcwd())
    os.chdir('../frontend/build')
    if not DEV_SERVER:
      frontendProcess = Popen(['python', '-m', 'http.server', str(PORT_FRONT)])
    os.chdir('../..')
    if not DEV_SERVER:
      terminal(f'explorer http://localhost:{PORT_FRONT}')
    os.chdir('backend')
    backendProcess = Popen(['python', 'main.py', str(PORT_BACK)])
    backendProcess.wait()
    if DEV_SERVER:
      os.kill(frontendProcess.pid, 2)
    else:
      os.kill(frontendProcess.pid, 2)

main()
