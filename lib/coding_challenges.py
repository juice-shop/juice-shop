import os
import re
import logging
import pandas as pd

logger = logging.getLogger(__name__)

SNIPPET_PATHS = [
    './server.py',
    './routes',
    './lib',
    './data',
    './data/static/web3-snippets',
    './frontend/src/app',
    './models'
]

class BrokenBoundary(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.name = 'BrokenBoundary'
        self.message = message

def find_files_with_code_challenges(paths):
    matches = []
    for curr_path in paths:
        if os.path.isdir(curr_path):
            files = [os.path.join(curr_path, file) for file in os.listdir(curr_path)]
            more_matches = find_files_with_code_challenges(files)
            matches.extend(more_matches)
        else:
            try:
                with open(curr_path, 'r', encoding='utf-8') as file:
                    code = file.read()
                    if (
                        '// vuln-code-snippet start' in code or
                        '# vuln-code-snippet start' in code
                    ):
                        matches.append({'path': curr_path, 'content': code})
            except Exception as e:
                logger.warn(f"File {curr_path} could not be read. it might have been moved or deleted. If coding challenges are contained in the file, they will not be available.")
    return matches

def get_code_challenges_from_file(file):
    file_content = file['content']
    challenge_key_regex = re.compile(r'[/#]{0,2} vuln-code-snippet start (?P<challenges>.*)')
    challenges = [
        match.group('challenges').split(' ')
        for match in challenge_key_regex.finditer(file_content)
    ]
    challenges = [item for sublist in challenges for item in sublist if item]
    return [get_coding_challenge_from_file_content(file_content, challenge_key) for challenge_key in challenges]

def get_coding_challenge_from_file_content(source, challenge_key):
    snippets = re.findall(rf'[/#]{{0,2}} vuln-code-snippet start.*{challenge_key}([^])*vuln-code-snippet end.*{challenge_key}', source)
    if not snippets:
        raise BrokenBoundary(f'Broken code snippet boundaries for: {challenge_key}')
    snippet = snippets[0]
    snippet = re.sub(r'\s?[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}', '', snippet)
    snippet = re.sub(r'\s?[/#]{0,2} vuln-code-snippet end.*', '', snippet)
    snippet = re.sub(r'.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}', '', snippet)
    snippet = re.sub(r'.*[/#]{0,2} vuln-code-snippet hide-start([^])*[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}', '', snippet)
    snippet = snippet.strip()

    lines = snippet.split('\r\n')
    if len(lines) == 1:
        lines = snippet.split('\n')
    if len(lines) == 1:
        lines = snippet.split('\r')
    vuln_lines = []
    neutral_lines = []
    for i, line in enumerate(lines):
        if re.search(rf'vuln-code-snippet vuln-line.*{challenge_key}', line):
            vuln_lines.append(i + 1)
        elif re.search(rf'vuln-code-snippet neutral-line.*{challenge_key}', line):
            neutral_lines.append(i + 1)
    snippet = re.sub(r'\s?[/#]{0,2} vuln-code-snippet vuln-line.*', '', snippet)
    snippet = re.sub(r'\s?[/#]{0,2} vuln-code-snippet neutral-line.*', '', snippet)
    return {'challenge_key': challenge_key, 'snippet': snippet, 'vuln_lines': vuln_lines, 'neutral_lines': neutral_lines}

_internal_code_challenges = None

def get_code_challenges():
    global _internal_code_challenges
    if _internal_code_challenges is None:
        _internal_code_challenges = {}
        files_with_code_challenges = find_files_with_code_challenges(SNIPPET_PATHS)
        for file_match in files_with_code_challenges:
            for code_challenge in get_code_challenges_from_file(file_match):
                _internal_code_challenges[code_challenge['challenge_key']] = {
                    'snippet': code_challenge['snippet'],
                    'vuln_lines': code_challenge['vuln_lines'],
                    'neutral_lines': code_challenge['neutral_lines']
                }
    return _internal_code_challenges
