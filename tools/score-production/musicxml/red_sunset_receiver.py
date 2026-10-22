"""Compatibility entrypoint for red-sunset artifact capture."""
from common.evidence import cli, serve as _serve


def serve(output, port):
    return _serve(output, port, 'red-sunset')


def main():
    cli('red-sunset')


if __name__ == '__main__':
    main()
