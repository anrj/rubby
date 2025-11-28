import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export const openWin = () => {
    const win = new WebviewWindow('settings', {
        url: '',
        width: 100,
        height: 100,
        x: 300,
        y: 300,
        decorations: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        hiddenTitle: true,
        shadow: false,
    })
    
    win.once('tauri://created', () => console.log('Chat bubble opened'))
    win.once('tauri://error', (e) => console.error(e))
}