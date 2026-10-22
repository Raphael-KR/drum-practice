"""Generate a reusable handoff draft or record an observed delivery receipt."""
import argparse
import json
from pathlib import Path
from common.handoff import compose, receipt


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='command', required=True)
    build = sub.add_parser('build', help='Read actual files/evidence and write a fresh local draft')
    build.add_argument('--manifest', type=Path, required=True)
    build.add_argument('--out', type=Path, required=True)
    send = sub.add_parser('receipt', help='Record actual tool receipt metadata; never sends a message')
    send.add_argument('--out', type=Path, required=True)
    send.add_argument('--recipient', required=True)
    send.add_argument('--at', required=True)
    send.add_argument('--evidence', required=True, help='Observed tool receipt ID/status, no raw transcript')
    send.add_argument('--status', choices=['accepted', 'started', 'failed'], required=True)
    a = p.parse_args()
    if a.command == 'build':
        result = compose(a.manifest, a.out)
        print(json.dumps(dict(status='draft', out=str(a.out.resolve()),
                              evidence=[{'name':e['name'], 'status':e['status']} for e in result['evidence']]), ensure_ascii=False))
    else:
        print(json.dumps(receipt(a.out, a.recipient, a.at, a.evidence, a.status), ensure_ascii=False))


if __name__ == '__main__':
    main()
