import React, { useState, useEffect, use } from 'react';
import { EditIcon, ExternalLinkIcon, StarIcon } from '@chakra-ui/icons';
import { FaPencilAlt } from 'react-icons/fa';
import ReactStars from 'react-stars';
import { 
    Box,
    Card,
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
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Select,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,

    useDisclosure,
    RadioGroup,
    Radio,
    Textarea,
    Icon
 } from '@chakra-ui/react'
 import  RATING_PRECISION  from '../lib/constants';
 import { Web3Storage } from 'web3.storage';
 import config from '../contract-module/scripts/config.json';
import contract from '../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';
import { useContractWrite, useAccount, useWaitForTransaction, useContractReads } from 'wagmi'
import Rating from 'react-rating';
import { FileUploader } from 'react-drag-drop-files';

//gasless
import { ethers, providers } from "ethers";
import {Biconomy} from "@biconomy/mexa";
import { useEthersSigner } from "../lib/hooks/useEthersSigner";

const fileTypes = ["JPG", "JPEG", "PNG"];

const uploadImage = async(files) => {
  try{
      const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN })
      const cid = await client.put([files])
      const encodedURI = encodeURI(`https://dweb.link/ipfs/${cid}/${files.name}`)
      return encodedURI;
  } catch (error) {
      console.log("error", error);
  }
}

const uploadData = async(data) => {
  try{
      let files = new File([JSON.stringify(data)], "data.json", {type: "application/json"})
      const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN })
      const cid = await client.put([files])
      const encodedURI = encodeURI(`https://dweb.link/ipfs/${cid}/${files.name}`)
      return encodedURI;
  } catch (error) {
      console.log("error", error);
  }
  } 
  const uploadReview = async(data) => {
    try{
        let files = new File([JSON.stringify(data)], "review.json", {type: "application/json"})
        const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN })
        const cid = await client.put([files])
        const encodedURI = encodeURI(`https://dweb.link/ipfs/${cid}/${files.name}`)
        return encodedURI;
    } catch (error) {
        console.log("error", error);
    }
    }

const CompanyCard = ({companyData, userReview, hasReviewed, setRefresh}) => {
    const { address } = useAccount();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const drawer = useDisclosure()
    const firstField = React.useRef()
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    const [uploadingReview, setUploadingReview] = useState(false);
    const [uploadingData, setUploadingData] = useState(false);

    const [ratingValue, setRatingValue] = useState(undefined);
    const [employeeValue, setEmployeeValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [reviewValue, setReviewValue] = useState('');
    const [prosValue, setProsValue] = useState('');
    const [consValue, setConsValue] = useState('');
    const [advicesValue, setAdvicesValue] = useState('');
    const [imageUpload, setImageUpload] = useState(false);
    const [imageIPFS, setImageIPFS] = useState(null);

    //
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');


    const [biconomy, setBiconomy] = useState(null);
    const signer = useEthersSigner({chainId:80001});

    const handleChange = async(file) => {
      setImageUpload(true);
      const ipfsURI = await uploadImage(file);
      console.log("ipfsURI", ipfsURI);
      setImageIPFS(ipfsURI);
      setImageUpload(false);
    };

  const onSubmit = async(data) => {

    const comData = {
      name: companyName,
      location_address: companyAddress,
      website: companyWebsite,
      phone: companyPhone,
      email: companyEmail,
      logo: imageIPFS? imageIPFS: companyData.logo,
      wallet_address: companyData.wallet_address,
    }
    // console.log("comData", comData);
    setUploadingData(true);
    const ipfsURI = await uploadData(comData);
    console.log("ipfsURI", ipfsURI);
    if(!!ipfsURI){
        toast({
            title: 'Details uploaded on IPFS Successfully',
            description: 'Sign the transaction to add new company details on PeepIn',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          await biconomy.init();
          const provider = await biconomy.provider;
          const contractInstance = new ethers.Contract(
            config.peepIn,
            contract.abi,
            biconomy.ethersProvider
          );
          let { data } = await contractInstance.populateTransaction.editCompany(
            companyData.id, ipfsURI
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
          if (!result.transactionId) {
            toast({
              title: "Error",
              description: `Transaction was not successful`,
              status: "error",
              duration: 5000,
              isClosable: true,
              })
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
          });
          
          // write({
          //   args: [companyData.id, ratingValue, ipfsURI],
          //   from: address,
          //   value: 0,
          // })
    }
    setUploadingData(false);
    }

    const { data, isLoading, error, isError, isSuccess, write } = useContractWrite({
        address: config.peepIn,
        abi: contract.abi,
        functionName: 'submitReview',
      });
    
      const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
        confirmations: 1,
        hash: data?.hash,
      });

      useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Transaction successfully sent",
                description: "Adding your review on-chain.",
                status: "success",
                duration: 9000,
                isClosable: true,
                })
        }
        if (isLoading) {
            toast({
                title: "Sending request to wallet",
                description: "We're adding your review on-chain.",
                status: "info",
                duration: 9000,
                isClosable: true,
                })
        }
        if (isError) {
            toast({
                title: "Error",
                description: `${error.message}`,
                status: "error",
                duration: 9000,
                isClosable: true,
                })
        }
        console.log("___________");
      }, [data, isLoading, error, isError, isSuccess]);
    
      useEffect(() => {
        if (txSuccess) {
            toast({
                title: "Review added successfully",
                description: "We've added your review on-chain.",
                status: "success",
                duration: 9000,
                isClosable: true,
                })
                setRefresh(true);
            }
            onClose();
        if (txError) {
            toast({
                title: "Error",
                description: `${txError.message}`,
                status: "error",
                duration: 9000,
                isClosable: true,
                })
        }
        }, [txSuccess, txError]);

        useEffect(() => {
            if (hasReviewed) {
                setRatingValue(userReview.rating);
                setEmployeeValue(userReview.employee);
                setTitleValue(userReview.title);
                setReviewValue(userReview.review);
                setProsValue(userReview.pros);
                setConsValue(userReview.cons);
                setAdvicesValue(userReview.advices);
            }

        }, [hasReviewed]);

        useEffect(() => {
          if(companyData) {
            setCompanyName(companyData.name);
            setCompanyAddress(companyData.location_address);
            setCompanyWebsite(companyData.website);
            setCompanyPhone(companyData.phone);
            setCompanyEmail(companyData.email);
          }
        }, [companyData]);

        useEffect(() => {
          if (signer) {
            console.log("signer aya", signer);
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


    const OnSendEmail = (data) => {
        const mailtoLink = `mailto:${data}?subject=${encodeURIComponent("User query via PeepIn")}&body=${encodeURIComponent(
          `sent from PeepIn`
        )}`;
      
        window.location.href = mailtoLink;
      
        // Show success toast message
        toast({
          title: 'Email Client Opened',
          description: 'Enter your mail and you can send your query.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      };

      const submitReview = async () => {
        const data = {
            "company_id": companyData.id,
            "employee": employeeValue,
            "title": titleValue,
            "review": reviewValue,
            "pros": prosValue,
            "cons": consValue,
            "advices": advicesValue,
            "rating": ratingValue
        }
        // console.log("data", data);
        setUploadingReview(true);
        const ipfsURI = await uploadReview(data);
        console.log("ipfsURI", ipfsURI);
        if(!!ipfsURI){
            toast({
                title: 'Details uploaded on IPFS Successfully',
                description: 'Sign the transaction to add your review to the PeepIn',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
              await biconomy.init();
              const provider = await biconomy.provider;
              const contractInstance = new ethers.Contract(
                config.peepIn,
                contract.abi,
                biconomy.ethersProvider
              );
              let { data } = await contractInstance.populateTransaction.submitReview(
                companyData.id, ratingValue, ipfsURI
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
              if (!result.transactionId) {
                toast({
                  title: "Error",
                  description: `Transaction was not successful`,
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  })
              }
              biconomy.on("txHashGenerated", (data) => {
                console.log(data);
                toast({
                  title: "Transaction successfully sent",
                  description: "Adding your review on-chain.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                  position:"top"
                  })
              });
              
              biconomy.on("txMined", (data) => {
                console.log(data);
                toast({
                  title: "Review Added",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                  position:"top"
                  })
                  onClose();
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
              });
              
              // write({
              //   args: [companyData.id, ratingValue, ipfsURI],
              //   from: address,
              //   value: 0,
              // })
        }
        setUploadingReview(false);
      };

return (
    <Card
    direction={{ base: 'column', sm: 'row' }}
    overflow='hidden'
    variant='outline'
    m={10}
    mt={"4em"}
    >
    <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={companyData.logo}
        fallbackSrc='https://bafybeigfdg3vsjea2r5f2o2zjq2bisswt3cynt7i2mybzu3s5j4yj5zoqe.ipfs.w3s.link/Screenshot%202023-07-25%20at%202.01.52%20PM.png'
        alt={companyData.name}
    />

    <Stack>
        <CardBody>
            <span>

            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                <Heading size='lg'>{companyData.name}</Heading>
                <Heading size='md'>

                    <Rating 
                    initialRating={Number(companyData.avgRating)/RATING_PRECISION} 
                    fractions={3} 
                    quiet={true} 
                    readOnly={true}
                    emptySymbol={<StarIcon color={"gray.400"} />}
                    fullSymbol={<StarIcon color={"yellow.400"} />}
                    onHover={()=>{}}
                     />
                    ({ Number(companyData.avgRating)/RATING_PRECISION })
                </Heading>
            </Grid>

        <Heading size='sm' >
            <Link href={companyData.website} target='_blank' isExternal>
                {companyData.website} <ExternalLinkIcon mx='1px' />
            </Link>
        </Heading>
        <Heading size='sm' float={'right'}></Heading>
        </span>
        <Text py='2'>
            Phone: {companyData.phone}
            <br />
            Address: {companyData.location_address}
            <br />
            OwnerWallet: <a href={`https://mumbai.polygonscan.com/address/${companyData.wallet_address}`} target='_blank'>{companyData.wallet_address}</a>
        </Text>
        </CardBody>

        <CardFooter>
        <Grid templateColumns="repeat(3, 1fr)" gap={10}>
            <Button variant='ghost' float={'left'} colorScheme='yellow' onClick={()=>OnSendEmail(companyData.email)}>
                Email
            </Button>
            <Button variant='solid' float={'right'} colorScheme='yellow' onClick={onOpen} >
              {
                hasReviewed ? "Edit Review" : "Add Review"
              }
                <Icon as={FaPencilAlt} ml={2} />
            </Button>
            {
              companyData.wallet_address===address && (
                <Button leftIcon={<EditIcon />} variant='solid' float={'right'} colorScheme='yellow' onClick={drawer.onOpen}>
                  Edit Details
                </Button>
              )
            }
        </Grid>
        </CardFooter>
    </Stack>
    <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        size={'xl'}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Company Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
                <FormLabel>Rating</FormLabel>
                <ReactStars 
                    count={5}
                    size={24}
                    color2={'#ffd700'}
                    half={false}
                    onChange={newValue => setRatingValue(newValue)}
                    value={ratingValue}
                />
            
            </FormControl>
            <Text mt={4}>Are you a current or former employee?</Text>
            <RadioGroup onChange={setEmployeeValue} 
              value={employeeValue} 
              m={3}>
                <Stack direction="row">
                    <Radio value="current">Current Employee</Radio>
                    <Radio value="former">Former Employee</Radio>
                </Stack>
            </RadioGroup>

            <FormControl mt={4}>
              <FormLabel>Job title</FormLabel>
              <Input ref={initialRef} value={titleValue} onChange={e => setTitleValue(e.target.value)} placeholder={`What ${employeeValue=="former"?'was':'is'} your title?`} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Review</FormLabel>
              <Textarea value={reviewValue} onChange={e => setReviewValue(e.target.value)} placeholder='Enter Review' />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Pros</FormLabel>
              <Textarea value={prosValue} onChange={e => setProsValue(e.target.value)} placeholder={`What ${employeeValue=="former"?'were':'are'} the pros?`} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Cons</FormLabel>
              <Textarea value={consValue} onChange={e => setConsValue(e.target.value)} placeholder={`What ${employeeValue=="former"?'were':'are'} the cons?`} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Any Advices</FormLabel>
              <Input value={advicesValue} onChange={e => setAdvicesValue(e.target.value)} placeholder='Enter any advice you have' />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={submitReview} isLoading={uploadingReview}>
              {hasReviewed?"ReSubmit":"Submit"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Drawer
        isOpen={drawer.isOpen}
        placement='right'
        initialFocusRef={firstField}
        onClose={drawer.onClose}
        size={'md'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>
            Edit Company Details
          </DrawerHeader>

          <DrawerBody>
            <Stack spacing='24px'>
              <Box>
              <FormLabel htmlFor="name">Company Logo</FormLabel>
              <FileUploader 
                handleChange={handleChange} 
                name="file" 
                types={fileTypes} 
                />
                {
                imageUpload ? <Spinner />:''
                }
              
                {
                    imageIPFS ? <Image src={imageIPFS} width={"20"} height={"20"} />:
                    <Image src={companyData.logo} width={"20"} height={"20"} />
                }
              </Box>
              <Box>
                <FormLabel htmlFor='name'>Company Name</FormLabel>
                <Input
                  ref={firstField}
                  id='name'
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder='Please enter company name'
                />
              </Box>

              <Box>
                <FormLabel htmlFor='url'>Url</FormLabel>
                <InputGroup>
                  <Input
                    type='url'
                    id='url'
                    value={companyWebsite}
                    onChange={e => setCompanyWebsite(e.target.value)}
                    placeholder='Please enter company website'
                  />
                  
                </InputGroup>
              </Box>
              <Box>
                <FormLabel htmlFor='phone'>Phone No</FormLabel>
                <Input
                  id='phone'
                  value={companyPhone}
                  onChange={e=>setCompanyPhone(e.target.value)}
                  placeholder='Please enter company phone'
                />
              </Box>
              <Box>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <Input
                  id='email'
                  value={companyEmail}
                  onChange={e=>setCompanyEmail(e.target.value)}
                  placeholder='Please enter company email'
                />
              </Box>
              <Box>
                <FormLabel htmlFor='desc'>Address</FormLabel>
                <Textarea id='desc' onChange={e=>setCompanyAddress(e.target.value)} value={companyAddress} />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth='1px'>
            <Button variant='outline' mr={3} onClick={drawer.onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={onSubmit} isLoading={uploadingData}>Submit</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Card>
)
}
export default CompanyCard;
