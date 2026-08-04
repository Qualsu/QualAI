import json
import os
import aiohttp
from typing import Any, Dict, List, Optional
import asyncio

from config import DEFAULT_MODEL_ID, OLLAMA_BASE_URL, SUPPORTED_MODELS

DEFAULT_SYSTEM_PROMPT = (
    "Ты русскоязычный ИИ-ассистент Qual AI, созданный компанией Qualsu. "
    "Отвечай без лишних списков, без повторов, без самодиалога, без служебных префиксов. "
    "Если вопрос простой, ответь максимально кратко и точно."
)


def clean_response_text(text: str) -> str:
    cleaned = text.strip()
    for marker in ["<|im_end|>", "<|endoftext|>", "<|im_start|>"]:
        cleaned = cleaned.replace(marker, "")
    return cleaned.strip()


class HFChatModel:
    def __init__(
        self,
        base_url: str = OLLAMA_BASE_URL,
        model_map: Optional[Dict[str, str]] = None,
        default_model_id: str = DEFAULT_MODEL_ID,
        system_prompt: str = DEFAULT_SYSTEM_PROMPT,
        max_history_turns: int = 6,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model_map = model_map or SUPPORTED_MODELS
        self.default_model_id = default_model_id
        self.system_prompt = system_prompt
        self.max_history_turns = max_history_turns

    def resolve_model_id(self, model_id: Optional[str]) -> str:
        candidate = (model_id or "").strip()
        if not candidate:
            return self.default_model_id

        for key in self.model_map.keys():
            if key.lower() == candidate.lower():
                return key

        supported = ", ".join(sorted(self.model_map.keys()))
        raise ValueError(f"Unsupported model_id '{candidate}'. Supported: {supported}")

    def get_available_models(self) -> Dict[str, str]:
        return dict(self.model_map)

    async def warmup_default(self) -> None:
        print(f"Qual AI инициализирован. Хост Ollama: {self.base_url}, модель по умолчанию: {self.default_model_id}")
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags", timeout=5) as response:
                    if response.status == 200:
                        print("Соединение с сервером моделей успешно установлено.")
        except Exception as err:
            print(f"Внимание: Не удалось подключиться к Ollama на {self.base_url}: {err}")

    def _trim_history(self, messages: List[Dict[str, str]], max_history_turns: int) -> List[Dict[str, str]]:
        if len(messages) <= max_history_turns * 2:
            return messages
        return messages[-max_history_turns * 2 :]

    async def generate_from_messages(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_history_turns: Optional[int] = None,
        model_id: Optional[str] = None,
    ) -> str:
        resolved_model_id = self.resolve_model_id(model_id)
        history_turns = max_history_turns or self.max_history_turns
        trimmed_messages = self._trim_history(messages, history_turns)

        formatted_messages = [
            {"role": "system", "content": system_prompt or self.system_prompt}
        ]
        for msg in trimmed_messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant", "system"] and content:
                formatted_messages.append({"role": role, "content": content})

        payload = {
            "model": resolved_model_id,
            "messages": formatted_messages,
            "stream": False,
        }

        chat_url = f"{self.base_url}/api/chat"
        generate_url = f"{self.base_url}/api/generate"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(chat_url, json=payload, timeout=120) as response:
                    if response.status == 200:
                        result = await response.json()
                        generated = result.get("message", {}).get("content", "")
                        bot_message = clean_response_text(generated)
                        return bot_message or "Понял."
                    else:
                        raise aiohttp.ClientResponseError(
                            request_info=response.request_info,
                            history=response.history,
                            status=response.status,
                            message=response.reason
                        )
        except aiohttp.ClientResponseError as http_err:
            # Fallback to /api/generate
            try:
                last_user_message = next(
                    (m["content"] for m in reversed(trimmed_messages) if m.get("role") == "user"),
                    ""
                )
                gen_payload = {
                    "model": resolved_model_id,
                    "prompt": last_user_message,
                    "system": system_prompt or self.system_prompt,
                    "stream": False,
                }
                async with aiohttp.ClientSession() as session:
                    async with session.post(generate_url, json=gen_payload, timeout=120) as gen_response:
                        if gen_response.status == 200:
                            gen_result = await gen_response.json()
                            generated = gen_result.get("response", "")
                            bot_message = clean_response_text(generated)
                            return bot_message or "Понял."
                        else:
                            raise Exception(f"Generate error {gen_response.status}")
            except Exception as e:
                raise RuntimeError(f"Ошибка API модели ({http_err.status}): {http_err.message}") from http_err
        except aiohttp.ClientError as url_err:
            raise RuntimeError(f"Не удалось подключиться к серверу модели {self.base_url}: {url_err}") from url_err
        except Exception as err:
            raise RuntimeError(f"Ошибка генерации ответа: {err}") from err


async def chat_loop(chat_model: HFChatModel) -> None:
    print("\n--- Чат запущен! (Напишите 'выход' для завершения) ---")
    messages: List[Dict[str, str]] = []

    # get_event_loop().run_in_executor could be used for blocking input, but for simple tests blocking is fine
    import sys
    loop = asyncio.get_running_loop()

    while True:
        try:
            # Using run_in_executor to avoid blocking the event loop on input
            user_input = await loop.run_in_executor(None, input, "\nВы: ")
            if user_input.lower() in ["выход", "exit", "quit"]:
                print("До свидания!")
                break

            if not user_input.strip():
                continue

            messages.append({"role": "user", "content": user_input})
            bot_message = await chat_model.generate_from_messages(messages)

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
    async def main():
        chat_model = HFChatModel()
        await chat_model.warmup_default()
        await chat_loop(chat_model)
    
    asyncio.run(main())
