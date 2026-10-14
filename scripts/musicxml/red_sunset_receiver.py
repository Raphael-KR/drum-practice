"""Loopback artifact receiver, not an app/preview server or a DB writer."""
import argparse,base64,gzip,json
from http.server import HTTPServer,BaseHTTPRequestHandler
from pathlib import Path

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);a=ap.parse_args()
    if a.out.exists():raise ValueError('Fresh output directory required')
    a.out.mkdir(parents=True)
    class H(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204);self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5173');self.send_header('Access-Control-Allow-Headers','Content-Type');self.end_headers()
        def do_POST(self):
            if self.path!='/artifacts' or self.headers.get('Origin')!='http://127.0.0.1:5173':self.send_error(403);return
            n=int(self.headers.get('Content-Length','0'))
            if n>40000000:self.send_error(413);return
            target=a.out/'red-sunset.drumscore'
            if target.exists():self.send_error(409);return
            data=json.loads(self.rfile.read(n));target.write_bytes(base64.b64decode(data.pop('package'),validate=True))
            (a.out/'red-sunset-final.musicxml').write_text(data.pop('canonicalXML'))
            rr=a.out/'osmd-render';rr.mkdir()
            for i,p in enumerate(data.pop('pages')):(rr/f'page-{i+1}.svg').write_bytes(gzip.decompress(base64.b64decode(p,validate=True)))
            (a.out/'package-audit.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
            self.send_response(200);self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5173');self.end_headers();self.wfile.write(b'ok')
    HTTPServer(('127.0.0.1',5191),H).serve_forever()
if __name__=='__main__':main()
