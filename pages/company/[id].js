import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Box, Center, Button, Heading, Highlight, Input, InputGroup, InputLeftElement, InputRightAddon, InputRightElement, SimpleGrid, Spinner, Text, useColorMode, useColorModeValue, Skeleton, SkeletonCircle, SkeletonText, Grid, GridItem } from "@chakra-ui/react";
import FloatingButton from "../../components/FloatingButton";
import CompanyCard from "../../components/CompanyCard";

import { createPublicClient, fallback, http, stringify } from 'viem'
import { polygonMumbai } from 'viem/chains';
import ReviewCard from "../../components/ReviewCard";
import { useAccount } from "wagmi";
import { readContract, readContracts } from '@wagmi/core';


import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';



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
  const [gettingData, setGettingData] = useState(false);


  useEffect(() => {
    async function getCompanyData(i){
      if(i){
        setGettingData(true);
          const comData = await readContracts({
            contracts: [
              {
                address: config.peepIn,
                abi: contract.abi,
                functionName: 'companyMetadata',
                args: [i]
              },
              {
                address: config.peepIn,
                abi: contract.abi,
                functionName: 'getAverageRating',
                args: [i]
              }
            ]
          })
          console.log("comData", i, comData);
          const metadataLink = comData[0].result;
          const metadata = await fetch(metadataLink);
          const metadataJson = await metadata.json();
          const thisCompanyData = {...metadataJson, avgRating: comData[1].result, id: i};
          
        setCompanyMetadata(thisCompanyData);
        setGettingData(false);
      }
    }
    getCompanyData(router.query.id);
  }, [router, refresh]);

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
        <div>
          <Button
            onClick={() => {
              router.push("/");
            }}
            mx={"10"}
            my={"1rem"}
            mb={"-2rem"}
          >
            Back
          </Button>
        </div>

        {
            companyMetadata?

<>
<CompanyCard companyData={companyMetadata} userReview={userReview} hasReviewed={hasReviewed} setRefresh={setRefresh}/>
</>

            
            :
            // <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
            //     <Spinner />
            // </Heading>
            <Box
             boxShadow='lg'    
             m={10}
             mt={"4em"}
             height={"250px"}
              >
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={1}>

                <Skeleton height={"100%"} />
                </GridItem>
                <GridItem colSpan={1}>
                <SkeletonText  noOfLines={4} spacing="4" p={2} skeletonHeight={10} />
                </GridItem>
                </Grid>
              </Box>

        }
        <div>
        <Heading as="h4" size="lg" ml={"2rem"} mb={"-2rem"} align={"left"}>
                Reviews
            </Heading>
        </div>

        {
          //check of reviewMetadata is empty, if yes then show spinner or else iterate through the array and show the review card
          reviewMetadata?
          reviewMetadata.map((review, index) => {
            return <ReviewCard reviewData={review} key={index} />
          }
          )
          :
          updatingReview||refresh?
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>
            
                
            :
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>
          
        }

        {/* {
            reviewMetadata?
            
            <ReviewCard reviewData={reviewMetadata} />
            :
            updatingReview||refresh?
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>
            
                
            :
            <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
                <Spinner />
            </Heading>

        } */}
        
      </div>





      
      


      <FloatingButton onClick={toggleColorMode} />
    </div>
  );
}
