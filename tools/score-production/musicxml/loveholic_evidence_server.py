"""Compatibility entrypoint for loveholic artifact capture."""
from common.evidence import cli, serve as _serve


def serve(output, port):
    return _serve(output, port, 'loveholic')


def main():
    cli('loveholic')


if __name__ == '__main__':
    main()
