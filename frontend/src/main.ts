import { initializeDuck } from './duck.ts'

console.log('Duck window loaded!')

const duck = document.getElementById('duck') as HTMLElement

if (!duck) {
    console.error('Duck element not found!')
} else {
    console.log('Duck found, enabling drag + speech recognition')
    initializeDuck(duck)
}

// import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

// const win = new WebviewWindow('duck-popup', {
//     url: 'popup.html',
//     width: 400,
//     height: 300,
//     x: 200,
//     y: 200,
// })
