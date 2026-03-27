import os
from typing import Any, Dict, List, Optional

from huggingface_hub import login
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig, pipeline

from config import DEFAULT_MODEL_ID, MODELS_DIR, SUPPORTED_MODELS, TOKEN


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
        model_map: Optional[Dict[str, str]] = None,
        default_model_id: str = DEFAULT_MODEL_ID,
        system_prompt: str = DEFAULT_SYSTEM_PROMPT,
        max_history_turns: int = 6,
    ) -> None:
        self.model_map = model_map or SUPPORTED_MODELS
        self.default_model_id = default_model_id
        self.system_prompt = system_prompt
        self.max_history_turns = max_history_turns
        self.pipes: Dict[str, Any] = {}
        self.generation_configs: Dict[str, GenerationConfig] = {}

        if TOKEN:
            login(token=TOKEN)

    def resolve_model_id(self, model_id: Optional[str]) -> str:
        candidate = (model_id or "").strip().lower()
        if not candidate:
            return self.default_model_id

        if candidate not in self.model_map:
            supported = ", ".join(sorted(self.model_map.keys()))
            raise ValueError(f"Unsupported model_id '{candidate}'. Supported: {supported}")

        return candidate

    def get_available_models(self) -> Dict[str, str]:
        return dict(self.model_map)

    def load(self, model_id: Optional[str] = None) -> str:
        resolved_model_id = self.resolve_model_id(model_id)

        if (
            resolved_model_id in self.pipes
            and resolved_model_id in self.generation_configs
        ):
            return resolved_model_id

        model_name = self.model_map[resolved_model_id]
        print(f"Загрузка модели {model_name} ({resolved_model_id})...")

        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True,
            cache_dir=MODELS_DIR,
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            device_map="auto",
            torch_dtype="auto",
            cache_dir=MODELS_DIR,
        )

        self.pipes[resolved_model_id] = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
        )

        self.generation_configs[resolved_model_id] = GenerationConfig(
            max_new_tokens=512,
            min_new_tokens=1,
            do_sample=False,
            repetition_penalty=1.05,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

        return resolved_model_id

    def warmup_default(self) -> None:
        self.load(self.default_model_id)

    def _trim_history(self, messages: List[Dict[str, str]], max_history_turns: int) -> List[Dict[str, str]]:
        if len(messages) <= max_history_turns * 2:
            return messages
        return messages[-max_history_turns * 2 :]

    def generate_from_messages(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_history_turns: Optional[int] = None,
        model_id: Optional[str] = None,
    ) -> str:
        resolved_model_id = self.load(model_id)

        model_pipe = self.pipes.get(resolved_model_id)
        generation_config = self.generation_configs.get(resolved_model_id)

        if model_pipe is None or generation_config is None:
            raise RuntimeError("Модель не была загружена.")

        history_turns = max_history_turns or self.max_history_turns
        trimmed_messages = self._trim_history(messages, history_turns)
        prompt_messages = [{"role": "system", "content": system_prompt or self.system_prompt}] + trimmed_messages

        prompt = model_pipe.tokenizer.apply_chat_template(
            prompt_messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        response: List[Dict[str, Any]] = model_pipe(
            prompt,
            generation_config=generation_config,
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
    chat_model.warmup_default()
    chat_loop(chat_model)
