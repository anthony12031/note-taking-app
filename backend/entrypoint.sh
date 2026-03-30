#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1)
s.connect(('${POSTGRES_HOST:-db}', ${POSTGRES_PORT:-5432}))
s.close()
" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready."

echo "Running migrations..."
python manage.py migrate --noinput

exec "$@"
