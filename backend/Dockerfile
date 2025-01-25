FROM python:3.12 AS builder

WORKDIR /app
RUN pip install poetry
RUN poetry config virtualenvs.in-project true

COPY pyproject.toml poetry.lock README.md ./
RUN poetry install --no-root

COPY . .

FROM python:3.12-slim

WORKDIR /app
COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:$PATH"
ENV PORT=8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
