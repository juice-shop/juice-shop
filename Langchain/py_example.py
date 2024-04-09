import logging
import sys
import argparse
import os
import pandas as pd
from langchain.callbacks import get_openai_callback
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from tqdm.auto import tqdm
from google_utils import df_to_sheet_overwrite, df_to_sheet_append
import tiktoken


logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
tqdm.pandas()
get_call = get_openai_callback()
new_chat = ChatOpenAI()

class PromptRunner:
    def __init__(self, prompt: str, repo_path: str, keywords: str, spreadsheet_id: str, append: str):
        self.model_name = 'gpt-4'
        self.prompt = prompt
        self.keywords_list = keywords.split(',')
        self.repo_path = repo_path
        self.chat = ChatOpenAI(temperature=0.5, model=self.model_name, openai_api_key=os.getenv('OPENAI_API_KEY'))
        self.accumulated_cost = 0
        self.spreadsheet_id = spreadsheet_id
        self.append = append == 'Yes'
        self.encoding = tiktoken.encoding_for_model(self.model_name)
        self.suffixes_to_ignore = ['md','yml','json','yaml','star','gitignore']

    def run(self):
        relevant_paths_to_contents, matching_keywords = self._relevant_paths_to_contents()
        results = pd.DataFrame(list(relevant_paths_to_contents.items()), columns=['file_path', 'file_content'])
        results['matching_keyword'] = matching_keywords
        results['prompt'] = self.prompt
        results['num_tokens'] = results.apply(lambda row: len(self.encoding.encode(':'.join([row['prompt'], row['file_content']]))), axis=1)
        # results = results.head(10)
        results['response'] = results.progress_apply(lambda row: self._ask_llm(row['file_content']) if row['num_tokens'] < 7000 else 'file too long', axis=1)
        self._save_to_spreadsheet(results)
        return

    def _relevant_paths_to_contents(self):
        logging.info(f'working on {self.repo_path}')
        relevant_paths_to_contents = {}
        matching_keywords = []
        for root, dirs, files in os.walk(self.repo_path):
            for file in files:
                file_path = os.path.join(root, file)
                if ('test' in file_path.split(self.repo_path)[-1].lower()) or (any(suffix in file_path.split('.')[-1].lower() for suffix in self.suffixes_to_ignore)):
                    continue
                file_content = self._read_file(file_path)
                if any(keyword in file_content for keyword in self.keywords_list):
                    relevant_paths_to_contents[file_path] = file_content
                    match = 'none'
                    for keyword in self.keywords_list:
                        if (keyword in file_content):
                            print(file_path.split('/')[-1], keyword)
                            match = keyword
                            break
                    matching_keywords.append(match)
        return relevant_paths_to_contents, matching_keywords

    def _ask_llm(self, file_content: str) -> str:
        with get_openai_callback() as cb:
            prompt = f'{self.prompt}: {file_content}'
            response = self.chat([HumanMessage(content=prompt)]).content
            self.accumulated_cost += cb.total_cost
            logging.info(f'accumulated cost {round(self.accumulated_cost, 2)}$')
        return response

    def _save_to_spreadsheet(self, df):
        logging.debug(f'saving to spreadsheet id {self.spreadsheet_id}')
        df_to_sheet_append(df, self.spreadsheet_id, 'Sheet1') if self.append else df_to_sheet_overwrite(df, self.spreadsheet_id, 'Sheet1')
        logging.debug('saved')
        return

    @staticmethod
    def _read_file(file_path):
        try:
            with open(file_path, 'r') as f:
                file_content = f.read()[:40000]
        except (UnicodeDecodeError, FileNotFoundError):
            file_content = ''
        return file_content


def parse_args():
    parser = argparse.ArgumentParser(description="Run prompts on files from the repository containing keywords")
    parser.add_argument("--repo_path")
    parser.add_argument("--keywords")
    parser.add_argument("--prompt")
    parser.add_argument("--spreadsheet_id")
    parser.add_argument("--append", choices=['Yes', 'No'])
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    runner = PromptRunner(args.prompt, args.repo_path, args.keywords, args.spreadsheet_id, args.append)
    runner.run()
    get_call = get_openai_callback()
    new_chat = ChatOpenAI()