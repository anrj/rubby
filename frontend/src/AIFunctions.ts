import { invoke } from '@tauri-apps/api/core'

export const sendPrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
        throw new Error('Prompt cannot be empty')
    }
    
    try {
        const response = await invoke<string>('run_chat_command', { prompt })
        return response
    } catch (err) {
        console.error(err)
        return 'ERROR SENDING PROMPT OR GETTING RESPONSE'
    }
}