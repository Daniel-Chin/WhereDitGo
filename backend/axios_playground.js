const axios = require('axios');

module.exports = axios;

if (require.main === module) {
  const interactiveTester = require('@daniel.chin/interactivetester');
  interactiveTester({
    axios: module.exports, 
    console, 
  });
}
