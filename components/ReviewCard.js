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
    Tooltip
 } from '@chakra-ui/react'
 import  RATING_PRECISION  from '../lib/constants';
 import { Web3Storage } from 'web3.storage';
 import config from '../contract-module/scripts/config.json';
import contract from '../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';
import { useContractWrite, useAccount, useWaitForTransaction, useContractReads } from 'wagmi';

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
    const { isOpen, onOpen, onClose } = useDisclosure()

return (
    <>
    {
      reviewData.map((review, index) => {
        console.log("reviewww", review);
        return (
          <Box
              maxW="md"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              p="6"
              m="10"
              >
              <Flex key={index-"flex1"}>
              {
                
                  //print StarIcon for each rating out of 5, for the rest of the stars print empty StarIcon
                  [...Array(Number(review.rating))].map((e, i) => <StarIcon key={i} color={"yellow.400"} />).concat(
                  [...Array(5 - Number(review.rating))].map((e, i) => <StarIcon key={i} color={"gray.400"} />)
                  )
              }
              </Flex>
              <Text fontSize="xs">By {review.employee} employee, {getTimeAgo(Number(review.timestamp)*1000)}</Text>
              <Flex key={index-"flex2"}>
                  <Box>
                      <Heading fontSize="xl">"{review.review}"</Heading>
                      <Text fontSize="sm" ml={10}>
                        <Link href={`https://mumbai.polygonscan.com/address/${review.reviewer}`} isExternal>
                        -{review.title}
                        <Avatar size="xs" mt={0} mb={2} src={`https://api.dicebear.com/6.x/pixel-art/svg?seed=${review.reviewer}`} />
                        </Link>
                      </Text>
                  </Box>
                  <Spacer />
                  <Box>
                    <Link href={`https://mumbai.polygonscan.com/tx/${review.transactionHash}`} isExternal>
                      <ExternalLinkIcon />
                    </Link>
                  </Box>
              </Flex>
              <Divider />
              <Flex key={index-"flex3"}>
                  <Box key={index-"1"} m={2}>
                      <Heading key={index-"pros"} fontSize="xl">Pros: </Heading>
                      <Text fontSize="xs">{review.pros}</Text>

                      <Heading key={index-"cons"} fontSize="xl" mt={1}>Cons: </Heading>
                      <Text fontSize="xs">{review.cons}</Text>
                  </Box>
                  <Spacer />
                  <Box key={index-"2"} m={2}>
                      <Heading fontSize="xl">Advices</Heading>
                      <Text fontSize="xs">{review.advices}</Text>
                      <Text fontSize="xs" mt={2}>
                        <Tooltip label="True hai" aria-label="A tooltip" placement='top'>
                        <Button variant={'unstyled'} // onClick={}
                        >💯</Button>
                        </Tooltip>
                        <Tooltip label="Lie" aria-label="A tooltip" placement='top'>
                        <Button variant={'unstyled'} // onClick={}
                        >🤥</Button>
                        </Tooltip>
                        <Tooltip label="Report abuse" aria-label="A tooltip" placement='top'>
                        <Button variant={'unstyled'} // onClick={}
                        >😈</Button>
                        </Tooltip>                                        
                      </Text>
                  </Box>
              </Flex>
          </Box>
        )
          
      })

    }



    </>
)
}
export default ReviewCard;
