import { invoke } from '@tauri-apps/api/core'

interface ChatResponse {
    choices: Array<{
        message: {
            content: string,
            role: string
        }
    }>
}

export const sendPrompt = async (prompt: string) => {
    try {
        const response = await invoke<ChatResponse>('run_chat_command', { prompt })
        console.log('🦆:', response.choices[0].message.content)
    } catch (err) {
        console.error(err)
    }
}