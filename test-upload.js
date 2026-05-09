import fs from 'fs';

async function testUpload() {
  fs.writeFileSync('test.jpg', 'fake image content');
  
  const blob = new Blob([fs.readFileSync('test.jpg')], {type: 'image/jpeg'});
  const form = new FormData();
  form.append('file', blob, 'test.jpg');

  console.log("Sending...");
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
    });
    
    console.log(res.status, await res.text());
  } catch(e) {
    console.error(e);
  }
}

testUpload();
