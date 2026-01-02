// const fetch = require('node-fetch');

async function testAiAction() {
  try {
    const response = await fetch('http://localhost:3004/api/ai-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'fix_syntax',
        latexCode: '\\documentclass{article}\\begin{document}Hello World\\end{document}',
        jobDescription: 'Test',
        errorLog: 'None',
        pageCount: 1
      })
    });

    if (!response.ok) {
      console.error('Response not ok:', response.status, response.statusText);
      const text = await response.text();
      console.error('Body:', text);
    } else {
      const data = await response.json();
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testAiAction();
