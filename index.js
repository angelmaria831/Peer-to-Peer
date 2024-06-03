import Hyperswarm from "hyperswarm";
import Corestore from "corestore";
import Hyperbee from "hyperbee";
import b4a from 'b4a'
import readline from 'bare-readline'
import tty from 'bare-tty'
import process from 'bare-process'
import { createAuction, joinAuction, highestBid, closeAuction } from './auction'

const store = new Corestore(Pear.config.storage)

const swarm = new Hyperswarm()
Pear.teardown(() => swarm.destroy())


const argVal = Pear.config.args[0]
const core = (argVal == 'create') ? store.get({ name: 'my-auction' }) : store.get({ key: b4a.from(argVal, 'hex') })

const bee = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
})

await core.ready()

const batch = bee.batch()

swarm.on('connection', peer => {
    store.replicate(peer)
    const name = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6)
    //Client#2 makes bid for Client#1->Pic#1 with 75 USDt

    peer.on('data', message => {

        if (isAlphanumeric(message)) {
            console.log(`${name} makes bid : ${message} USDt`)
            highestBid(parseFloat(message), swarm, name, bee, core)
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
})



rl.input.setMode(tty.constants.MODE_RAW)
rl.on('data', line => {

    if (!isNaN(line)) sendMessage(line)
    else if (line === 'close') {
        const { name, price } = closeAuction(bee, core, batch)
        sendMessage(`Closing Auction..., Name: ${name}, Price : ${price}`)
    }
    rl.prompt()
})

if(argVal == 'create')createAuction(batch, bee, core, rl, swarm)
    else joinAuction(core, swarm, bee, argVal)


function sendMessage(message) {
    const peers = [...swarm.connections]
    for (const peer of peers) peer.write(message)
}

function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
