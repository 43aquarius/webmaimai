// VLM 截图布局检查
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const [,, imgPath, prompt] = process.argv;
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync(imgPath).toString('base64');
  const res = await zai.chat.completions.create({
    messages: [
      { role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: prompt },
      ] as never },
    ],
    thinking: { type: 'disabled' },
  });
  console.log(res.choices[0]?.message?.content);
}
main().catch(e => { console.error(e.message); process.exit(1); });
