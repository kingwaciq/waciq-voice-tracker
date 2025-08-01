let mediaRecorder;
let audioChunks = [];

const uid = new URLSearchParams(window.location.search).get('uid') || '123456789'; // fallback UID

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('voice', audioBlob);
        formData.append('uid', uid);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          const text = await res.text();
          document.getElementById('status').innerText = '✅ واستول شو: ' + text;
        } catch (err) {
          document.getElementById('status').innerText = '❌ خطا: ' + err.message;
        }
      };

      mediaRecorder.start();
      document.getElementById('status').innerText = '🎙️ ثبت روان دی...';
    })
    .catch(err => {
      document.getElementById('status').innerText = '❌ اجازه نشته';
      console.error('Mic error:', err);
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    document.getElementById('status').innerText = '⏹️ بند شو، لیږل کیږي...';
  }
} 
