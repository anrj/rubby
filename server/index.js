import express from 'express'
import multer from 'multer'
import fs from 'fs'
import { Whisper } from 'whisper-node'

const app = express()
const upload = multer({ dest: 'uploads/' })

const modelPath = 'models/ggml-small.en.bin'
const whisper = new Whisper(modelPath)

app.post('/transcribe', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const audioData = fs.readFileSync(req.file.path)
    const result = await whisper.transcribe(audioData)
    fs.unlinkSync(req.file.path)
    res.json({ text: result.text })
})

app.listen(5000, () => console.log('Server running on port 5000'))
