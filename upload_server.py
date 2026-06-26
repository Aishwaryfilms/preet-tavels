"""
Simple upload server - pick your car images and they get saved automatically.
Run this, then open http://localhost:9090 in your browser.
"""
import http.server
import os
import shutil
import json

SAVE_DIR = r"C:\Users\aishw\Downloads\lucky site"
LS2_DIR = r"C:\Users\aishw\Downloads\ls2"
PORT = 9090

HTML_PAGE = '''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Upload Car Gallery Images</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a0a; color: #fff; font-family: 'Segoe UI', sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
h1 { font-size: 2rem; margin-bottom: 10px; }
p.sub { color: #888; margin-bottom: 30px; }
.slots { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 30px; }
.slot { width: 200px; height: 200px; border: 2px dashed #444; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
.slot:hover { border-color: #d4af37; background: rgba(212,175,55,0.05); }
.slot.filled { border-color: #22c55e; border-style: solid; }
.slot img { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
.slot .label { font-size: 0.85rem; color: #888; z-index: 1; pointer-events: none; }
.slot .name { font-weight: bold; color: #d4af37; margin-bottom: 5px; font-size: 1rem; z-index: 1; pointer-events: none; }
.slot .check { position: absolute; top: 8px; right: 8px; background: #22c55e; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; z-index: 2; display: none; }
.slot.filled .check { display: flex; }
.slot.filled .name, .slot.filled .label { display: none; }
input[type=file] { display: none; }
button { background: linear-gradient(135deg, #d4af37, #b8941f); color: #000; border: none; padding: 16px 48px; font-size: 1.1rem; font-weight: bold; border-radius: 12px; cursor: pointer; transition: all 0.3s; }
button:hover { transform: scale(1.05); }
button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.status { margin-top: 20px; font-size: 1rem; color: #22c55e; min-height: 30px; text-align: center; }
.error { color: #ef4444; }
</style>
</head>
<body>
<h1>Upload Gallery Images</h1>
<p class="sub">Click each slot to pick an image, or drag and drop onto it</p>
<div class="slots">
  <div class="slot" data-name="car-1.jpg" onclick="pickFile(this)">
    <div class="check">OK</div>
    <div class="name">car-1.jpg</div>
    <div class="label">Front Face</div>
    <input type="file" accept="image/*" onchange="fileSelected(this)">
  </div>
  <div class="slot" data-name="car-2.jpg" onclick="pickFile(this)">
    <div class="check">OK</div>
    <div class="name">car-2.jpg</div>
    <div class="label">Side View</div>
    <input type="file" accept="image/*" onchange="fileSelected(this)">
  </div>
  <div class="slot" data-name="car-3.jpg" onclick="pickFile(this)">
    <div class="check">OK</div>
    <div class="name">car-3.jpg</div>
    <div class="label">Angled View</div>
    <input type="file" accept="image/*" onchange="fileSelected(this)">
  </div>
  <div class="slot" data-name="car-4.jpg" onclick="pickFile(this)">
    <div class="check">OK</div>
    <div class="name">car-4.jpg</div>
    <div class="label">Boot Space</div>
    <input type="file" accept="image/*" onchange="fileSelected(this)">
  </div>
  <div class="slot" data-name="car-5.jpg" onclick="pickFile(this)">
    <div class="check">OK</div>
    <div class="name">car-5.jpg</div>
    <div class="label">Interior</div>
    <input type="file" accept="image/*" onchange="fileSelected(this)">
  </div>
</div>
<button id="uploadBtn" onclick="uploadAll()" disabled>Upload All Images</button>
<div class="status" id="status"></div>

<script>
const files = {};

document.querySelectorAll('.slot').forEach(slot => {
  slot.addEventListener('dragover', e => { e.preventDefault(); slot.style.borderColor = '#d4af37'; });
  slot.addEventListener('dragleave', e => { slot.style.borderColor = slot.classList.contains('filled') ? '#22c55e' : '#444'; });
  slot.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFile(slot, file);
    }
  });
});

function pickFile(slot) {
  slot.querySelector('input[type=file]').click();
}

function fileSelected(input) {
  const slot = input.closest('.slot');
  if (input.files[0]) setFile(slot, input.files[0]);
}

function setFile(slot, file) {
  const name = slot.dataset.name;
  files[name] = file;
  slot.classList.add('filled');
  const existing = slot.querySelector('img');
  if (existing) existing.remove();
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  slot.appendChild(img);
  slot.style.borderColor = '#22c55e';
  checkReady();
}

function checkReady() {
  document.getElementById('uploadBtn').disabled = Object.keys(files).length === 0;
}

async function uploadAll() {
  const btn = document.getElementById('uploadBtn');
  const status = document.getElementById('status');
  btn.disabled = true;
  btn.textContent = 'Uploading...';
  status.textContent = '';
  status.className = 'status';

  let successCount = 0;
  const total = Object.keys(files).length;

  for (const [name, file] of Object.entries(files)) {
    status.textContent = 'Saving ' + name + '...';
    const reader = new FileReader();
    const base64 = await new Promise(resolve => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: name, data: base64 })
      });
      if (res.ok) successCount++;
      else status.textContent += ' FAILED';
    } catch (e) {
      status.textContent += ' ERROR';
    }
  }
  
  if (successCount === total) {
    status.textContent = 'All ' + successCount + ' images saved! You can close this page and refresh your site.';
  } else {
    status.textContent = successCount + '/' + total + ' saved. Some failed.';
    status.className = 'status error';
  }
  btn.textContent = 'Upload All Images';
  btn.disabled = false;
}
</script>
</body>
</html>'''


class UploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_PAGE.encode('utf-8'))

    def do_POST(self):
        if self.path == '/upload':
            length = int(self.headers['Content-Length'])
            body = self.rfile.read(length)
            data = json.loads(body)
            
            filename = data['filename']
            import base64
            file_bytes = base64.b64decode(data['data'])
            
            # Save to lucky site folder
            save_path = os.path.join(SAVE_DIR, filename)
            with open(save_path, 'wb') as f:
                f.write(file_bytes)
            
            # Also save to ls2 folder
            ls2_path = os.path.join(LS2_DIR, filename)
            with open(ls2_path, 'wb') as f:
                f.write(file_bytes)
            
            print(f"  Saved: {filename} ({len(file_bytes)} bytes)")
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    print(f"\n{'='*50}")
    print(f"  Image Upload Server Running!")
    print(f"  Open: http://localhost:{PORT}")
    print(f"  Images save to: {SAVE_DIR}")
    print(f"{'='*50}\n")
    
    server = http.server.HTTPServer(('', PORT), UploadHandler)
    server.serve_forever()
