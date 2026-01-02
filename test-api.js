
const fetch = require('node-fetch');

async function testApi() {
  try {
    const response = await fetch('http://localhost:3004/api/extract-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "John Doe\nSoftware Engineer\nExperience: Google" })
    });
    
    if (!response.ok) {
        console.log('Status:', response.status);
        console.log('Text:', await response.text());
    } else {
        const data = await response.json();
        console.log('Success:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi();
