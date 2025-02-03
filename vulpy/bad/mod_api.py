from flask import Blueprint, render_template, redirect, request, g, session, make_response, flash, jsonify
import libuser
import libsession
import libposts
import libapi
from jsonschema import validate, ValidationError


mod_api = Blueprint('mod_api', __name__, template_folder='templates')

key_schema = {
    "type" : "object",
    "required": [ "username", "password" ],
    "properties" : {
        "username" : {"type" : "string"},
        "password" : {"type" : "string"},
    },
}


post_schema = {
    "type" : "object",
    "required": [ "text" ],
    "properties" : {
        "text" : {"type" : "string"},
    },
}


@mod_api.route('/key', methods=['POST'])
def do_key_create():
    data = request.get_json()

    try:
        validate(data, key_schema)
    except ValidationError:
        return jsonify({'error': 'invalid schema', 'schema': key_schema}), 400

    key = libapi.keygen(data['username'], data['password'])

    if key:
        return jsonify({'key': key}), 200
    else:
        return jsonify({'error': 'invalid login'}), 403


@mod_api.route('/post/<username>', methods=['GET'])
def do_post_list(username):
    posts = libposts.get_posts(username)

    return jsonify(posts)


@mod_api.route('/post', methods=['POST'])
def do_post_create():

    data = { 'username' : libapi.authenticate(request) }

    if not data['username']:
        return jsonify({'error': 'invalid authentication'}), 401

    data.update(request.get_json())

    try:
        validate(data, post_schema)
    except ValidationError:
        return jsonify({'error': 'invalid schema', 'schema': post_schema}), 400

    libposts.post(data['username'], data['text'])
    return "You are awesome! Post created."


