import os
import json
import sys
from dotenv import load_dotenv
import httpx
load_dotenv()
model = os.getenv('GEMINI_MODEL','gemini-2.5-flash')
keys = [k.strip() for k in os.getenv('GEMINI_API_KEYS','').split(',') if k.strip()]
key = keys[0] if keys else None
prompt = 'Hello'
system = 'You are a helpful expert assistant.'
print('MODEL=', model)
print('KEY=', repr(key))
url = f'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateMessage?key={key}'
payload = {'messages': [{'author': 'user', 'content': {'text': f"{system}\n\n{prompt}"}}]}
print('URL=', url)
print('PAYLOAD=', json.dumps(payload, indent=2))
try:
    r = httpx.post(url, json=payload, timeout=30)
    print('STATUS=', r.status_code)
    print('TEXT=', r.text)
except Exception as e:
    print('EXCEPTION=', type(e).__name__, e)
    sys.exit(1)
