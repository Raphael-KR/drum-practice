"""Loopback artifact transport shared by production entrypoints."""

import argparse
import base64
import gzip
import json
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from .artifacts import profile


def read_render_gzip(output, artifact_id):
    """Read one received SVG page, checking chunk order and gzip integrity."""
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", artifact_id):
        raise ValueError(
            f"Unsafe artifactId: expected=[a-z0-9][a-z0-9-]{{0,63}}, actual={artifact_id!r}"
        )
    folder = Path(output) / artifact_id / "osmd-render"
    page = folder / "page-1.svg"
    if page.is_file():
        return gzip.compress(page.read_bytes(), mtime=0)
    info = json.loads((folder / "render.json").read_text())
    parts = info["encodedPageParts"]
    if not parts or len(set(parts)) != len(parts):
        raise ValueError(
            f"Page chunks: expected=nonempty unique list, actual={parts!r}"
        )
    encoded = []
    for index, part in enumerate(parts):
        if part != f"{artifact_id}-part-{index + 1}":
            raise ValueError(
                f"Page chunk identity/order: expected={artifact_id}-part-{index + 1}, actual={part!r}"
            )
        chunk = json.loads(
            (Path(output) / part / "osmd-render/render.json").read_text()
        )
        if chunk["index"] != index or chunk["total"] != len(parts):
            raise ValueError(
                f"Page chunk index/count: expected=({index}, {len(parts)}), actual=({chunk['index']}, {chunk['total']})"
            )
        encoded.append(chunk["encodedPageChunk"])
    value = "".join(encoded)
    if len(value) != info["base64Length"]:
        raise ValueError(
            f"Page chunk total length: expected={info['base64Length']}, actual={len(value)}"
        )
    packed = base64.b64decode(value, validate=True)
    gzip.decompress(packed)  # gzip CRC and complete-stream verification
    return packed


def write_artifacts(output, route, payload, stem):
    """Save a received package/render without interpreting score content."""
    data = dict(payload)
    if route in ("/package", "/artifacts"):
        target = output / (stem + ".drumscore")
        if target.exists():
            raise FileExistsError(target)
        package = base64.b64decode(data.pop("package"), validate=True)
        xml = data.pop("canonicalXML")
    if route in ("/render", "/artifacts"):
        target = output / "osmd-render"
        if target.exists():
            raise FileExistsError(target)
        pages = [
            gzip.decompress(base64.b64decode(p, validate=True))
            for p in data.pop("pages")
        ]
        target.mkdir()
        for i, page in enumerate(pages):
            (target / f"page-{i+1}.svg").write_bytes(page)
        if route == "/render":
            (target / "render.json").write_text(
                json.dumps(data, ensure_ascii=False, indent=2)
            )
    if route in ("/package", "/artifacts"):
        (output / (stem + ".drumscore")).write_bytes(package)
        (output / (stem + "-final.musicxml")).write_text(xml)
        (output / "package-audit.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2)
        )


def serve(output, port, song, routes=None, per_score=False):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    config = profile(song)
    routes = routes or (
        ("/artifacts",) if song == "red-sunset" else ("/render", "/package")
    )
    origin = "http://127.0.0.1:5173"

    class Handler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_POST(self):
            if self.path not in routes or self.headers.get("Origin") != origin:
                self.send_error(403)
                return
            size = None
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if not 0 < size <= 40_000_000:
                    self.send_error(413)
                    return
                payload = json.loads(self.rfile.read(size))
                target = output
                if per_score:
                    identity = payload.pop("artifactId", "")
                    if not isinstance(identity, str) or not re.fullmatch(
                        r"[a-z0-9][a-z0-9-]{0,63}", identity
                    ):
                        raise ValueError(
                            f"Per-score artifactId: expected=[a-z0-9][a-z0-9-]{{0,63}}, actual={identity!r}"
                        )
                    target = output / identity
                    target.mkdir(exist_ok=True)
                write_artifacts(
                    target,
                    self.path,
                    payload,
                    config["packageStem"],
                )
            except FileExistsError as error:
                self.log_error("Artifact already exists: %s", error)
                self.send_error(409)
                return
            except (ValueError, KeyError, OSError, EOFError) as error:
                self.log_error(
                    "Artifact decode/save failed route=%s size=%s error=%s",
                    self.path,
                    size,
                    error,
                )
                self.send_error(400)
                return
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", origin)
            self.end_headers()
            self.wfile.write(b"ok")

    HTTPServer(("127.0.0.1", port), Handler).serve_forever()


def cli(song):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--port", type=int, default=profile(song)["evidencePort"])
    parser.add_argument(
        "--per-score",
        action="store_true",
        help="Save each render payload under its safe artifactId; keep the request limit",
    )
    parser.add_argument(
        "--render-only",
        action="store_true",
        help="Save SVG evidence without creating an audio package",
    )
    args = parser.parse_args()
    serve(
        args.out,
        args.port,
        song,
        routes=("/render",) if args.render_only else None,
        per_score=args.per_score,
    )
