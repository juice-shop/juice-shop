from itertools import cycle
from gpt4all import GPT4All


my_gpt = GPT4All()

class RotatingTemplateGPT4All(GPT4All):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._templates = [
            "Respond like a pirate.",
            "Respond like a politician.",
            "Respond like a philosopher.",
            "Respond like a Klingon.",
        ]
        self._cycling_templates = cycle(self._templates)

    def _format_chat_prompt_template(
        self,
        messages: list,
        default_prompt_header: str = "",
        default_prompt_footer: str = "",
    ) -> str:
        full_prompt = default_prompt_header + "\n\n" if default_prompt_header != "" else ""
        for message in messages:
            if message["role"] == "user":
                user_message = f"USER: {message['content']} {next(self._cycling_templates)}\n"
                full_prompt += user_message
            if message["role"] == "assistant":
                assistant_message = f"ASSISTANT: {message['content']}\n"
                full_prompt += assistant_message
        full_prompt += "\n\n" + default_prompt_footer if default_prompt_footer != "" else ""
        print(full_prompt)
        return full_prompt