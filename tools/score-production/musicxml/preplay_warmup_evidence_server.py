"""Compatibility entrypoint for preplay-warmup artifact capture."""
from common.evidence import cli, serve as _serve


def serve(output, port):
    return _serve(output, port, 'preplay-warmup')


def main():
    cli('preplay-warmup')


if __name__ == '__main__':
    main()
