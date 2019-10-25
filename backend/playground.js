const axios          = require('axios');
const fs             = require('fs');
const path           = require('path');
const child_process  = require('child_process');
const shell          = require('shell-quote');
const LinkedFileList = require("D:/js/LinkedFileList/lib/LinkedFileList.js");
const express        = require('express');
const nocache        = require('nocache')
const cors           = require('cors');
const bodyParser     = require('body-parser');

if (require.main === module) {
  const interactiveTester = require('@daniel.chin/interactivetester');
  interactiveTester({
    axios         , 
    fs            , 
    path          , 
    child_process , 
    shell         , 
    LinkedFileList, 
    express       , 
    nocache       , 
    cors          , 
    bodyParser    , 
    console, 
  });
}
