const duck = document.getElementById('duck')
if (!duck) throw new Error("Duck couldn't be loaded")

const recordAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const formData = new FormData()
        formData.append('file', blob, 'voice.wav')

        const res = await fetch('/transcribe', { method: 'POST', body: formData })
        const data = await res.json()
        console.log('Transcription:', data.text)
    }

    mediaRecorder.start()

    setTimeout(() => mediaRecorder.stop(), 5000)
}

duck.addEventListener('click', (e) => {
    if (e.ctrlKey) recordAudio()
})
