#!/bin/bash
# 评估候选图片：风格/内容/水印/适用性
cd /home/z/my-project/research/dl
for f in *.jpg *.png; do
  [ -f "$f" ] || continue
  resp=$(z-ai vision -i "$f" -p "Describe this image in one line: style (anime illustration / photo / 3D render / screenshot), main subject, colors, and whether it has any watermark or text. Format: STYLE|SUBJECT|COLORS|WATERMARK(yes/no)" 2>/dev/null | tail -5)
  echo "$f => $resp"
done
