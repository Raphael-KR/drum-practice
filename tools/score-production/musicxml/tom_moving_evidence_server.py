"""Compatibility entrypoint for tom-moving artifact capture."""
from common.evidence import cli, serve as _serve


def serve(output, port):
    return _serve(output, port, 'tom-moving')


def main():
    cli('tom-moving')


if __name__ == '__main__':
    main()
