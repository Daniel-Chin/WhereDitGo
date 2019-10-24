'use strict';

const TEST_PATH = 'd:/temp/database';

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

  this.initDisk = () => { // UNIT TEST PASSED
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

  /*
  Warning: imperative caching ahead.  
  The variable `this.__init_dir` is imperative.  
  Every time we change directory structure, either set it to null, or update it correctly.  
  Otherwise `this.listDir()` will return incorrect results.  
  */
  this.__list_dir = null;
  this.listDir = () => {  // UNIT TEST PASSED
    if (this.__list_dir === null) {
      this.__list_dir = fs.readdirSync(this.pathJoin(''))
        .filter((x) => (x !== HEAD && x !== TAIL));
      }
    return this.__list_dir;
  };

  this.display = () => {  // UNIT TEST PASSED
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

  this.newId = () => {  // UNIT TEST PASSED
    const list_dir = this.listDir();
    const id_len = Math.floor(
      Math.log(list_dir.length + 1) / Math.log(ID_CHARS.length)
    ) + 3;
    let id = null;
    while (id === null || list_dir.includes(id)) {
      id = [...Array(id_len)].map(() => (  // Can't we have `range`?
        randomPick(ID_CHARS)  // Readability is so bad...
      )).join('');
    }
    return id;
  };

  this.add = (entry, seek_start) => { // UNIT TEST PASSED
    seek_start = seek_start || TAIL;
    const [prev, next] = this.seekTime(entry.time, seek_start);
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
    
    if (this.__list_dir !== null) {
      this.__list_dir.push(id);
    }
    return id;
  };

  this.delete = (id) => { // UNIT TEST PASSED
    const { prev, next } = this.getEntry(id);

    const prevEntry = this.getEntry(prev);
    this.open(prev, 'w', (fd) => {
      fs.writeSync(fd, JSON.stringify({
        ...prevEntry, 
        next, 
      }));
    });

    const nextEntry = this.getEntry(next);
    this.open(next, 'w', (fd) => {
      fs.writeSync(fd, JSON.stringify({
        ...nextEntry, 
        prev, 
      }));
    });

    fs.unlinkSync(this.pathJoin(id));

    if (this.__list_dir !== null) {
      this.__list_dir = this.__list_dir.filter((x) => (x !== id));
    }
    return this;
  };

  this.modify = (id, entry) => {  // UNIT TEST PASSED
    const original = this.getEntry(id);
    const updated = {
      ...original, 
      ...entry, 
    };
    if (original.time === entry.time) {
      // time not changed. modify in place
      this.open(id, 'w', (fd) => {
        fs.writeSync(fd, JSON.stringify(updated));
      });
    } else {
      // time changed, needs to sort again. 
      this.add(updated, id);
      this.delete(id);
    }
    return this;
  };

  this.diagnose = () => { // UNIT TEST PASSED
    // diagnose the database and fix errors.  
    // Errors may occur if you unplug the server while writing to disk.  
    // This does not check for circular links.  
    const brokenPrev = [];
    const badSort = [];
    const id_in_chain = [];
    let entry = this.getEntry(HEAD);
    let last_id;
    let last_time;
    while ((last_id = entry.id) !== TAIL) {
      last_time = entry.time;
      try {
        entry = this.getEntry(entry.next);
      } catch (err) {
        break;
      }
      id_in_chain.push(entry.id);
      if (entry.prev !== last_id) {
        brokenPrev.push(entry);
      }
      if (entry.time < last_time) {
        badSort.push(entry);
      }
    }
    id_in_chain.pop();
    let zombieNodes = [];
    if (id_in_chain.length !== this.listDir().length) {
      console.log('Zombie node perceived. Searching...');
      zombieNodes = subtract(this.listDir(), id_in_chain);
    }
    const n_problems = brokenPrev.length + badSort.length + zombieNodes.length;
    if (n_problems) {
      return this.diagnosis = {
        brokenPrev, 
        badSort, 
        zombieNodes, 
      };
    } else {
      return 'ok';
    }
  };

  __init__();
};

const randomPick = (population) => (
  population[Math.floor(Math.random() * population.length)]
);

const subtract = (fromWhat, subtractWhat) => {  // UNIT TEST PASSED
  // fromWhat has to contain subtractWhat.  
  // this algorithm assumes the result is short.  
  // because array.push is sometimes O(n).  
  fromWhat.sort();
  subtractWhat.sort();
  let i = 0;
  const result = [];
  for (let x of fromWhat) {
    if (x === subtractWhat[i]) {
      i ++;
    } else {
      result.push(x);
    }
  }
  if (i !== subtractWhat.length) {
    throw new Error(`fromWhat doesn't contain subtractWhat`);
  }
  return result;
};

module.exports = LinkedFileList;

if (require.main === module) {
  const interactiveTester = require('@daniel.chin/interactivetester');
  interactiveTester({
    LinkedFileList: module.exports, 
    l: new LinkedFileList(TEST_PATH), 
    console, 
    subtract, 
  });
}
