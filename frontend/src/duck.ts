import { invoke } from "@tauri-apps/api/core"
import { AudioRecorder } from "./voiceRecorder"
import { sendPrompt } from "./AIFunctions"
import { openBubble, closeBubble } from "./chatBubble"

export const initializeDuck = (duck: HTMLElement): void => {
    duck.setAttribute('data-tauri-drag-region', '')
    

    // const audioRecorder = new AudioRecorder((isRecording) => {
    //     if (isRecording) {
    //         duck.classList.add('listening')
    //     } else {
    //         duck.classList.remove('listening')
    //     }
    // })
    
    const audioRecorder = new AudioRecorder()
    audioRecorder.onSilence = async () => {
        const arrayBuffer = await audioRecorder.audioBlob!.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const audioData = Array.from(uint8Array)

        const transcription = await invoke<string>('transcribe_audio', { audioData })
        const response = await sendPrompt(transcription)
        
        await openBubble(response)
    }

    duck.addEventListener('dblclick', async () => {
        console.log('toggle listening')
        await audioRecorder.toggleListening()
        
        if (audioRecorder.isRecording) {
            duck.classList.add('listening')
            await openBubble("Listening...")
        } else {
            duck.classList.remove('listening')
            await closeBubble('bubble')
        }
    })

    duck.addEventListener('drag', () => {
        console.log('Being dragged')
    })
}
