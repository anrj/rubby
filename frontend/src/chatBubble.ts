import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { PhysicalPosition } from '@tauri-apps/api/dpi'

const openWin = (url: string, width: number = 300, height: number = 200, initX: number = 500, initY: number = 500) => {
    const win = new WebviewWindow('bubble', {
        url,
        width,
        height,
        x: initX,
        y: initY,
        decorations: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        hiddenTitle: true,
        shadow: false,
        skipTaskbar: true,
    })

    win.once('tauri://error', (e) => {
        console.error(e)
        return
    })

    return win
}

export const openBubble = async () => {
    const mainWindow = getCurrentWebviewWindow()

    const win = openWin('/chat-bubble.html')
    await win.once('tauri://created', () => {})

    const offsetX = 250
    const offsetY = -60

    const currentPos = await mainWindow.outerPosition()
    await win.setPosition(new PhysicalPosition(currentPos.x + offsetX, currentPos.y + offsetY))

    mainWindow.listen('tauri://move', async (event) => {
        const { x, y } = event.payload as { x: number; y: number }
        await win.setPosition(new PhysicalPosition(x + offsetX, y + offsetY))
    })
}
