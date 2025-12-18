import { SpeechRecognitionManager } from './speechRecognition.ts'

export const initializeDuck = (duck: HTMLElement): void => {
    duck.setAttribute('data-tauri-drag-region', '')
    const speechManager = new SpeechRecognitionManager()

    duck.addEventListener('dblclick', () => {
        speechManager.toggleRecording()
    })

    duck.addEventListener('drag', () => {
        console.log('Being dragged')
    })
}