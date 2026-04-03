#views.py

import re, random, string
from datetime import datetime
from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.db import get_db
from api.auth_utils import (
    hash_password, check_password, create_token,
    generate_otp, store_otp, verify_otp, require_auth,
)
from api.sms import send_otp_sms

def valid_phone(p): return bool(re.match(r'^\d{10}$', p))
def valid_pw(p):    return len(p) >= 12

def gen_short_id(db):
    while True:
        sid = random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ') + ''.join(random.choices(string.digits, k=3))
        if not db.users.find_one({'short_id': sid}):
            return sid

def fmt_user(u):
    return {'id': str(u['_id']), 'name': u['name'], 'phone': u['phone'], 'short_id': u['short_id']}

def fmt_job(j):
    return {
        'id':          str(j['_id']),
        'file_name':   j.get('file_name', ''),
        'pages':       j.get('pages', 1),
        'color_mode':  j.get('color_mode', 'bw'),
        'paper_size':  j.get('paper_size', 'A4'),
        'copies':      j.get('copies', 1),
        'double_sided':j.get('double_sided', False),
        'amount':      j.get('amount', 0),
        'status':      j.get('status', 'pending'),
        'shop_id':     str(j['shop_id']) if j.get('shop_id') else None,
        'created_at':  j['created_at'].isoformat() if j.get('created_at') else None,
    }

def fmt_shop(s):
    return {
        'id':           str(s['_id']),
        'name':         s.get('name', ''),
        'address':      s.get('address', ''),
        'lat':          s.get('lat', 0),
        'lng':          s.get('lng', 0),
        'is_online':    s.get('is_online', False),
        'queue_length': s.get('queue_length', 0),
        'opens_at':     s.get('opens_at', '09:00'),
        'closes_at':    s.get('closes_at', '21:00'),
    }

# ─── Health ──────────────────────────────────────────────────────────────────
@api_view(['GET'])
def health(request):
    try:
        db = get_db()
        db.command('ping')
        mongo = 'connected'
    except Exception as e:
        mongo = str(e)
    return Response({'status': 'ok', 'mongodb': mongo})

# ─── Auth: Send OTP ──────────────────────────────────────────────────────────
@api_view(['POST'])
def send_otp(request):
    phone = request.data.get('phone', '').strip()
    if not phone:             return Response({'error': 'Phone number required'}, status=400)
    if not valid_phone(phone):return Response({'error': 'Enter a valid 10-digit phone number'}, status=400)
    otp = generate_otp()
    store_otp(phone, otp)
    send_otp_sms(phone, otp)
    return Response({'success': True, 'message': f'OTP sent to ****{phone[-4:]}'})

# ─── Auth: Register ──────────────────────────────────────────────────────────
@api_view(['POST'])
def register(request):
    phone    = request.data.get('phone', '').strip()
   
    name     = request.data.get('name', '').strip()
    password = request.data.get('password', '').strip()

    if not all([phone, name, password]):
        return Response({'error': 'All fields are required'}, status=400)
    if not valid_phone(phone): return Response({'error': 'Invalid phone number'}, status=400)
    if not valid_pw(password): return Response({'error': 'Password must be at least 12 characters'}, status=400)

    db = get_db()
    if db.users.find_one({'phone': phone}):
        return Response({'error': 'Phone already registered. Please login.'}, status=409)


    short_id = gen_short_id(db)
    result   = db.users.insert_one({
        'name': name, 'phone': phone,
        'password': hash_password(password),
        'short_id': short_id,
        'fcm_token': None,
        'created_at': datetime.utcnow(),
    })
    print(f'New user registered: {name} ({phone}), short_id: {short_id}')
    uid   = str(result.inserted_id)
    token = create_token(uid, phone)
    return Response({'success': True, 'token': token,
                     'user': {'id': uid, 'name': name, 'phone': phone, 'short_id': short_id}}, status=201)

# ─── Auth: Login ─────────────────────────────────────────────────────────────
@api_view(['POST'])
def login(request):
    phone    = request.data.get('phone', '').strip()
    password = request.data.get('password', '').strip()


    if not all([phone, password]):
        return Response({'error': 'Phone, password and OTP are required'}, status=400)
    if not valid_phone(phone): return Response({'error': 'Invalid phone number'}, status=400)

    db   = get_db()
    user = db.users.find_one({'phone': phone})
    if not user:                                 return Response({'error': 'No account with this phone'}, status=404)
    if not check_password(password, user['password']): return Response({'error': 'Wrong password'}, status=401)




    uid   = str(user['_id'])
    token = create_token(uid, phone)
    return Response({'success': True, 'token': token, 'user': fmt_user(user)})

# ─── Auth: Me ────────────────────────────────────────────────────────────────
@api_view(['GET'])
@require_auth
def me(request):
    db   = get_db()
    user = db.users.find_one({'_id': ObjectId(request.user_id)})
    if not user: return Response({'error': 'User not found'}, status=404)
    return Response(fmt_user(user))

# ─── Shops: Nearby ───────────────────────────────────────────────────────────
@api_view(['GET'])
@require_auth
def shops_nearby(request):
    db    = get_db()
    shops = list(db.shops.find({'is_online': True}))
    return Response({'shops': [fmt_shop(s) for s in shops]})

# ─── Shops: All (admin) ──────────────────────────────────────────────────────
@api_view(['POST'])
def shop_heartbeat(request):
    key = request.headers.get('X-Terminal-Key', '')
    if not key: return Response({'error': 'Terminal key required'}, status=401)
    db   = get_db()
    shop = db.shops.find_one({'terminal_key': key})
    if not shop: return Response({'error': 'Invalid terminal key'}, status=401)
    db.shops.update_one({'_id': shop['_id']}, {'$set': {'is_online': True, 'last_seen': datetime.utcnow()}})
    return Response({'ok': True})

# ─── Jobs: List ──────────────────────────────────────────────────────────────
@api_view(['GET'])
@require_auth
def jobs_list(request):
    db   = get_db()
    jobs = list(db.print_jobs.find({'user_id': request.user_id}).sort('created_at', -1).limit(50))
    return Response({'jobs': [fmt_job(j) for j in jobs]})

# ─── Jobs: Create ────────────────────────────────────────────────────────────
@api_view(['POST'])
@require_auth
def jobs_create(request):
    shop_id    = request.data.get('shop_id', '')
    file_name  = request.data.get('file_name', 'document.pdf')
    pages      = int(request.data.get('pages', 1))
    color_mode = request.data.get('color_mode', 'bw')
    paper_size = request.data.get('paper_size', 'A4')
    copies     = int(request.data.get('copies', 1))
    double_sided = bool(request.data.get('double_sided', False))

    if not shop_id: return Response({'error': 'shop_id required'}, status=400)

    RATES = {'bw': {'A4': 1.5, 'A3': 2.25, 'Letter': 1.5}, 'color': {'A4': 7, 'A3': 10.5, 'Letter': 7}}
    rate   = RATES.get(color_mode, RATES['bw']).get(paper_size, 1.5)
    amount = round(rate * pages * copies * (0.8 if double_sided else 1), 2)

    db     = get_db()
    result = db.print_jobs.insert_one({
        'user_id':     request.user_id,
        'shop_id':     shop_id,
        'file_name':   file_name,
        'pages':       pages,
        'color_mode':  color_mode,
        'paper_size':  paper_size,
        'copies':      copies,
        'double_sided':double_sided,
        'amount':      amount,
        'status':      'pending_payment',
        'created_at':  datetime.utcnow(),
    })
    job = db.print_jobs.find_one({'_id': result.inserted_id})
    return Response({'success': True, 'job': fmt_job(job)}, status=201)

# ─── Jobs: Detail ────────────────────────────────────────────────────────────
@api_view(['GET'])
@require_auth
def job_detail(request, job_id):
    db  = get_db()
    job = db.print_jobs.find_one({'_id': ObjectId(job_id), 'user_id': request.user_id})
    if not job: return Response({'error': 'Job not found'}, status=404)
    return Response(fmt_job(job))

# ─── Jobs: Cancel ────────────────────────────────────────────────────────────
@api_view(['POST'])
@require_auth
def job_cancel(request, job_id):
    db  = get_db()
    job = db.print_jobs.find_one({'_id': ObjectId(job_id), 'user_id': request.user_id})
    if not job: return Response({'error': 'Job not found'}, status=404)
    if job['status'] not in ['pending_payment', 'queued']:
        return Response({'error': 'Cannot cancel — job is already printing'}, status=409)
    db.print_jobs.update_one({'_id': ObjectId(job_id)}, {'$set': {'status': 'cancelled'}})
    return Response({'success': True})

# ─── Terminal: Search user ───────────────────────────────────────────────────
@api_view(['GET'])
def terminal_search(request, short_id):
    key = request.headers.get('X-Terminal-Key', '')
    if not key: return Response({'error': 'Terminal key required'}, status=401)
    db   = get_db()
    shop = db.shops.find_one({'terminal_key': key})
    if not shop: return Response({'error': 'Invalid terminal key'}, status=401)
    user = db.users.find_one({'short_id': short_id.upper()})
    if not user: return Response({'error': f'No user with ID {short_id.upper()}'}, status=404)
    jobs = list(db.print_jobs.find({'user_id': str(user['_id']), 'shop_id': str(shop['_id']), 'status': 'ready'}))
    return Response({'user': fmt_user(user), 'ready_jobs': [fmt_job(j) for j in jobs]})

# ─── Terminal: Verify code ───────────────────────────────────────────────────
@api_view(['POST'])
def terminal_verify(request):
    key  = request.headers.get('X-Terminal-Key', '')
    if not key: return Response({'error': 'Terminal key required'}, status=401)
    db   = get_db()
    shop = db.shops.find_one({'terminal_key': key})
    if not shop: return Response({'error': 'Invalid terminal key'}, status=401)

    job_id = request.data.get('job_id', '')
    code   = request.data.get('code', '')
    job    = db.print_jobs.find_one({'_id': ObjectId(job_id)})
    if not job: return Response({'error': 'Job not found'}, status=404)

    user = db.users.find_one({'_id': ObjectId(job['user_id'])})
    if not user: return Response({'error': 'User not found'}, status=404)

    if user.get('pickup_code') != code:
        return Response({'error': 'Wrong code'}, status=400)

    db.print_jobs.update_one({'_id': ObjectId(job_id)}, {'$set': {'status': 'collected', 'collected_at': datetime.utcnow()}})
    return Response({'success': True, 'message': f'Release printout to {user["name"]}'})

# ─── Cost calc ───────────────────────────────────────────────────────────────
@api_view(['POST'])
@require_auth
def calculate_cost(request):
    pages        = int(request.data.get('pages', 1))
    color_mode   = request.data.get('color_mode', 'bw')
    paper_size   = request.data.get('paper_size', 'A4')
    copies       = int(request.data.get('copies', 1))
    double_sided = bool(request.data.get('double_sided', False))
    RATES = {'bw': {'A4': 1.5, 'A3': 2.25, 'Letter': 1.5}, 'color': {'A4': 7, 'A3': 10.5, 'Letter': 7}}
    rate   = RATES.get(color_mode, RATES['bw']).get(paper_size, 1.5)
    amount = round(rate * pages * copies * (0.8 if double_sided else 1), 2)
    return Response({'amount': amount, 'rate': rate, 'pages': pages, 'copies': copies})
