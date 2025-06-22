FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /code /var/log/supervisor
WORKDIR /code

COPY ./django /code/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY supervisord/default.conf /etc/supervisor/conf.d/supervisord.conf

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["/usr/bin/supervisord"]