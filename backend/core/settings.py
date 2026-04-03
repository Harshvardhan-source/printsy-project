import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-r6-h00_g4!pl4txejr5#$@zsg$p8bs^2yqs6rjt_v4-lm9xir2'
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

JWT_SECRET         = os.getenv('JWT_SECRET', 'eae7e1171cd9a8ce53d2b174ea3f26fab6e94d81a6cea84207f01f5a28a2e69a')
JWT_EXPIRY_DAYS    = int(os.getenv('JWT_EXPIRY_DAYS', '30'))
OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', '10'))
OTP_CONSOLE_MODE   = os.getenv('OTP_CONSOLE_MODE', 'True') == 'True'
TWILIO_ACCOUNT_SID  = os.getenv('TWILIO_ACCOUNT_SID', 'AC7ac532c767746b4cb2bb2c7304586297')
TWILIO_AUTH_TOKEN   = os.getenv('TWILIO_AUTH_TOKEN', '690a10253cf571a638bf104f3f0954f4')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')

MONGO_URI     = os.getenv('MONGO_URI', 'mongodb+srv://ravindraacharya0512:ZKWbloCMIzsi3xyV@cluster0.ynaiaut.mongodb.net/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'printshop')

MIGRATION_MODULES = {
    'api': None,
}