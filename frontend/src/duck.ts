import { invoke } from "@tauri-apps/api/core"
import { AudioRecorder } from "./audio/recorder"
import { sendPrompt } from "./chat/api"
import { openBubble, closeBubble } from "./chat/bubble"

// Encode bytes as base64 for the IPC boundary. Chunked to avoid blowing the
// call-stack with String.fromCharCode(...) on large buffers.
const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = ""
    const CHUNK = 0x8000
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
    }
    return btoa(binary)
}

export const initializeDuck = (duck: HTMLElement): void => {
    duck.setAttribute('data-tauri-drag-region', '')

    const audioRecorder = new AudioRecorder()

    // Guard so a new utterance can't start a second transcribe/chat round-trip
    // while the previous one is still in flight (turns would otherwise race and
    // stomp each other's bubbles).
    let processing = false

    audioRecorder.onSilence = async () => {
        if (processing) return

        // Capture the blob immediately; continuous listening may null it out
        // (and start a fresh recording) before the awaits below resolve.
        const blob = audioRecorder.audioBlob
        if (!blob) return

        processing = true
        try {
            const arrayBuffer = await blob.arrayBuffer()
            const audioBase64 = uint8ToBase64(new Uint8Array(arrayBuffer))

            const transcription = await invoke<string>('transcribe_audio', { audioBase64 })
            if (!transcription.trim()) return

            await openBubble("Thinking...")
            const response = await sendPrompt(transcription)

            await openBubble(response)
        } catch (err) {
            console.error('Turn failed:', err)
            await openBubble("Sorry, something went wrong. Try again.")
        } finally {
            processing = false
        }
    }

    duck.addEventListener('dblclick', async () => {
        await audioRecorder.toggleListening()

        if (audioRecorder.isRecording) {
            duck.classList.add('listening')
            await openBubble("Listening...")
        } else {
            duck.classList.remove('listening')
            await closeBubble('bubble')
        }
    })
}
