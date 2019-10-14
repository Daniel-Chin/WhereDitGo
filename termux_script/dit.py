from subprocess import Popen
import os
from os import path
from os import system as terminal
import platform

SIGINT = 2
PORT_FRONT = 2343
PORT_BACK = 2344
PORT_PROXY = 2345

def main():
    os.chdir(path.dirname(path.abspath(__file__)))
    print(os.getcwd())
    os.chdir('../frontend/build')
    frontendProcess = Popen(['python', '-m', 'http.server', str(PORT_FRONT)])
    os.chdir('../..')
    proxyProcess = Popen(['python', 'proxy/main.py', str(PORT_PROXY), str(PORT_FRONT), str(PORT_BACK)])
    if platform.system().lower == 'windows':
      terminal(f'explorer http://localhost:{PORT_FRONT}')
    else:
      terminal(f'am start --user 0 -a android.intent.action.VIEW -d http://localhost:{PORT_FRONT}')
    os.chdir('backend')
    backendProcess = Popen(['python', 'main.py', str(PORT_BACK)])
    backendProcess.wait()
    proxyProcess.wait()
    os.kill(frontendProcess.pid, 2)

main()
