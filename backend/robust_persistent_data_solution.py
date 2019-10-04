'''
There are two copies of the database.  
We use a "which_file" to point to the valid one of the two.  
Read operation:  
    Read the valid database.  
Write operation:  
    Write to the invalid database. Close it.  
    Change which_file to point to the database we wrote to.  
This ensures:  
* Whenever the user unplug their machine, the which_file always points to a non-corrupted database.  
* Every write operation is atomic. Either we revert back to the state before the write, or the write is 100% complete. There is no middle state.  

I don't know what this strategy is called. If you know what it's called, please open an issue and tell me.  
'''
import os
from subprocess import Popen, check_output

DATABASE_PATH = 'database/'
DATABASE_FILENAMES = ['0.json', '1.json']
WHICH_FILENAME = 'which_file_is_valid.onebyte'

class Storage:
    def __init__(self, mode):
        self.mode = mode
    
    def __enter__(self):
        with ChangeDir(DATABASE_PATH):
            try:
                with open(WHICH_FILENAME, 'rb') as f:
                    which = f.read()[0]
                if self.mode == 'w':
                    self.writing_which = 1 - which
                return open(DATABASE_FILENAMES[
                    self.writing_which
                ], self.mode)
            except FileNotFoundError:
                print('Welcome to Where Dit Go! ')
                with open(DATABASE_FILENAMES[0], 'w+') as f:
                    print('[]', file = f)
                with open(WHICH_FILENAME, 'wb+') as f:
                    f.write(b'\x00')
                print('Initialized database. ')
                gitInit = Popen(['git', 'init'])
                gitInit.wait()
                print('You are all set. ')
                return open(DATABASE_FILENAMES[0], self.mode)
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.mode == 'w':
            with ChangeDir(DATABASE_PATH):
                with open(WHICH_FILENAME, 'wb') as f:
                    f.write(bytes([self.writing_which]))

class ChangeDir:
    def __init__(self, path):
        self.path = path
    
    def __enter__(self):
        self.home = os.getcwd()
        os.chdir(self.path)
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        os.chdir(self.home)

def git(message = 'fuzzy pickles'):
    '''
    Return bytes.  
    '''
    with ChangeDir(DATABASE_PATH):
        output = check_output(['git', 'add', '-A'])
        output += check_output(['git', 'commit', '-m', f'"{message}"'])
        return output