#!/usr/bin/env python3

import hashlib

import click


@click.command()
@click.argument('algorithm', type=click.Choice(sorted(hashlib.algorithms_available)))
@click.argument('digest')
def crack_hash(digest, algorithm):

    for number in range(10000):
        h = hashlib.new(algorithm, str(number).encode()).hexdigest()
        if h == digest:
            print('Cracked! Password:', number)
            return True

    print('Unable to crack', digest)
    return False

if __name__ == '__main__':
    crack_hash()
