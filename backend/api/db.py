from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db = _client[settings.MONGO_DB_NAME]
        _db.users.create_index('phone', unique=True)
        _db.otps.create_index('phone')
        _db.otps.create_index('expires_at', expireAfterSeconds=0)
        _db.shops.create_index([('lat', 1), ('lng', 1)])
        _db.print_jobs.create_index('user_id')
        _db.print_jobs.create_index('shop_id')
    return _db
