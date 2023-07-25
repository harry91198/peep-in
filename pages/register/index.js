import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { use, useEffect, useState } from 'react';
import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';
import { set, useForm } from 'react-hook-form';
// import Image from "next/image";
import { 
    Image,
    Heading, Box, FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Textarea,
    Button,
    useToast,
    useColorMode,
    useColorModeValue, 
    Spinner} from "@chakra-ui/react";
import FloatingButton from "../../components/FloatingButton";

import { Web3Storage } from 'web3.storage'


import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "JPEG", "PNG"];

import { useAccount, useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import useOwner from "../../lib/hooks/useOwner";

// TODO: add ESG score also

const uploadImage = async(files) => {
    try{
        const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN })
        const cid = await client.put([files])
        const encodedURI = encodeURI(`https://dweb.link/ipfs/${cid}/${files.name}`)
        return encodedURI;
        // let totalBytes = 0
        // for await (const upload of client.list()) {
        //   console.log(`> 📄 ${upload.cid}  ${upload.name}`)
        //   totalBytes += upload.dagSize || 0
        // }
        // console.log(`> ⁂ ${totalBytes.toLocaleString()} bytes stored!`)
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

export default function Register() {
  const { address } = useAccount();
  const { colorMode, toggleColorMode } = useColorMode();
  const { handleSubmit, register, reset } = useForm();
  const [submittingForm, setSubmittingForm] = useState(false);
  const toast = useToast();

  const info = useOwner();

  const { data, isLoading, error, isError, isSuccess, write } = useContractWrite({
    address: config.peepIn,
    abi: contract.abi,
    functionName: 'addCompany',
  });

  const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
  });

  useEffect(() => {
    if (isSuccess) {
        toast({
            title: "Transaction successfully sent",
            description: "Adding your company on-chain.",
            status: "success",
            duration: 9000,
            isClosable: true,
            })
        reset();
    }
    if (isLoading) {
        toast({
            title: "Sending request to wallet",
            description: "We're adding your company on-chain.",
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
            title: "Company added successfully",
            description: "We've added your company on-chain.",
            status: "success",
            duration: 9000,
            isClosable: true,
            })
        }
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


  const handleInputChange = (e) => setInput(e.target.value)

  const [dataUpload, setDataUpload] = useState(false);
  const [imageUpload, setImageUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [dataIPFS, setDataIPFS] = useState(null);
  const [imageIPFS, setImageIPFS] = useState(null);
  const handleChange = async(file) => {
    setImageUpload(true);
    const ipfsURI = await uploadImage(file);
    console.log("ipfsURI", ipfsURI);
    setImageIPFS(ipfsURI);
    setImageUpload(false);
  };

  const OnSendEmail = (data) => {
    const mailtoLink = `mailto:${data.myId}?subject=${encodeURIComponent("Register our company on PeepIn")}&body=${encodeURIComponent(
      `To address: ${data.wallet_address} \n
      Metadata URI: ${data.ipfsURI} \n
      sent from PeepIn`
    )}`;
  
    window.location.href = mailtoLink;
  
    // Show success toast message
    toast({
      title: 'Email Client Opened',
      description: 'Enter your mail and you can send your details.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };


const onSubmit = async(data) => {
    try {
    //   setSubmittingForm(true);
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    //   });
    data.logo = imageIPFS;
    setDataUpload(true)
    const ipfsURI = await uploadData(data);
    console.log("ipfsURI", ipfsURI);
    setDataIPFS(ipfsURI);
    setDataUpload(false);
    
    if (info.data == address){
        toast({
          title: 'Details uploaded on IPFS Successfully',
          description: 'Sign the transaction to add your company to the PeepIn',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

          write({
            args: [data.wallet_address, ipfsURI],
            from: address,
            value: 0,
          })

    }else{
      // send all data.wallet_address and ifpsURI to admin via email
      OnSendEmail({
        myId: 'harshparashar1998@gmail.com',
        wallet_address: data.wallet_address, 
        ipfsURI: ipfsURI});

        toast({
            title: 'Details uploaded on IPFS Successfully',
            description: 'Admin will verify your details and add your company to the PeepIn',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
    }
    setImageIPFS(null);

    } catch (error) {
      setSubmittingForm(false);
      setDataUpload(false);
      console.error('Error sending email:', error);
    }
  };


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
      <Heading as="h1" size="2xl" m={"1rem"}>
        Register your company
      </Heading>
      <Box maxW='40rem' as="form" m={"20px"} onSubmit={handleSubmit(onSubmit)}
        // backgroundColor={useColorModeValue('rgba(0 0 0 0.5)', 'rgba(0 0 0 0.5)')}
        backgroundColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        // textColor={'white'}
        // opacity={0.5}
        borderRadius={8}
        padding={3}

        >
        <div >
            
        </div>
        
          <FormControl marginBottom={2}>
          <FormLabel htmlFor="name">Company Logo</FormLabel>
          <span>
          <FileUploader 
            handleChange={handleChange} 
            name="file" 
            types={fileTypes} 
            />
            {
                imageUpload ? <Spinner />:''
            }
            </span>
            {
                imageIPFS ? <Image src={imageIPFS} width={"20"} height={"20"} />:''
            }
            
            <FormLabel htmlFor="name">Company Name</FormLabel>
            <Input type="text" id="name" {...register('name', { required: true })} />
          </FormControl>
          <FormControl marginBottom={2}>
            <FormLabel htmlFor="phone">Phone</FormLabel>
            <Input type="text" id="phone" {...register('phone', { required: true })} />
            </FormControl>
            <FormControl marginBottom={2}>
            <FormLabel htmlFor="website">Website</FormLabel>
            <Input type="text" id="website" {...register('website', { required: true })} />
            </FormControl>
          <FormControl marginBottom={2}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input type="email" id="email" {...register('email', { required: true })} />
          </FormControl>
          <FormControl marginBottom={2}>
            <FormLabel htmlFor="location_address">Location Address</FormLabel>
            <Input type="text" id="location_address" {...register('location_address', { required: true })} />
          </FormControl>
          <FormControl marginBottom={2}>
            <FormLabel htmlFor="wallet_address">Wallet Address</FormLabel>
      
            <Input type="text" id="wallet_address"  onChange={handleInputChange} {...register('wallet_address', { required: true })} />
          </FormControl>
          {/* <FormControl marginBottom={2}>
            <FormLabel htmlFor="message">Message</FormLabel>
            <Textarea id="message" {...register('message', { required: true })} />
          </FormControl> */}
          <Button type="submit" size='md' colorScheme='yellow' mt='12px' isLoading={dataUpload}>
            Send
            </Button>
        </Box>

      <FloatingButton onClick={toggleColorMode} />
    </div>
  );
}
