import tty from 'bare-tty'
import b4a from 'b4a'
import readline from 'bare-readline'
import process from 'bare-process'
import { getPeerConstants } from './peerLoad'

const readInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


async function createAuction() {

    const { swarm, core, batch } = getPeerConstants()
    console.log('Creating Room for Auction...')

    const itemValue = { 'unit': 'USDt', 'status': 'live' }
    const roomDetails = {}

    console.log('\nEnter the Itemname,Price(comma-seperated) : ')

    readInput.on('data', async (data) => {

        itemValue['name'] = data.split(',')[0]
        itemValue['price'] = data.split(',')[1]//valid number
        readInput.prompt()

        const itemNumber = Date.now() + itemValue['name']
        const discovery = swarm.join(core.discoveryKey)

        const roomKey = b4a.toString(core.key, 'hex')

        discovery.flushed().then(() => {
            console.log('Room for Bidding: ', roomKey)

        })
        roomDetails['itemNumber'] = itemNumber
        roomDetails['creator'] = b4a.toString(swarm.keyPair.publicKey, 'hex')
        roomDetails['status'] = 'live'
        roomDetails['highestBidName'] = 'self'
        roomDetails['highestBidPrice'] = itemValue['price']

        await Promise.all([appendBatch(itemNumber, itemValue), appendBatch(roomKey, roomDetails)])
        await batch.flush()
        readInput.close()
    })

}

async function joinAuction(key) {
    const { swarm, core, batch } = getPeerConstants()
    swarm.join(core.discoveryKey)
    const roomDetails = await getBatchData(batch, key)
        console.log('\nFetching Item details....', JSON.stringify(roomDetails))
        batch.get(roomDetails.itemNumber).then(data => {
            console.log(`\n[info] Unit: ${data.value.unit} \n Status: ${data.value.status}\n Name: ${data.value.name}\n Price: ${data.value.price}`);
        })
}

async function highestBid(name, message) {
    const { swarm, core, batch } = getPeerConstants()
    const roomKey = b4a.toString(core.key, 'hex')
    const publicKey = b4a.toString(swarm.keyPair.publicKey, 'hex')

    const value = await getBatchData(batch, roomKey)

    if (value.highestBidPrice < parseFloat(message) && publicKey.toString() == value.creator) {

        const updatedData = {}
        updatedData['itemNumber'] = value.itemNumber
        updatedData['creator'] = value.creator
        updatedData['status'] = value.status
        updatedData['highestBidName'] = name
        updatedData['highestBidPrice'] = parseFloat(message)

        await appendBatch(roomKey, updatedData)

        let roomDetails = await getBatchData(batch, roomKey)
        console.log('\nFetching item updated details....', roomDetails)
        return true
    } else return false
}

async function appendBatch(key, data) {
    const { batch } = getPeerConstants()
    return await batch.put(key, data, { cas })
}

async function closeAuction() {
    const { swarm, core, batch, bee } = await getPeerConstants()
    const roomKey = b4a.toString(core.key, 'hex')
    const roomDetails = await getBatchData(batch, roomKey)
    const itemDetails = await getBatchData(batch, roomDetails.itemNumber)
    roomDetails.status = 'Closed'
    itemDetails.status = 'Sold'

    await Promise.all([appendBatch(roomKey, roomDetails), appendBatch(roomDetails.itemNumber, itemDetails)])
    await batch.flush()

    return {
        'name': roomDetails.highestBidName,
        'price': roomDetails.highestBidPrice
    }
}

function cas(prev, next) {
    return prev.value !== next.value
}

async function getBatchData(batch, batchkey) {
    try{
        const { value } = await batch.get(batchkey)
        return value
    }catch(e){
        throw Error('Failed to fetch data from Batch. Please try again...c')
    }
     
}

export { createAuction, joinAuction, highestBid, closeAuction }