#!/usr/bin/env python3
"""
单文件版构建脚本：
1. bun build 打包 standalone-entry.ts → app.js
2. 封面/背景压缩为 base64
3. 组装最终 webmaimai.html（CSS + 资源 + JS 全内嵌）
"""
import base64
import io
import json
import os
import subprocess
import sys

ROOT = '/home/z/my-project'
OUT = f'{ROOT}/download/webmaimai.html'
TMP_JS = f'{ROOT}/.next/standalone-app.js'

SONG_IDS = [
    'pandora', 'tenka', 'caliburne', 'fakeface', 'jinglebell', 'yumehibana',
    'phony', 'goodbye', 'kamipoi', 'drd', 'alien', 'teo', 'android', 'happysyn',
    'saikyo', 'solid', 'tengoku', 'sacredruin', 'okorai', 'hotlimit',
]


def img_to_data_uri(path: str, max_px: int, quality: int, fmt='JPEG') -> str:
    from PIL import Image
    im = Image.open(path)
    if fmt == 'JPEG' and im.mode in ('RGBA', 'P', 'LA'):
        bg = Image.new('RGB', im.size, (10, 14, 34))
        if im.mode != 'RGBA':
            im = im.convert('RGBA')
        bg.paste(im, mask=im.split()[-1])
        im = bg
    elif fmt == 'JPEG':
        im = im.convert('RGB')
    w, h = im.size
    scale = min(1.0, max_px / max(w, h))
    if scale < 1.0:
        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format=fmt, quality=quality, optimize=True)
    data = buf.getvalue()
    return f'data:image/{fmt.lower()};base64,{base64.b64encode(data).decode()}', len(data)


def main():
    # 1. 打包 JS
    print('[1/4] bun build ...')
    r = subprocess.run(
        ['bun', 'build', f'{ROOT}/scripts/standalone-entry.ts', '--bundle', '--minify',
         '--outfile', TMP_JS, '--define', 'process.env.NODE_ENV="production"'],
        capture_output=True, text=True, cwd=ROOT)
    if r.returncode != 0:
        print(r.stdout[-3000:])
        print(r.stderr[-3000:])
        sys.exit('bun build failed')
    app_js = open(TMP_JS).read()
    print(f'  app.js: {len(app_js)/1024:.0f} KB')

    # 2. 压缩资源
    print('[2/4] compressing assets ...')
    jackets = {}
    total = 0
    for sid in SONG_IDS:
        uri, n = img_to_data_uri(f'{ROOT}/public/assets/jackets/{sid}.png', 176, 78)
        jackets[sid] = uri
        total += n
    assets = {}
    uri, n = img_to_data_uri(f'{ROOT}/public/assets/bg/character_dj.jpg', 720, 55)
    assets['character'] = uri
    total += n
    uri, n = img_to_data_uri(f'{ROOT}/public/assets/bg/stage_wide.png', 1000, 50)
    assets['stage_wide'] = uri
    total += n
    print(f'  assets: {total/1024:.0f} KB (20 jackets + 2 bg)')

    # 3. CSS
    css = open(f'{ROOT}/scripts/standalone.css').read()

    # 4. 组装 HTML
    print('[3/4] assembling html ...')
    inject = (
        f'window.__JACKETS__={json.dumps(jackets)};'
        f'window.__ASSETS__={json.dumps(assets)};'
    )
    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>舞萌 Web | maimai Web Player</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<div id="app"></div>
<script>{inject}</script>
<script>
{app_js}
</script>
</body>
</html>'''
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w').write(html)
    size = os.path.getsize(OUT)
    print(f'[4/4] done → {OUT} ({size/1024:.0f} KB)')


if __name__ == '__main__':
    main()
