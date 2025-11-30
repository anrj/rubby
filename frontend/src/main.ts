import { openBubble } from './chatBubble.ts'
import { initializeDuck } from './duck.ts'

const duck = document.getElementById('duck') as HTMLElement
if (!duck) {
    alert('Duck element not found!')
} else {
    initializeDuck(duck)
    openBubble()
}
