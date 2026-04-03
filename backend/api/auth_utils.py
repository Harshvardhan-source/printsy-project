import jwt, bcrypt, random, string
from datetime import datetime, timedelta
from django.conf import settings
from functools import wraps
from rest_framework.response import Response
from api.db import get_db

def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def check_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())

def create_token(user_id, phone):
    return jwt.encode({
        'user_id': user_id, 'phone': phone,
        'exp': datetime.utcnow() + timedelta(days=settings.JWT_EXPIRY_DAYS),
    }, settings.JWT_SECRET, algorithm='HS256')

def decode_token(token):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def store_otp(phone):
    db = get_db()
    db.otps.delete_many({'phone': phone})
    db.otps.insert_one({
        'phone': phone, 'verified': False, 'attempts': 0,
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
    })

def verify_otp(phone, otp):
    db  = get_db()
    rec = db.otps.find_one({'phone': phone, 'verified': False})
    if not rec:               return False, 'No OTP found. Request a new one.'
    if rec['expires_at'] < datetime.utcnow(): return False, 'OTP expired.'
    if rec['attempts'] >= 3:  return False, 'Too many attempts. Request new OTP.'
    if rec['otp'] != otp:
        db.otps.update_one({'_id': rec['_id']}, {'$inc': {'attempts': 1}})
        return False, f'Wrong OTP. {2 - rec["attempts"]} attempts left.'
    db.otps.update_one({'_id': rec['_id']}, {'$set': {'verified': True}})
    return True, 'OK'

def require_auth(fn):
    @wraps(fn)
    def wrapper(request, *args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=401)
        try:
            p = decode_token(auth.split(' ')[1])
            request.user_id = p['user_id']
            request.phone   = p['phone']
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Session expired. Please login again.'}, status=401)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=401)
        return fn(request, *args, **kwargs)
    return wrapper
