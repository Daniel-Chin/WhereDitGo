'use strict'; 

const LinkedFileList = require("D:/js/LinkedFileList/lib/LinkedFileList.js");
const express = require('express');
const nocache = require('nocache')
const cors = require('cors');
const bodyParser = require('body-parser');

const expenseBase = new LinkedFileList('expenseBase');
const tagBase = new LinkedFileList('tagBase');
const db = {
  expense: expenseBase, 
  tag: tagBase, 
}

const app = express();
const port = parseInt(process.argv[2]);

app.use(nocache());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.send('Send bass');
});

app.get('/get', (req, res) => {
  const { whichdb, id } = req.query;
  res.json(db[whichdb].getEntry(id));
});

app.post('/add', (req, res) => {
  const { whichdb } = req.query;
  const entry = req.body.entry;
  db[whichdb].add(entry);
  res.send('ok');
});

app.get('/delete', (req, res) => {
  const { whichdb, id } = req.query;
  db[whichdb].delete(entry);
  res.send('ok');
});

app.post('/modify', (req, res) => {
  const { whichdb, id } = req.query;
  const entry = req.body.entry;
  db[whichdb].modify(id, entry);
  res.send('ok');
});

app.get('/git', (req, res) => {
  const { message } = req.query;
  let response = '';
  response += 'expenseBase: \n';
  response += expenseBase.git(message) + '\n';
  response += 'tagBase: \n';
  response += tagBase.git(message) + '\n';
  res.send(response);
});

app.get('/shutdown', (_, res) => {
  app.server.close();
  res.send('ok');
  console.log('Shutting down server...');
});

app.get('/diagnose', (_, res) => {
  let response = '';
  response += 'expenseBase: \n';
  response += JSON.stringify(expenseBase.diagnose()) + '\n';
  response += 'tagBase: \n';
  response += JSON.stringify(tagBase.diagnose()) + '\n';
  res.send(response);
});

app.get('/display', (req, res) => {
  // For debug
  res.send('ok');
  const { whichdb } = req.query;
  db[whichdb].display();
});

app.server = app.listen(port, console.log.bind(null, `Listening @ ${port}`));
