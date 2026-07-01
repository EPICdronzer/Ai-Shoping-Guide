const axios = require('axios');
const fs = require('fs');

async function run() {
  try {
    const res = await axios.get('https://www.fuelpricetoday.in/data.js?v=3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    fs.writeFileSync('data.js', res.data);
    console.log('Successfully fetched data.js. Size:', res.data.length);
  } catch (err) {
    console.error(err);
  }
}

run();
