import { sendPrompt } from "./AIFunctions.ts"
import { closeBubble, openBubble, sleep } from "./chatBubble.ts"

export class SpeechRecognitionManager {
    private recognition: any = null
    private isRecording: boolean = false
    private transcripts: string[] = []
    private currentBubbleID: string = 'bubble'

    constructor () {
        this.initializeRecognition()
    }

    private initializeRecognition = (): void => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            console.warn('SpeechRecognition API not available in this browser')
            return
        }

        this.recognition = new SpeechRecognition()
        this.recognition.lang = 'en-US'
        this.recognition.interimResults = false
        this.recognition.continuous = false

        this.recognition.onresult = (e: any) => {
            const text = e.results[0][0].transcript
            this.transcripts.push(text)
            console.log(text)
        }

        this.recognition.onerror = async () => {
            if (this.transcripts.length !== 0) {
                await closeBubble(this.currentBubbleID)
                await sleep(100)
                await openBubble(await sendPrompt(this.getFullTranscript()), this.currentBubbleID)
                
                this.transcripts = []
            }
        }

        this.recognition.onend = () => {
            if (this.isRecording) {
                this.recognition.start()
            }
        }
    }

    public toggleRecording = async (): Promise<void> => {
        if (!this.recognition) {
            console.warn('SpeechRecognition not supported')
            return
        }

        if (!this.isRecording) {
            this.currentBubbleID = await openBubble('Listening...', this.currentBubbleID)
            await sleep(100)

            this.transcripts = []
            this.isRecording = true
            this.recognition.start()
        } else {
            await closeBubble(this.currentBubbleID)

            this.isRecording = false
            this.recognition.stop()

        }
    }

    public getTranscripts = (): string[] => {
        return [...this.transcripts]
    }

    public getFullTranscript = (): string => {
        return this.transcripts.join(' ')
    }
}