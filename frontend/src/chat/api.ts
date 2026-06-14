import { invoke } from '@tauri-apps/api/core'

export const sendPrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
        throw new Error('Prompt cannot be empty')
    }
    
    try {
        const response = await invoke<string>('run_chat_command', { prompt })
        return response
    } catch (err) {
        console.error('run_chat_command failed:', err)
        return "Hmm, I couldn't reach my brain just now. Mind trying again?"
    }
}