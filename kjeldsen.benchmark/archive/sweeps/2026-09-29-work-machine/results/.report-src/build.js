// Injects Haiku's screenshot into the template and writes the report.
// usage: node build.js <output.html>
const fs = require('fs');
const path = require('path');
const here = __dirname;
const img = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(here, 'haiku-front.jpg')).toString('base64');
const tpl = fs.readFileSync(path.join(here, 'report-a4.template.html'), 'utf8');
const out = tpl.replace('/*HAIKU_IMG*/', img);
if (out === tpl) throw new Error('image marker not found');
fs.writeFileSync(process.argv[2], out);
console.log('wrote', process.argv[2], (out.length / 1024).toFixed(0) + ' KB');
