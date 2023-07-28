import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon, StarIcon } from '@chakra-ui/icons';
// import Emoji from 'react-emoji-render';
import ReactStars from 'react-stars';
import { 
    Box,
    Card,
    Flex,
    Spacer,
    Divider,
    Image,
    Stack,
    CardBody,
    Heading,
    Text,CardFooter,
    Button,
    Link,
    useToast,
    Grid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,

    useDisclosure,
    RadioGroup,
    Radio,
    Textarea,
    Avatar,
    Tooltip,
    useColorModeValue,
    GridItem
 } from '@chakra-ui/react'
 import  RATING_PRECISION  from '../lib/constants';
 import { Web3Storage } from 'web3.storage';
 import config from '../contract-module/scripts/config.json';
import contract from '../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';
import { useContractWrite, useAccount, useContractReads } from 'wagmi';
import { writeContract, waitForTransaction, readContracts } from '@wagmi/core';
import { ethers, providers } from "ethers";
import { Biconomy } from "@biconomy/mexa";
import { useEthersSigner } from '../lib/hooks/useEthersSigner';

    function getTimeAgo(timestamp) {
      const currentTime = Date.now();
      const timeDifference = currentTime - timestamp;
    
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(months / 12);
    
      if (years > 0) {
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
      } else if (months > 0) {
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      } else if (days > 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
      }
    }
    

const ReviewCard = ({reviewData}) => {
    const { address } = useAccount();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ refresh, setRefresh ] = useState(false);
    const [loadingFor, setLoadingFor] = useState();
    const [ loading, setLoading ] = useState(false);
    const [ myStatus, setMyStatus ] = useState();
    const [ statusCount, setStatusCount] = useState([]);
    const signer = useEthersSigner();
    const [biconomy, setBiconomy] = useState(null);

    useEffect(() => {
      if (signer) {
        const ethersProvider = new ethers.providers.Web3Provider(
          (signer.provider).provider
        );
        let biconomy$ = new Biconomy(ethersProvider.provider, {
          apiKey: process.env.NEXT_PUBLIC_BICONOMY_APIKEY,
          contractAddresses: [config.peepIn],
          strictMode: true,
        });
        setBiconomy(biconomy$);
      }
    }, [signer]);

    const addStatus = async(tokenId, reviewer, status) => {
      try{
        // const { hash } = await writeContract({
        //   address: config.peepIn,
        //   abi: contract.abi,
        //   functionName: 'submitStatus',
        //   args: [tokenId, reviewer, status],
        // })
        // console.log("hash", hash);
        // const receipt = await waitForTransaction({hash});
        // console.log("receipt", receipt); 
        console.log("addStatus", tokenId, reviewer, status); 
        setLoading(true);
        setLoadingFor(status);
        await biconomy.init();
        const provider = await biconomy.provider;
        const contractInstance = new ethers.Contract(
          config.peepIn,
          contract.abi,
          biconomy.ethersProvider
        );
        let { data } = await contractInstance.populateTransaction.submitStatus(
          tokenId, reviewer, status
        );
    
        let txParams = {
          data: data,
          to: config.peepIn,
          from: address,
          signatureType: "EIP712_SIGN",
        };
        toast({title:"Initiating transaction...", status:"info", position:"top"});
        const result = await provider.send("eth_sendTransaction", [txParams]);
        // checking transaction successfull or not
        console.log("result", result);
        if (!result.transactionId) {
          toast({
            title: "Error",
            description: `Transaction was not successful`,
            status: "error",
            duration: 5000,
            isClosable: true,
            })
            setLoading(false);
        }
        biconomy.on("txHashGenerated", (data) => {
          console.log(data);
          toast({
            title: "Transaction successfully sent",
            description: "Updating details on-chain.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position:"top"
            })
        });
        
        biconomy.on("txMined", (data) => {
          console.log(data);
          toast({
            title: "Details updated",
            status: "success",
            duration: 5000,
            isClosable: true,
            position:"top"
            })
            setLoading(false);
            setRefresh(true);
        });
        
        biconomy.on("onError", (data) => {
          console.log(data);
          toast({
            title: "Error",
            description: `${data.error}`,
            status: "error",
            duration: 5000,
            isClosable: true,
            })
            setLoading(false);
        });
      }catch(err){
        console.log("error", err);
        toast({
          title: "Error",
          description: `${err.message}`,
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top"
          })
          setLoading(false);
      }
    }
    
    useEffect(() => {
      async function getReviewStatus() {
        console.log("getReviewStatus reviewData", reviewData);
        const status = await readContracts({
          contracts:[
            {
              address: config.peepIn,
              abi: contract.abi,
              functionName: 'statusData',
              args: [reviewData.company_id, reviewData.reviewer, address],
            },
            {
              address: config.peepIn,
              abi: contract.abi,
              functionName: 'reviewStatus',
              args: [reviewData.company_id, reviewData.reviewer],
            }
          ]
        })
        console.log("status", status);
        setStatusCount(status[1].result);
        setMyStatus(status[0].result);
      }
      getReviewStatus();
    }, [reviewData, refresh])

return (
  console.log("reviewData", reviewData),
    <>
    <Box
        maxW="lg"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        p="6"
        m="10"
        >
        <Flex>
        {
          
            //print StarIcon for each rating out of 5, for the rest of the stars print empty StarIcon
            [...Array(Number(reviewData.rating))].map((e, i) => <StarIcon key={i+'2'} color={"yellow.400"} />).concat(
            [...Array(5 - Number(reviewData.rating))].map((e, i) => <StarIcon key={i+'3'} color={"gray.400"} />)
            )
        }
        </Flex>
        <Text fontSize="xs">By {reviewData.employee} employee, {getTimeAgo(Number(reviewData.timestamp)*1000)}</Text>
        <Flex>
            <Box
                
            >
                <Heading fontSize="xl">"{reviewData.review}"</Heading>
                <Text fontSize="sm" ml={10}>
                  <Link href={`https://mumbai.polygonscan.com/address/${reviewData.reviewer}`} isExternal>
                  -{reviewData.title}
                  <Avatar size="xs" mt={0} mb={2} ml={1} src={`https://api.dicebear.com/6.x/pixel-art/svg?seed=${reviewData.reviewer}`} />
                  </Link>
                </Text>
            </Box>
            <Spacer />
            <Box
            >
              <Link href={`https://mumbai.polygonscan.com/tx/${reviewData.transactionHash}`} isExternal>
                <ExternalLinkIcon />
              </Link>
            </Box>
        </Flex>
        <Divider />
        <Flex>
            <Box m={2}>
                <Heading fontSize="xl">Pros: </Heading>
                <Text fontSize="xs">{reviewData.pros}</Text>

                <Heading fontSize="xl" mt={1}>Cons: </Heading>
                <Text fontSize="xs">{reviewData.cons}</Text>
            </Box>
            <Spacer />
            <Box m={2}>
                <Heading fontSize="xl">Advices</Heading>
                <Text fontSize="xs">{reviewData.advices}</Text>
                <Text fontSize="xs" mt={2}>
                  <Grid templateColumns="repeat(3, 1fr)" gap={1}>
                  <GridItem colSpan={1}>
                    <Tooltip label="True hai" aria-label="A tooltip" placement='top'>
                      <div>
                        <Button 
                          variant={'unstyled'} 
                          mr={2} 
                          opacity={myStatus === 0 ? 1 : 0.6}
                          _hover={{transform: "scale(1.4)"}} 
                          isLoading={loading?loadingFor===0?true:false:false}
                          onClick={()=>addStatus(reviewData.company_id, reviewData.reviewer, 0)}
                        >💯
                        </Button>
                        <Text fontSize="xs" ml={3}>
                        {Number(statusCount[0])}</Text>
                      </div>                
                    </Tooltip>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <Tooltip label="Lie" aria-label="A tooltip" placement='top'>
                      <div>
                        <Button 
                          variant={'unstyled'} 
                          mr={2}
                          opacity={myStatus === 1 ? 1 : 0.4}
                          _hover={{transform: "scale(1.4)"}} 
                          isLoading={loading?loadingFor===1?true:false:false}
                          onClick={()=>addStatus(reviewData.company_id, reviewData.reviewer, 1)}
                        >🤥</Button>
                        <Text fontSize="xs" ml={3}>
                            {Number(statusCount[1])}</Text>
                      </div>
                    </Tooltip>
                  </GridItem>
                  <GridItem colSpan={1}>
                  <Tooltip label="Report abuse" aria-label="A tooltip" placement='top'>
                    <div>
                      <Button 
                        variant={'unstyled'} 
                        mr={2} 
                        opacity={myStatus === 2 ? 1 : 0.4}
                        _hover={{transform: "scale(1.4)"}} 
                        isLoading={loading?loadingFor===2?true:false:false}
                        onClick={()=>addStatus(reviewData.company_id, reviewData.reviewer, 2)}
                      >😈</Button>
                      <Text fontSize="xs" ml={3}>
                          {Number(statusCount[2])}</Text>
                    </div>
                  </Tooltip>    
                  </GridItem>
                  </Grid>                                    
                </Text>
            </Box>
        </Flex>
    </Box>




    </>
)
}
export default ReviewCard;
