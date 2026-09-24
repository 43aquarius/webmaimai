#!/usr/bin/env python3
"""重试评估 stage / maimai 图片"""
import subprocess, json, os, glob, time

os.chdir('/home/z/my-project/research/dl')
files = sorted(glob.glob('stage_*.jpg')) + ['maimai_1.png', 'maimai_5.png']

results = {}
for f in files:
    out = f'/tmp/vis2_{os.path.splitext(f)[0]}.json'
    for attempt in range(2):
        try:
            p = subprocess.run(
                ['z-ai', 'vision', '-i', f, '-p',
                 'One line: style (anime illustration / photo / 3D render / game screenshot), main subject, dominant colors, watermark or large text? Format: STYLE | SUBJECT | COLORS | WM(yes/no)',
                 '-o', out],
                capture_output=True, timeout=120)
            data = json.load(open(out))
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            if content:
                results[f] = content.strip().replace('\n', ' ')
                print(f'{f} => {results[f]}')
                break
        except Exception as e:
            if attempt == 0:
                time.sleep(3)
            else:
                print(f'{f} => ERR {e}')
    time.sleep(1)

json.dump(results, open('/home/z/my-project/research/eval2.json', 'w'), ensure_ascii=False, indent=1)
