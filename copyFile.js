const fs = require('fs');
const path = require('path');

const [input, output] = process.argv.slice(2);
const fullOutput = output.endsWith('/') ? output + path.basename(input) : output;

fs.copyFileSync(input, fullOutput);
