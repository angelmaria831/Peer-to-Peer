import tty from 'bare-tty'
import b4a from 'b4a'
import readline from 'bare-readline'
import process from 'bare-process'

const readInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export async function createAuction(batch, bee, core, rl, swarm) {

    console.log('Creating Auction...')
    const itemValue = { 'unit': 'USDt', 'Status': 'live' }
    const roomDetails = {}
    rl.input.setMode(tty.constants.MODE_RAW)

    console.log('Enter the Itemname,Price(comma-sepearted) : ')

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

        await batch.put(itemNumber, itemValue, { cas })
        await batch.put(roomKey, roomDetails, { cas })
        await batch.flush()
        readInput.close()
    })

}

export async function joinAuction(core, swarm, bee, key) {
    swarm.join(core.discoveryKey)
    const roomDetails = await bee.get(key)
    console.log('Fetching Item details....', JSON.stringify(roomDetails))
    bee.get(roomDetails.value.itemNumber).then(data => {
        console.log(`[info] Unit: ${data.value.unit} \n Status: ${data.value.status}\n Name: ${data.value.name}\n Price: ${data.value.price}`);
    })

}

export async function highestBid(message, swarm, name, bee, core, batch) {
    const roomKey = b4a.toString(core.key, 'hex')
    const publicKey = b4a.toString(swarm.keyPair.publicKey, 'hex')

    bee.get(roomKey).then(async (roomDetails) => {

        if (roomDetails.value.highestBidPrice < parseFloat(message) && publicKey.toString() == roomDetails.value.creator) {
            const updatedData = {}
            updatedData['itemNumber'] = roomDetails.value.itemNumber
            updatedData['creator'] = roomDetails.value.creator
            updatedData['status'] = roomDetails.value.status
            updatedData['highestBidName'] = name
            updatedData['highestBidPrice'] = parseFloat(message)

            await batch.put(roomKey, updatedData, { cas })
            await batch.flush()

            let roomDetails = await bee.get(roomKey)
            console.log('Fetching item updated details....', roomDetails.value)
            return true
        } else return false
    })


}
export async function closeAuction(swarm, bee, core, batch) {
    const roomKey = b4a.toString(core.key, 'hex')
    const roomDetails = await bee.get(roomKey)
    const publicKey = b4a.toString(swarm.keyPair.publicKey, 'hex')
    if (publicKey.toString() === roomDetails.value.creator) {
        roomDetails.value.status = 'Closed'
        const itemDetails = await bee.get(roomDetails.value.itemNumber)
        itemDetails.value.Status = 'Sold'

        await batch.put(roomKey, roomDetails.value, { cas })
        await batch.put(roomDetails.value.itemNumber, itemDetails.value, { cas })
        await batch.close()
        return roomDetails.value.highestBidName, roomDetails.value.highestBidPrice
    }


}


function cas(prev, next) {
    return prev.value !== next.value
}
