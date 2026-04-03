from django.conf import settings

def send_otp_sms(phone, otp):
    if settings.OTP_CONSOLE_MODE:
        print(f'\n{"="*50}\n  OTP for {phone}: {otp}\n  (Console mode)\n{"="*50}\n')
        return True
    try:
        from twilio.rest import Client
        Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN).messages.create(
            body=f'Your PrintShop OTP: {otp}. Valid {settings.OTP_EXPIRY_MINUTES} mins.',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=f'+91{phone}',
        )
        return True
    except Exception as e:
        print(f'SMS error: {e}')
        return False
