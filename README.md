# Peer-to-Peer

A peer-to-peer auction terminal application using Hyperswarm-Hypercore-Hyperbee.

To start the app, in one terminal `run pear dev -s /tmp/bd5 . create` which would give output as below:

![peer-server](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/0b6b81ed-20c2-4f40-91ee-2ca80197415a)

Similarly, in another terminal use room key as input as below :

![peer-client](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/b875f3fe-6123-4209-b8f9-b3bc8b262372)

The roomdetails are stored in hyperbee as :
roomkey ---> ItemNumber,creator,status,highestBidName,highestBidPrice

and itemdetails as :
ItemNumber ---> Name,Price,Unit,status

The idea is to update the name of user(publickey) and bid price (highestBidName,highestBidPrice) as peers interact to each other and if bid price is higher than existing value. Only creator would be allowed to update  the hyperbee

![peer-to-peer](https://github.com/angelmaria831/Peer-to-Peer/assets/104212477/95baa744-43c4-4a16-bf6e-0ebda9fd23f3)


When creator sends 'closed' message , the bid is finalized and notified to all peers, updating the status in hyperbee.

Since the time is limited,further updates like validation,authentication and better code standardization could be done. Also, had some queries of updating the existing data of hyperbee. I have implemented with bee.put() which has some issues, though insertion worked fine.


