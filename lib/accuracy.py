import logging
import colors

logger = logging.getLogger(__name__)
solves = {}

def store_find_it_verdict(challenge_key, verdict):
    store_verdict(challenge_key, 'find it', verdict)

def store_fix_it_verdict(challenge_key, verdict):
    store_verdict(challenge_key, 'fix it', verdict)

def calculate_find_it_accuracy(challenge_key):
    return calculate_accuracy(challenge_key, 'find it')

def calculate_fix_it_accuracy(challenge_key):
    return calculate_accuracy(challenge_key, 'fix it')

def total_find_it_accuracy():
    return total_accuracy('find it')

def total_fix_it_accuracy():
    return total_accuracy('fix it')

def get_find_it_attempts(challenge_key):
    return solves[challenge_key]['attempts']['find it'] if challenge_key in solves else 0

def total_accuracy(phase):
    sum_accuracy = 0
    total_solved = 0
    for key, value in solves.items():
        if value[phase]:
            sum_accuracy += 1 / value['attempts'][phase]
            total_solved += 1
    return sum_accuracy / total_solved if total_solved > 0 else 0

def calculate_accuracy(challenge_key, phase):
    accuracy = 0
    if solves[challenge_key][phase]:
        accuracy = 1 / solves[challenge_key]['attempts'][phase]
    logger.info(f"Accuracy for '{'Fix It' if phase == 'fix it' else 'Find It'}' phase of coding challenge {colors.cyan(challenge_key)}: {colors.green(accuracy) if accuracy > 0.5 else (colors.yellow(accuracy) if accuracy > 0.25 else colors.red(accuracy))}")
    return accuracy

def store_verdict(challenge_key, phase, verdict):
    if challenge_key not in solves:
        solves[challenge_key] = {'find it': False, 'fix it': False, 'attempts': {'find it': 0, 'fix it': 0}}
    if not solves[challenge_key][phase]:
        solves[challenge_key][phase] = verdict
        solves[challenge_key]['attempts'][phase] += 1
