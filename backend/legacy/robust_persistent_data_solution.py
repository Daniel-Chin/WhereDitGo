import os
from subprocess import Popen, check_output, CalledProcessError

DATABASE_PATH = 'persistent/'
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
                if 'w' in self.mode:
                    self.writing_which = 1 - which
                    which = self.writing_which
                filename = DATABASE_FILENAMES[
                    which
                ]
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
                filename = DATABASE_FILENAMES[0]
            self.file = open(filename, self.mode)
            return self.file, self.fileSize(filename)
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.file.close()
        finally:
            if 'w' in self.mode and exc_type is None:
                with ChangeDir(DATABASE_PATH):
                    with open(WHICH_FILENAME, 'wb') as f:
                        f.write(bytes([self.writing_which]))
                print('Database SWAP success, pointing to', self.writing_which)
    
    def fileSize(self, filename):
        if 'r' in self.mode:
            return os.path.getsize(filename)
        return None

def git(message = 'fuzzy pickles'):
    '''
    Return bytes.  
    '''
    raise Exception('This function involves unfixed cmd injection hazard.')
    with ChangeDir(DATABASE_PATH):
        output = check_output(['git', 'add', '-A']) + b'\n'
        try:
            output += check_output(['git', 'commit', '-m', f'"{message}"'])
        except CalledProcessError:  
            # nothing to commit, git exit status code 1
            output += check_output(['git', 'status'])
        return output
