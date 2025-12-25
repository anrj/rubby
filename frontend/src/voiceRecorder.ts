type StateChangeCallback = (isRecording: boolean) => void
type StatusChangeCallback = (status: string) => void

// Defaults added to make the class self-contained
const ANALYSER_CONFIG = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
}

const MEDIA_RECORDER_OPTIONS = {
    mimeType: 'audio/webm',
}

const AUDIO_CONFIG = {
    SILENCE_THRESHOLD: -50,
    SILENCE_DURATION: 1500,
    MIN_RECORDING_TIME: 750,
}

export class AudioRecorder {
    // Public Read-only State
    public isRecording: boolean = false
    public status: string = 'Ready'

    // The recorded audio file
    private _audioBlob: Blob | null = null

    // Callbacks for UI updates
    private onStateChange: StateChangeCallback | null
    private onStatusChange: StatusChangeCallback | null

    // Internal Resources
    private mediaRecorder: MediaRecorder | null = null
    private chunks: Blob[] = []
    private audioContext: AudioContext | null = null
    private analyser: AnalyserNode | null = null
    private silenceTimer: ReturnType<typeof setTimeout> | null = null
    private animationFrame: number | null = null
    private recordingStartTime: number = 0

    // Continuous listening mode
    private keepListening: boolean = false
    // Silence handler (settable from outside)
    public onSilence: (() => Promise<void>) | null = null
    // Queue for onSilence callbacks to ensure audioBlob is ready
    private onSilenceQueue: Array<() => void> = []

    constructor(onStateChange?: StateChangeCallback, onStatusChange?: StatusChangeCallback) {
        this.onStateChange = onStateChange || null
        this.onStatusChange = onStatusChange || null

        this.detectSilence = this.detectSilence.bind(this)
        this.stopRecording = this.stopRecording.bind(this)
        this.startRecording = this.startRecording.bind(this)
        this.toggleRecording = this.toggleRecording.bind(this)
        this.toggleListening = this.toggleListening.bind(this)
    }

    public get audioBlob(): Blob | null {
        return this._audioBlob
    }

    private setStatus(newStatus: string) {
        this.status = newStatus
        if (this.onStatusChange) this.onStatusChange(newStatus)
    }

    private setIsRecording(isRec: boolean) {
        this.isRecording = isRec
        if (this.onStateChange) this.onStateChange(isRec)
    }

    public stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop()
            this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
        if (this.silenceTimer) clearTimeout(this.silenceTimer)

        this.setIsRecording(false)
        this.setStatus('Ready')
    }

    // Stop and immediately start again (for continuous listening)
    private async restartRecording() {
        this.stopRecording()
        await this.startRecording(true)
    }

    private detectSilence() {
        if (!this.analyser) return

        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Float32Array(bufferLength)
        this.analyser.getFloatFrequencyData(dataArray)

        let maxVolume = -Infinity
        for (let i = 0; i < bufferLength; i++) {
            if (dataArray[i] > maxVolume) maxVolume = dataArray[i]
        }

        const recordingTime = Date.now() - this.recordingStartTime

        // Don't stop for silence if we haven't reached min recording time
        if (recordingTime < AUDIO_CONFIG.MIN_RECORDING_TIME) {
            this.animationFrame = requestAnimationFrame(this.detectSilence)
            return
        }

        if (maxVolume < AUDIO_CONFIG.SILENCE_THRESHOLD) {
            if (!this.silenceTimer) {
                this.silenceTimer = setTimeout(() => {
                    // Instead of calling onSilence directly, queue it to be called after audioBlob is set
                    if (this.onSilence) {
                        this.onSilenceQueue.push(() => { this.onSilence && this.onSilence() })
                    }
                    if (this.keepListening) {
                        this.restartRecording()
                    } else {
                        this.stopRecording()
                    }
                }, AUDIO_CONFIG.SILENCE_DURATION)
            }
        } else {
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer)
                this.silenceTimer = null
            }
        }

        this.animationFrame = requestAnimationFrame(this.detectSilence)
    }

    public async startRecording(keepListening: boolean = false) {
        if (this.isRecording) return

        // Reset previous recording data
        this._audioBlob = null
        this.chunks = []
        this.keepListening = keepListening

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            const context = new AudioContext()
            if (context.state === 'suspended') await context.resume()

            const source = context.createMediaStreamSource(stream)
            const analyser = context.createAnalyser()
            analyser.fftSize = ANALYSER_CONFIG.fftSize
            analyser.smoothingTimeConstant = ANALYSER_CONFIG.smoothingTimeConstant
            source.connect(analyser)

            this.audioContext = context
            this.analyser = analyser

            // Fallback for browsers that don't support specified mimeType, or use default
            let options = MEDIA_RECORDER_OPTIONS
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                 options = { mimeType: '' } // Let browser choose default
            }

            const mediaRecorder = new MediaRecorder(stream, options)
            this.mediaRecorder = mediaRecorder

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.chunks, { type: 'audio/webm' })
                // Store the blob so it can be accessed via the getter
                this._audioBlob = audioBlob
                this.setStatus('Recording Complete')
                // Log the audioBlob when recording is over
                console.log('Audio Blob:', audioBlob)
                // Call any queued onSilence callbacks now that audioBlob is ready
                while (this.onSilenceQueue.length > 0) {
                    const cb = this.onSilenceQueue.shift()
                    if (cb) cb()
                }
                // Optional: You might want to trigger a custom callback here 
                // to let the parent know the blob is ready.
            }

            mediaRecorder.start()
            this.setIsRecording(true)
            this.setStatus('Recording...')
            this.recordingStartTime = Date.now()
            this.detectSilence()
        } catch (err) {
            console.error('Mic Error:', err)
            this.setStatus('Mic Access Denied')
        }
    }

    public toggleRecording() {
        if (this.isRecording) {
            this.stopRecording()
        } else {
            this.startRecording()
        }
    }

    // Toggle continuous listening mode
    public async toggleListening() {
        if (this.isRecording && this.keepListening) {
            this.keepListening = false
            this.stopRecording()
        } else if (!this.isRecording) {
            await this.startRecording(true)
        }
    }
}