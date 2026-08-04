# syntax=docker/dockerfile:1.7
FROM python:3.11-slim

WORKDIR /app/server

# Устанавливаем зависимости
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходники сервера
COPY server/ ./

# Переменные окружения по умолчанию
ENV PYTHONUNBUFFERED=1

EXPOSE 8006
VOLUME ["/data"]

CMD ["python", "app.py"]
