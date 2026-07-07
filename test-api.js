const http = require('http');
http.get('http://localhost:3000/api/ration/config', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const config = JSON.parse(data);
    console.log(JSON.stringify(config.rationConfig['2'], null, 2));
  });
}).on('error', (err) => console.log('Error: ' + err.message));
