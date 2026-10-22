"""Loopback artifact transport shared by production entrypoints."""
import argparse
import base64
import gzip
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from .artifacts import profile


def write_artifacts(output, route, payload, stem):
    """Save a received package/render without interpreting score content."""
    data = dict(payload)
    if route in ('/package', '/artifacts'):
        target = output / (stem + '.drumscore')
        if target.exists():
            raise FileExistsError(target)
        package = base64.b64decode(data.pop('package'), validate=True)
        xml = data.pop('canonicalXML')
    if route in ('/render', '/artifacts'):
        target = output / 'osmd-render'
        if target.exists():
            raise FileExistsError(target)
        pages = [gzip.decompress(base64.b64decode(p, validate=True)) for p in data.pop('pages')]
        target.mkdir()
        for i, page in enumerate(pages):
            (target / f'page-{i+1}.svg').write_bytes(page)
        if route == '/render':
            (target / 'render.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
    if route in ('/package', '/artifacts'):
        (output / (stem + '.drumscore')).write_bytes(package)
        (output / (stem + '-final.musicxml')).write_text(xml)
        (output / 'package-audit.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))


def serve(output, port, song):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    config = profile(song)
    routes = ('/artifacts',) if song == 'red-sunset' else ('/render', '/package')
    origin = 'http://127.0.0.1:5173'

    class Handler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

        def do_POST(self):
            if self.path not in routes or self.headers.get('Origin') != origin:
                self.send_error(403)
                return
            size = None
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 40_000_000:
                    self.send_error(413)
                    return
                write_artifacts(output, self.path, json.loads(self.rfile.read(size)), config['packageStem'])
            except FileExistsError as error:
                self.log_error('Artifact already exists: %s', error)
                self.send_error(409)
                return
            except (ValueError, KeyError, OSError, EOFError) as error:
                self.log_error('Artifact decode/save failed route=%s size=%s error=%s', self.path, size, error)
                self.send_error(400)
                return
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', origin)
            self.end_headers()
            self.wfile.write(b'ok')

    HTTPServer(('127.0.0.1', port), Handler).serve_forever()


def cli(song):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--port', type=int, default=profile(song)['evidencePort'])
    args = parser.parse_args()
    serve(args.out, args.port, song)
