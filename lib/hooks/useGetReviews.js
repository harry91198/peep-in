import { useEffect, useState } from "react";
import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';
import util from '../utils/config.json'
import { createPublicClient, fallback, http, stringify } from 'viem'
import { polygonMumbai } from 'viem/chains';
const alchemy = http(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`)
const client = createPublicClient({
    chain: polygonMumbai,
    
    transport: fallback([alchemy]),
  })

  const event = {
    "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "reviewer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rating",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reviewLink",
          "type": "string"
        }
      ],
      "name": "ReviewSubmitted",
      "type": "event"
  }
export default async function useGetReviews(i) {
    console.log("i", i, client);
    const blockNumber = await client.getBlockNumber()
    console.log("blockNumber", blockNumber);
    const logs = await client.getLogs({
    event,
    fromBlock: util.START_BLOCK,
    toBlock: blockNumber,
    })

    client.watchEvent({
        address: config.peepIn, 
        event,
        onLogs: (logs) => {
          console.log('New logs', logs)
        },
      })

  return {
    0: logs
  };
}