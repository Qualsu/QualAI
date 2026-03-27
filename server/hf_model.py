import os
from typing import Any, Dict, List, Optional

from huggingface_hub import login
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig, pipeline

from config import MODEL_NAME, TOKEN


DEFAULT_SYSTEM_PROMPT = (
    "Ты русскоязычный ИИ-ассистент Qual AI, созданный компанией Qualsu "
    "Отвечай без списков, без повторов, без самодиалога, без служебных префиксов "
    "Если вопрос простой, ответь максимально кратко"
)


def clean_response_text(text: str) -> str:
    cleaned = text.strip()
    for marker in ["<|im_end|>", "<|endoftext|>"]:
        cleaned = cleaned.replace(marker, "")
    return cleaned.strip()


class HFChatModel:
    def __init__(
        self,
        model_name: str = MODEL_NAME,
        system_prompt: str = DEFAULT_SYSTEM_PROMPT,
        max_history_turns: int = 6,
    ) -> None:
        self.model_name = model_name
        self.system_prompt = system_prompt
        self.max_history_turns = max_history_turns
        self.pipe = None
        self.generation_config = None

        if TOKEN:
            login(token=TOKEN)

    def load(self) -> None:
        if self.pipe is not None and self.generation_config is not None:
            return

        print(f"Загрузка модели {self.model_name}... Это может занять время при первом запуске.")

        tokenizer = AutoTokenizer.from_pretrained(self.model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            trust_remote_code=True,
            device_map="auto",
            torch_dtype="auto",
        )

        self.pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
        )

        self.generation_config = GenerationConfig(
            max_new_tokens=512,
            min_new_tokens=1,
            do_sample=False,
            repetition_penalty=1.05,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

    def _trim_history(self, messages: List[Dict[str, str]], max_history_turns: int) -> List[Dict[str, str]]:
        if len(messages) <= max_history_turns * 2:
            return messages
        return messages[-max_history_turns * 2 :]

    def generate_from_messages(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_history_turns: Optional[int] = None,
    ) -> str:
        self.load()

        if self.pipe is None or self.generation_config is None:
            raise RuntimeError("Модель не была загружена.")

        history_turns = max_history_turns or self.max_history_turns
        trimmed_messages = self._trim_history(messages, history_turns)
        prompt_messages = [{"role": "system", "content": system_prompt or self.system_prompt}] + trimmed_messages

        prompt = self.pipe.tokenizer.apply_chat_template(
            prompt_messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        response: List[Dict[str, Any]] = self.pipe(
            prompt,
            generation_config=self.generation_config,
            return_full_text=False,
        )

        generated = response[0].get("generated_text", "")
        bot_message = clean_response_text(generated)
        return bot_message or "Понял."


def chat_loop(chat_model: HFChatModel) -> None:
    print("\n--- Чат запущен! (Напишите 'выход' для завершения) ---")
    messages: List[Dict[str, str]] = []

    while True:
        try:
            user_input = input("\nВы: ")
            if user_input.lower() in ["выход", "exit", "quit"]:
                print("До свидания!")
                break

            if not user_input.strip():
                continue

            messages.append({"role": "user", "content": user_input})
            bot_message = chat_model.generate_from_messages(messages)

            if "\n" in bot_message:
                print(f"Бот:\n{bot_message}")
            else:
                print(f"Бот: {bot_message}")

            messages.append({"role": "assistant", "content": bot_message})
            messages = chat_model._trim_history(messages, chat_model.max_history_turns)

        except KeyboardInterrupt:
            print("\nПринудительное завершение.")
            break
        except Exception as error:
            print(f"\nПроизошла ошибка: {error}")


if __name__ == "__main__":
    if not os.path.exists(os.path.expanduser("~/.cache/huggingface/token")):
        print("Внимание: Вы не вошли в аккаунт Hugging Face. Некоторые модели могут не скачаться.")
        print("Выполните в терминале: huggingface-cli login")

    chat_model = HFChatModel()
    chat_model.load()
    chat_loop(chat_model)