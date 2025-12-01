import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { PhysicalPosition } from '@tauri-apps/api/dpi'
import type { UnlistenFn } from '@tauri-apps/api/event'

const moveListeners = new Map<string, UnlistenFn>()

const openWin = (id: string, url: string, width: number = 300, height: number = 200, initX: number = 500, initY: number = 500) => {
    const win = new WebviewWindow(id, {
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

export const openBubble = async (text: string = '', id: string = 'bubble') => {
    const existingListener = moveListeners.get(id)
    if (existingListener) {
        existingListener()
        moveListeners.delete(id)
    }

    const encoded = encodeURIComponent(text)
    const win = openWin(id, `/chat-bubble.html?text=${encoded}`)

    await win.once('tauri://created', () => {})

    const mainWindow = getCurrentWebviewWindow()
    const offsetX = 250
    const offsetY = -60

    const currentPos = await mainWindow.outerPosition()
    await win.setPosition(new PhysicalPosition(currentPos.x + offsetX, currentPos.y + offsetY))

    const unlisten = await mainWindow.listen('tauri://move', async (event) => {
        const { x, y } = event.payload as {x: number, y: number}
        const bubbleWin = await WebviewWindow.getByLabel(id)
        if (bubbleWin) {
            await bubbleWin.setPosition(new PhysicalPosition(x + offsetX, y + offsetY))
        }
    })
    
    moveListeners.set(id, unlisten)

    return id
}

export const closeBubble = async (id: string) => {
    const listener = moveListeners.get(id)
    if (listener) {
        listener()
        moveListeners.delete(id)
    }
    
    const win = await WebviewWindow.getByLabel(id)
    if (win) await win.close()
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))