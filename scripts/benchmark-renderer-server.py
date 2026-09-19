"""Local-only renderer benchmark server. No access to application databases."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]/'docs/experiments/renderer-benchmark'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
 def do_POST(self):
  if self.path!='/result': self.send_error(404);return
  data=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
  run=data.get('run')
  if run not in ('desktop','simulator'):self.send_error(400);return
  (ROOT/f'{run}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
  self.send_response(200);self.end_headers();self.wfile.write(b'ok')
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',5187),Handler).serve_forever()
