import b4a from 'b4a'
import readline from 'bare-readline'
import tty from 'bare-tty'
import process from 'bare-process'
import { loadPeer, getPeerConstants, sendMessage } from './peerLoad'
import { createAuction, joinAuction, highestBid, closeAuction } from './auction'

const userInput = Pear.config.args[0]

await loadPeer(userInput)

const { swarm, store } = getPeerConstants();

swarm.on('connection', peer => {
    store.replicate(peer)
    const name = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6)    //Client#2 makes bid for Client#1->Pic#1 with 75 USDt

    peer.on('data', message => {

        if (isAlphanumeric(message)) {
            if (!isNaN(message)) {
                console.log(`${name} makes bid : ${message} USDt`)
                highestBid(name, parseFloat(message))
            } else {
                console.log(`Closing Auction ${message}`)
            }
        }

    })
    peer.on('error', e => console.log(`Error : ${e}`))
    peer.on('close', () => {
        console.log(`[connection left] ${peer}`)
    })
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

(userInput === 'create') ? createAuction() : joinAuction(userInput)
rl.input.setMode(tty.constants.MODE_RAW)

rl.on('data', async (line) => {

    if (!isNaN(line)) sendMessage(line)
    else if (line === 'close') {
        const { name, price } = await closeAuction()
        console.log('Closing Auction - name : ' + name + ', Price : ' + price + '')
        sendMessage('name : ' + name + ', Price : ' + price + '')
    }
    rl.prompt()
})



function isAlphanumeric(str) {
    return /^[a-zA-Z0-9 :,]+$/.test(str);
}