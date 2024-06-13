import Hyperswarm from "hyperswarm";
import Corestore from "corestore";
import Hyperbee from "hyperbee";
import b4a from 'b4a'

const peerConstants = {}

async function loadPeer(userInput) {

    const store = new Corestore(Pear.config.storage)

    const swarm = new Hyperswarm()
    Pear.teardown(() => swarm.destroy())

    const core = (userInput == 'create') ? store.get({ name: 'my-auction' }) : store.get({ key: b4a.from(userInput, 'hex') })

    const bee = new Hyperbee(core, {
        keyEncoding: 'utf-8',
        valueEncoding: 'json'
    })

    await core.ready()

    const batch = bee.batch()

    peerConstants.swarm = swarm
    peerConstants.store = store
    peerConstants.core = core
    peerConstants.batch = batch
    peerConstants.bee = bee

    console.log('Peer created succesfully....')
}

function getPeerConstants(){
    return peerConstants
}

function sendMessage(message){
    const peers = [...peerConstants.swarm.connections]
    for(const peer of peers)peer.write(message)
}


export {loadPeer,getPeerConstants,sendMessage}