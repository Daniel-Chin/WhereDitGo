'use strict';

const fs = require('fs');
const path = require('path');

const HEAD = '__head__';
const TAIL = '__tail__';
const ID_CHARS = [...'1234567890qwertyuiopasdfghjklzxcvbnm'];

function LinkedFileList (_path) {
  this.pathJoin = path.join.bind(null, _path);

  const __init__ = () => {
    if (! fs.existsSync(this.pathJoin(HEAD))) {
      this.initDisk();
    }
  };

  this.initDisk = () => {
    const dir_parts = this.pathJoin('').split('/');
    const name = dir_parts[dir_parts.length - 1] || dir_parts[dir_parts.length - 2];
    fs.writeFileSync(this.pathJoin(HEAD), 
      `{"id": "${HEAD}", "next": "${TAIL}"}\n`
    );
    fs.writeFileSync(this.pathJoin(TAIL), 
      `{"id": "${TAIL}", "prev": "${HEAD}"}\n`
    );
    console.log(`Initialized linked file list "${name}"`);
  };

  this.open = (id, mode, toRun) => {
    const fd = fs.openSync(this.pathJoin(id), mode);
    let result = null;
    try {
      result = toRun(fd);
    } catch (err) {
      fs.closeSync(fd);
      throw err;
    }
    fs.closeSync(fd);
    return result;
  };

  this.getEntry = (id) => {
    const raw = JSON.parse(fs.readFileSync(this.pathJoin(id)));
    if (id === HEAD) return {...raw, time: -Infinity};
    if (id === TAIL) return {...raw, time: Infinity};
    return raw;
  };

  this.__list_dir = null;
  this.listDir = () => {
    if (this.__list_dir === null) {
      this.__list_dir = fs.readdirSync(this.pathJoin(''))
        .filter((x) => (x !== HEAD && x !== TAIL));
      }
    return this.__list_dir;
  };

  this.display = () => {
    let id = this.getEntry(HEAD).next;
    const keys = Object.keys(this.getEntry(id));
    keys.forEach((key) => {
      process.stdout.write(key);
      process.stdout.write('\t');
    });
    process.stdout.write('\n');
    let entry;
    while (id !== TAIL) {
      entry = this.getEntry(id);
      keys.forEach((key) => {
        process.stdout.write(entry[key].toString());
        process.stdout.write('\t');
      });
      id = entry.next;
      process.stdout.write('\n');
    }
  };

  this.seekTime = (time, start_id) => {
    let entry = this.getEntry(start_id);
    let direction; 
    let to_next;
    let randomEntry;
    let delta;
    if (time > entry.time) {
      direction = 'next';
      to_next = true;
    } else {
      direction = 'prev';
      to_next = false;
    }
    entry = this.getEntry(entry[direction]);
    while ((time > entry.time) === to_next) {
      entry = this.getEntry(entry[direction]);
      if ((time > entry.time) !== to_next) {
        break;
      }
      randomEntry = this.getEntry(randomPick(this.listDir()));
      delta = time - randomEntry.time;
      if (Math.abs(delta) < Math.abs(time - entry.time)) {
        entry = randomEntry;
        if (delta > 0) {
          direction = 'next';
          to_next = true;
        } else {
          direction = 'prev';
          to_next = false;
        }
      }
    }
    if (to_next) {
      return [entry.prev, entry.id];
    } else {
      return [entry.id, entry.next];
    }
  };

  this.newId = () => {
    const list_dir = this.listDir();
    const id_len = Math.floor(Math.log(
      list_dir.length + 1, ID_CHARS.length
    )) + 3;
    let id = null;
    while (id === null || list_dir.includes(id)) {
      id = [...Array(id_len)].map(() => (  // Can't we have `range`?
        randomPick(ID_CHARS)  // Readability is so bad...
      )).join('');
    }
    return id
  };

  this.add = (entry) => {
    const [prev, next] = this.seekTime(entry.time, TAIL);
    const id = this.newId();
    this.open(id, 'w', (fd) => {
      fs.writeSync(fd, JSON.stringify({
        ...entry, 
        id, 
        prev, 
        next, 
      }));
    });

    const prev_original = this.getEntry(prev);
    this.open(prev, 'w', (fd) => {
      fs.writeSync(fd, JSON.stringify({
        ...prev_original, 
        next: id, 
      }));
    });

    const next_original = this.getEntry(next);
    this.open(next, 'w', (fd) => {
      fs.writeSync(fd, JSON.stringify({
        ...next_original, 
        prev: id, 
      }));
    });
    
    this.__list_dir.push(id);
  };

  __init__();
};

const randomPick = (population) => (
  population[Math.floor(Math.random() * population.length)]
);

if (require.main === module) {
  const main = async () => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const input = async (prompt) => {
      return new Promise((resolve, _) => {
        readline.question(prompt, (op) => {
          resolve(op);
        });
      });
    };

    const vm = require('vm');
    const context = vm.createContext();
    context.l = new LinkedFileList('d:/temp/database');
    context.LinkedFileList = LinkedFileList;
    context.console = console;
    let op;
    while (true) {
      op = await input('> ');
      if (op[op.length - 1] !== ';') {
        op = `console.log(${op});`;
      }
      try {
        vm.runInContext(op, context);
      } catch (err) {
        console.error(err);
      }
    }
  };

  main();
}

module.exports = LinkedFileList;

// del list_dir when you add/remove
// unit test
