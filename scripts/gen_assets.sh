#!/bin/bash
# 生成舞萌风格歌曲封面 + 舞台背景
set -u
OUT=/home/z/my-project/public/assets
mkdir -p "$OUT/jackets" "$OUT/bg"

gen() {
  local prompt="$1" file="$2" size="${3:-1024x1024}"
  if [ -s "$file" ]; then echo "SKIP $file (exists)"; return; fi
  for i in 1 2 3; do
    z-ai image -p "$prompt" -o "$file" -s "$size" >/dev/null 2>&1
    if [ -s "$file" ]; then echo "OK  $(basename $file) ($(du -h "$file" | cut -f1))"; return; fi
    echo "retry $i for $(basename $file)"; sleep 5
  done
  echo "FAIL $(basename $file)"
}

# 5 首原创曲目封面（音游专辑封面风格，无文字避免乱码）
gen "Anime rhythm game album cover art, cheerful girl with long pink twin-tails spinning among swirling cherry blossom petals, spiral motion composition, soft pink white and rose-gold palette, glitter sparkles, detailed anime illustration, vibrant, no text, no letters" "$OUT/jackets/sakura.png" &
P1=$!
gen "Anime rhythm game album cover art, energetic girl with short cyan hair in white racing outfit surfing on a huge electric blue water wave, dynamic speed lines, splash droplets, cyan white and yellow palette, glossy detailed anime illustration, no text, no letters" "$OUT/jackets/splash.png" &
P2=$!
wait $P1 $P2
gen "Anime rhythm game album cover art, dreamy girl with long purple hair and headphones floating in retro space with stars and vinyl records, 80s city pop aesthetic, purple and gold palette, soft glow, detailed anime illustration, no text, no letters" "$OUT/jackets/asterisk.png" &
P3=$!
gen "Anime rhythm game album cover art, fierce girl with crimson hair and red eyes standing on top of a speeding futuristic bullet train at night, red lightning and embers, red black and orange palette, dramatic wind, detailed anime illustration, no text, no letters" "$OUT/jackets/orbit.png" &
P4=$!
wait $P3 $P4
gen "Anime rhythm game album cover art, mysterious elegant girl with silver hair and golden hexagonal halo floating in deep blue cosmic void, glowing hexagon grid patterns, gold and navy palette, stars, detailed anime illustration, no text, no letters" "$OUT/jackets/hexa.png" &
P5=$!
gen "Wide anime background art, futuristic arcade concert hall stage with a giant glowing circular screen, neon purple cyan and pink lighting, light beams, empty stage floor with reflections, moody detailed anime scenery, no people, no text" "$OUT/bg/stage_wide.png" 1440x720 &
P6=$!
wait $P5 $P6

echo "=== DONE ==="
ls -la "$OUT/jackets" "$OUT/bg"
