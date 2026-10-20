"""Loopback-only receiver for a fresh Loveholic package review directory."""
import argparse
import base64
import gzip
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path


def serve(output, port):
    if output.exists():
        raise ValueError("Evidence output must be a new directory")
    output.mkdir(parents=True)

    class Handler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_POST(self):
            if self.path not in ["/render", "/package"] or self.headers.get("Origin") != "http://127.0.0.1:5173":
                self.send_error(403)
                return
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            if self.path == "/package":
                (output / "Loveholic.drumscore").write_bytes(base64.b64decode(body.pop("package")))
                (output / "Loveholic-final.musicxml").write_text(body.pop("canonicalXML"))
                (output / "package-audit.json").write_text(json.dumps(body, ensure_ascii=False, indent=2))
            else:
                target = output / "osmd-render"
                target.mkdir(exist_ok=True)
                for i, page in enumerate(body.pop("pages")):
                    (target / f"page-{i+1}.svg").write_bytes(gzip.decompress(base64.b64decode(page)))
                (target / "render.json").write_text(json.dumps(body, ensure_ascii=False, indent=2))
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
            self.end_headers()
            self.wfile.write(b"ok")

    HTTPServer(("127.0.0.1", port), Handler).serve_forever()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--port", type=int, default=5187)
    args = parser.parse_args()
    serve(args.out, args.port)
