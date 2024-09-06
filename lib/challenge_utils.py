import logging
import config
import utils
import sanitize_html
import colors
import webhook
import accuracy
from models.challenge import ChallengeModel
from data.datacache import challenges, notifications
from anti_cheat import calculate_cheat_score, calculate_find_it_cheat_score, calculate_fix_it_cheat_score
from socketio import Server
from html import unescape

logger = logging.getLogger(__name__)

def solve_if(challenge, criteria, is_restore=False):
    if not_solved(challenge) and criteria():
        solve(challenge, is_restore)

def solve(challenge, is_restore=False):
    challenge.solved = True
    challenge.save().then(lambda solved_challenge: on_challenge_solved(solved_challenge, is_restore))

def on_challenge_solved(solved_challenge, is_restore):
    logger.info(f"{'Restored' if is_restore else 'Solved'} {solved_challenge.difficulty}-star {colors.cyan(solved_challenge.key)} ({solved_challenge.name})")
    send_notification(solved_challenge, is_restore)
    if not is_restore:
        cheat_score = calculate_cheat_score(solved_challenge)
        if process.env.SOLUTIONS_WEBHOOK:
            webhook.notify(solved_challenge, cheat_score).catch(lambda error: logger.error(f"Webhook notification failed: {colors.red(utils.get_error_message(error))}"))

def send_notification(challenge, is_restore):
    if not not_solved(challenge):
        flag = utils.ctf_flag(challenge.name)
        notification = {
            'key': challenge.key,
            'name': challenge.name,
            'challenge': f"{challenge.name} ({unescape(sanitize_html(challenge.description, allowed_tags=[], allowed_attributes={}))})",
            'flag': flag,
            'hidden': not config.get('challenges.showSolvedNotifications'),
            'is_restore': is_restore
        }
        was_previously_shown = any(n['key'] == challenge.key for n in notifications)
        notifications.append(notification)

        if global_with_socket_io.io and (is_restore or not was_previously_shown):
            global_with_socket_io.io.emit('challenge solved', notification)

def send_coding_challenge_notification(challenge):
    if challenge.coding_challenge_status > 0:
        notification = {
            'key': challenge.key,
            'coding_challenge_status': challenge.coding_challenge_status
        }
        if global_with_socket_io.io:
            global_with_socket_io.io.emit('code challenge solved', notification)

def not_solved(challenge):
    return challenge and not challenge.solved

def find_challenge_by_name(challenge_name):
    for c in challenges:
        if challenges[c].name == challenge_name:
            return challenges[c]
    logger.warn(f"Missing challenge with name: {challenge_name}")

def find_challenge_by_id(challenge_id):
    for c in challenges:
        if challenges[c].id == challenge_id:
            return challenges[c]
    logger.warn(f"Missing challenge with id: {challenge_id}")

def solve_find_it(key, is_restore):
    solved_challenge = challenges[key]
    ChallengeModel.update({'coding_challenge_status': 1}, {'where': {'key': key, 'coding_challenge_status': {'$lt': 2}}})
    logger.info(f"{'Restored' if is_restore else 'Solved'} 'Find It' phase of coding challenge {colors.cyan(solved_challenge.key)} ({solved_challenge.name})")
    if not is_restore:
        accuracy.store_find_it_verdict(solved_challenge.key, True)
        accuracy.calculate_find_it_accuracy(solved_challenge.key)
        calculate_find_it_cheat_score(solved_challenge)
        send_coding_challenge_notification({'key': key, 'coding_challenge_status': 1})

def solve_fix_it(key, is_restore):
    solved_challenge = challenges[key]
    ChallengeModel.update({'coding_challenge_status': 2}, {'where': {'key': key}})
    logger.info(f"{'Restored' if is_restore else 'Solved'} 'Fix It' phase of coding challenge {colors.cyan(solved_challenge.key)} ({solved_challenge.name})")
    if not is_restore:
        accuracy.store_fix_it_verdict(solved_challenge.key, True)
        accuracy.calculate_fix_it_accuracy(solved_challenge.key)
        calculate_fix_it_cheat_score(solved_challenge)
        send_coding_challenge_notification({'key': key, 'coding_challenge_status': 2})
