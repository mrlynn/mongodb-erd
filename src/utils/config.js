const dotenv = require('dotenv');

function loadConfig() {
  dotenv.config();
  
  return {
    mongodbUri: process.env.MONGODB_URI,
    defaultTheme: process.env.MERMAID_THEME || 'default',
    defaultFormat: process.env.OUTPUT_FORMAT || 'svg'
  };
}

module.exports = { loadConfig };