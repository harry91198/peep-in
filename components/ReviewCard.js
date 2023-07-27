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




    </>
)
}
export default ReviewCard;
