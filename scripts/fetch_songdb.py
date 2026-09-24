#!/usr/bin/env python3
"""尝试从多个公开数据源抓取真实舞萌曲目数据库"""
import json, urllib.request, ssl, sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def try_fetch(url, name):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
            data = r.read()
            print(f"[OK] {name}: {len(data)} bytes from {url}")
            return data
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return None

SOURCES = [
    ("diving-fish-jp", "https://www.diving-fish.com/api/maimaidxprober/music_data"),
    ("diving-fish-cn", "https://www.diving-fish.com/api/maimaidxprober/music_data"),
    ("maimaidx-gh", "https://raw.githubusercontent.com/YukinoManago/maimai-data/master/maimai_songs.json"),
]

for name, url in SOURCES:
    data = try_fetch(url, name)
    if data:
        try:
            j = json.loads(data)
            fn = f"/home/z/my-project/research/songdb_{name}.json"
            with open(fn, 'wb') as f:
                f.write(data)
            if isinstance(j, list):
                print(f"  -> list of {len(j)}; sample keys: {list(j[0].keys()) if j else 'empty'}")
                print(f"  sample: {json.dumps(j[0], ensure_ascii=False)[:600]}")
            elif isinstance(j, dict):
                print(f"  -> dict keys: {list(j.keys())[:20]}")
            sys.exit(0)
        except Exception as e:
            print(f"  parse fail: {e}")
print("ALL SOURCES FAILED")
