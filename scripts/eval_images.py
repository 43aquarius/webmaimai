#!/usr/bin/env python3
"""评估候选图片：用视觉模型判断风格与适用性"""
import subprocess, json, os, glob

os.chdir('/home/z/my-project/research/dl')
files = sorted(glob.glob('*.jpg')) + sorted(glob.glob('*.png'))

results = {}
for f in files:
    out = f'/tmp/vis_{os.path.splitext(f)[0]}.json'
    try:
        subprocess.run(
            ['z-ai', 'vision', '-i', f, '-p',
             'Describe this image in one line: style (anime illustration / photo / 3D render / game screenshot), main subject, dominant colors, any watermark or large text? Format: STYLE | SUBJECT | COLORS | WM(yes/no)',
             '-o', out],
            capture_output=True, timeout=120)
        data = json.load(open(out))
        content = ''
        if isinstance(data, dict):
            choices = data.get('choices') or []
            if choices:
                content = choices[0].get('message', {}).get('content', '')
            if not content:
                content = str(data)[:150]
        results[f] = content.strip().replace('\n', ' ')
        print(f'{f} => {results[f]}')
    except Exception as e:
        print(f'{f} => ERR {e}')

json.dump(results, open('/home/z/my-project/research/eval.json', 'w'), ensure_ascii=False, indent=1)
