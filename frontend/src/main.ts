import { initializeDuck } from './duck.ts'
import { openBubble } from './chatBubble.ts'

const duck = document.getElementById('duck') as HTMLElement
if (!duck) {
    console.error('Duck element not found!')
} else {
    console.log('Duck found, enabling drag + speech recognition')
    initializeDuck(duck)
    openBubble()
}
