# Peer-to-Peer

A peer-to-peer auction terminal application using Hyperswarm-Hypercore-Hyperbee.

To start the app, in one terminal `run pear dev -s /tmp/bid1 . create` which would give output as below:

![create](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/8091aa86-2e11-4868-a0f5-38e317842041)

Similarly, in another terminal use room key as input as below :

![join](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/2726e4af-ad4a-4343-bd3a-f23071ee1135)

This would allow to join the auction room and fetch item details from hyperbee.

The roomdetails are stored in hyperbee as :
roomkey ---> ItemNumber,creator,status,highestBidName,highestBidPrice

and itemdetails as :
ItemNumber ---> Name,Price,Unit,status

The idea is to update the name of user(publickey) and bid price (highestBidName,highestBidPrice) as peers interact to each other and if bid price is higher than existing value. Only creator would be allowed to update  the hyperbee
![bidhightlighted](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/865f2010-0d45-4c99-b349-f5b0b7975758)

And the owner can close the bid by typing message 'close'. The highest bid will be finalized and message will be send to all other peers.
![close](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/2b3ea0b4-9527-407b-9464-a9b70ed51429)



When creator sends 'closed' message , the bid is finalized and notified to all peers, updating the status in hyperbee.

Since the time is limited,further updates like validation,authentication and better code standardization could be done. Also, had some queries of updating the existing data of hyperbee. I have implemented with bee.put() which has updation issues, though insertion worked fine.


