#!/bin/bash
set -e

echo "Running Django setup..."
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput || true


# Hand over to CMD (i.e. supervisord)
exec "$@"
