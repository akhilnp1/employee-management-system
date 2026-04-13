#!/bin/bash
echo "Setting up Django backend..."
cd "$(dirname "$0")"

python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

echo ""
echo "Creating superuser (optional)..."
echo "Run: python manage.py createsuperuser"
echo ""
echo "Start server: python manage.py runserver"
