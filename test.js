const { exec } = require('child_process');
const http = require('http');
const url = require('url');

http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const fileName = query.file;

  // ⚠️ Vulnerability: User-controlled input passed to exec without sanitization
  exec(`cat ${fileName}`, (err, stdout, stderr) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error: ${stderr}`);
      return;
    }
    res.writeHead(200);
    res.end(stdout);
  });
}).listen(3000);

console.log('Server running on http://localhost:3000');
