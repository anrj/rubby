import { invoke } from "@tauri-apps/api/core"
import { AudioRecorder } from "./voiceRecorder"
import { sendPrompt } from "./AIFunctions"

export const initializeDuck = (duck: HTMLElement): void => {
    duck.setAttribute('data-tauri-drag-region', '')

    const audioRecorder = new AudioRecorder()
    audioRecorder.onSilence = async () => {
        const arrayBuffer = await audioRecorder.audioBlob!.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const audioData = Array.from(uint8Array)

        const transcription = await invoke<string>('transcribe_audio', { audioData })
        const response = await sendPrompt(transcription)
        
        console.log(response) // TODO: Change this with bubble
    }

    duck.addEventListener('dblclick', async () => {
        console.log('toggle listening')
        await audioRecorder.toggleListening()
    })

    duck.addEventListener('drag', () => {
        console.log('Being dragged')
    })
}