import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Box, Center, Heading, Highlight, Input, InputGroup, InputLeftElement, InputRightAddon, InputRightElement, SimpleGrid, Spinner, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import FloatingButton from "../../components/FloatingButton";
import useGetCompany from "../../lib/hooks/useGetCompany";
import CompanyCard from "../../components/CompanyCard";
// import useGetReviews from "../../lib/hooks/useGetReviews";

import config from '../../contract-module/scripts/config.json';
import { createPublicClient, fallback, http, stringify } from 'viem'
import { polygonMumbai } from 'viem/chains';
import ReviewCard from "../../components/ReviewCard";
import { useAccount } from "wagmi";


// TODO: add ESG score also

export default function Company() {
    const address = useAccount();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const [companyMetadata, setCompanyMetadata] = useState();
  const [reviewMetadata, setReviewMetadata] = useState();
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState();
  const [refresh, setRefresh] = useState(false);
  const [updatingReview, setUpdatingReview] = useState(false);


const comData = useGetCompany(router.query.id); 
// const reviewData = useGetReviews(router.query.id);

  useEffect(() => {
    async function getCompanyData(){
      if(comData.allData.id != ""){
        const metadataLink = comData.allData.metadata;
        const metadata = await fetch(metadataLink);
        const metadataJson = await metadata.json();
        const thisCompanyData = {...metadataJson, avgRating: comData.allData.avgRating, id: comData.allData.id};
        // console.log("thisCompanyData", thisCompanyData);
      setCompanyMetadata(thisCompanyData);
    }
    // console.log("companyMetadata", companyMetadata);
    
  }
  getCompanyData();
  }, [router]);

  useEffect(() => {
    async function getReviewData(){
        console.log("getReviewsData")
        setUpdatingReview(true);
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
        const blockNumber = await client.getBlockNumber()
        console.log("blockNumber", blockNumber);
        const logs = await client.getLogs({
        address: config.peepIn,
        event,
        args: {
            tokenId: router.query.id
        },
        fromBlock: '0x247E148',
        toBlock: blockNumber,
        })

        // console.log("logs", logs);
        let reviewData = [];
        let reviewsData = new Map();
        for (const log of logs) {
            if(Number(log.args.tokenId) == Number(router.query.id)){
                const { reviewer, rating, timestamp, reviewLink } = log.args;
                const { transactionHash } = log;
                const reviewMetadata = await fetch(reviewLink);
                const reviewMetadataJson = await reviewMetadata.json();
                const thisReviewData = {reviewer, rating, timestamp, reviewLink, transactionHash, ...reviewMetadataJson};
                // store thisReviewData in a map with key as reviewer
                reviewsData.set(reviewer, thisReviewData);
            }
          }
          // iterate reviewsData for each entry and push to reviewData
          for (const [key, value] of reviewsData.entries()) {
            console.log("key", key, value);
            if(key == address.address){
                setHasReviewed(true);
                setUserReview(value);
            }
            reviewData.push(value);
          }
        // console.log("reviewData", reviewData);
        setUpdatingReview(false);
        setReviewMetadata(reviewData);
    }
    getReviewData();
    }, [router, refresh]);
  

  return (
    <div>
      <Head>
        <title>PeepIn</title>
        <meta
          name="description"
          content="Decentralized app to put reviews and ratings for the companies"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {
            companyMetadata?


                <CompanyCard companyData={companyMetadata} userReview={userReview} hasReviewed={hasReviewed} setRefresh={setRefresh}/>

            
            :
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>

        }

        {
            reviewMetadata?
            
            <ReviewCard reviewData={reviewMetadata} />
            :
            updatingReview?
            <Heading as="h1" size="2xl" m={"2rem"} align={"right"}>
                <Spinner />
            </Heading>
            
                
            :
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>

        }
        
      </div>





      
      


      <FloatingButton onClick={toggleColorMode} />
    </div>
  );
}
