import { initializeDuck } from './duck.ts'

console.log('Duck window loaded!')

const duck = document.getElementById('duck') as HTMLElement

if (!duck) {
    console.error('Duck element not found!')
} else {
    console.log('Duck found, enabling drag + speech recognition')
    initializeDuck(duck)
}