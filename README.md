# PeepIn
Decentralized app to put/get reviews and ratings for the companies

## Links
- [Demo Video](https://youtu.be/4Q4QX6Q4Q4Q)
- [Live Demo](https://peepin.xyz/)
- [Live Demo](https://peep-in-nine.vercel.app/)
- [Smart Contracts on Polygon Mumbai Testnet](https://mumbai.polygonscan.com/address/0xb8885e78ae52804f3fcbb0f0061efa35580f05dc)

## Overview
PeepIn is a blockchain based platform where professionals can share their authentic experiences and reviews about the companies they work(ed) for. It is a decentralized app built on Polygon(Mumbai) chain using Solidity smart contracts and NextJs. 

## Why PeepIn?
Centralized review platforms are not transparent and are prone to removal of negative reviews for companies. PeepIn is a decentralized platform where the reviews are immutable and transparent. 
Moreover to prevent spamming, feature can be added where community of PeepIn users can decide the authenticity of the reviews by reacting on them based on `Trueness`, `Possible lie` & `Report abuse` anonymously. The reviews with the most positive reactions will be shown on the top.

## Features
- Anonymity: Users can post reviews anonymously. Share your thoughts anonymously without any fear of repercussions.
- Ratings: Users can rate the companies on a scale of 1-5, based on various aspects like work-life balance, salary, management, etc.
- Gasless: Users can post reviews without paying any gas fees.
- Of/For/By the community: The community can decide the authenticity of the reviews by reacting on them. The reviews with the most positive reactions will be shown on the top.
- Transparency: All the reviews and ratings are stored on the blockchain, which makes them immutable and transparent.
- Helpful Feedback: Users can add reviews with pros & cons along with advice. So, Constructive feedback helps companies to improve their work culture and policies.

## Tech Stack
-NextJs
-RainbowKit
-ethers.js
-wagmi
-Solidity
-hardhat
-Polygon
-IPFS
-web3.storage
-Biconomy
-Metamask
-Alchemy

## Screenshots
<img width="1429" alt="Screenshot 2023-07-25 at 11 48 36 PM" src="https://github.com/harry91198/peep-in/assets/35892549/a105604d-a2dd-4478-bc8a-e163d95502e0">
<img width="1406" alt="Screenshot 2023-07-25 at 11 48 23 PM" src="https://github.com/harry91198/peep-in/assets/35892549/ae36c175-0e3d-46c2-be22-b8490f259df2">
<img width="1400" alt="Screenshot 2023-07-25 at 11 48 52 PM" src="https://github.com/harry91198/peep-in/assets/35892549/101bbb73-7ed2-42fd-b2b1-069989c737d9">


## Installation
### webapp
1. Clone the repo
2. Install dependencies
```
npm install
```
3. Start the app
```
npm run dev
```
4. Open http://localhost:3000 in your browser

### smart contracts
1. Clone the rep
```
cd contract-module
```
2. Install dependencies
```
npm install
```
3. Create a .env file based on the .env.example file
4. Deploy & verify the contracts on Polygon Mumbai testnet  
```
npm run deploy mumbai
npm run verify mumbai
```

Smart contract are kept upgradable using ERC1967 via OpenZeppelin's Upgrades Plugins.
Smart contract is given gasless functionality using ERC2771Recipient

## Usage
1. Connect your wallet to the app
2. Post a review
Simple :smile:)


##
##
