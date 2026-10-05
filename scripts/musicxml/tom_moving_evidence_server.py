"""Fresh-directory, localhost-only artifact receiver for tom-moving review."""
import argparse
import base64
import gzip
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

def serve(output, port):
    if output.exists():raise ValueError('Use a fresh evidence directory')
    output.mkdir(parents=True)
    class Handler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5173')
            self.send_header('Access-Control-Allow-Headers','Content-Type')
            self.end_headers()
        def do_POST(self):
            if self.path not in ['/render','/package'] or self.headers.get('Origin')!='http://127.0.0.1:5173':
                self.send_error(403);return
            if int(self.headers.get('Content-Length','0'))>40_000_000:
                self.send_error(413);return
            data=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            if self.path=='/package':
                target=output/'tom-moving.drumscore'
                if target.exists():self.send_error(409);return
                target.write_bytes(base64.b64decode(data.pop('package'),validate=True))
                (output/'tom-moving-final.musicxml').write_text(data.pop('canonicalXML'))
                (output/'package-audit.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
            else:
                target=output/'osmd-render'
                if target.exists():self.send_error(409);return
                target.mkdir()
                for i,page in enumerate(data.pop('pages')):(target/f'page-{i+1}.svg').write_bytes(gzip.decompress(base64.b64decode(page,validate=True)))
                (target/'render.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5173')
            self.end_headers();self.wfile.write(b'ok')
    HTTPServer(('127.0.0.1',port),Handler).serve_forever()

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,required=True);p.add_argument('--port',type=int,default=5188);a=p.parse_args();serve(a.out,a.port)
