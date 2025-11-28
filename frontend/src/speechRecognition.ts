export class SpeechRecognitionManager {
    private recognition: any = null
    private isRecording: boolean = false
    private transcripts: string[] = []

    private quietCounter: number = 0

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
            console.log(e)
            const text = e.results[0][0].transcript
            this.transcripts.push(text)
            console.log(text)

            if (this.quietCounter !== 0) this.quietCounter = 0
        }

        this.recognition.onerror = () => {
            this.quietCounter ++
            if (this.quietCounter === 1) console.log('=== FETCH LLM ===')
        }

        this.recognition.onend = () => {
            this.quietCounter = 0
            if (this.isRecording) {
                this.recognition.start()
            }
        }
    }

    public toggleRecording = (): void => {
        if (!this.recognition) {
            console.warn('SpeechRecognition not supported')
            return
        }

        if (!this.isRecording) {
            console.log('Recording started (ctrl+click again to stop)')
            this.transcripts = []
            this.isRecording = true
            this.recognition.start()
        } else {
            console.log('Recording stopped, finalizing…')
            this.isRecording = false
            this.recognition.stop()

            const fullText = this.transcripts.join(' ')
            console.log(fullText)
        }
    }

    public getTranscripts = (): string[] => {
        return [...this.transcripts]
    }

    public getFullTranscript = (): string => {
        return this.transcripts.join(' ')
    }
}