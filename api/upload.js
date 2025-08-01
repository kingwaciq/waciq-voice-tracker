const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const multer = require('multer');
const upload = multer();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  upload.single('voice')(req, res, async err => {
    if (err) return res.status(500).send('Upload error');

    const file = req.file;
    const uid = req.body.uid;

    if (!file || !uid) return res.status(400).send('Missing voice or uid');

    try {
      await bot.telegram.sendVoice(uid, { source: file.buffer });
      res.status(200).send('✅ Voice sent!');
    } catch (err) {
      console.error(err);
      res.status(500).send('❌ Telegram error');
    }
  });
}; 
