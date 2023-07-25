import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Box, Center, Heading, Highlight, Input, InputGroup, InputLeftElement, InputRightAddon, InputRightElement, SimpleGrid, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import FloatingButton from "../components/FloatingButton";
import { SearchIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from "react";
import useCompanyData from "../lib/hooks/useCompanyData";
import TableList from "../components/TableList";


// TODO: add ESG score also

export default function Home(props) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [onFocus, setOnFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyMetadata, setCompanyMetadata] = useState([]);
  const companyData = useCompanyData();
  useEffect(() => {
    async function getCompanyData(){
      if(companyData.allData){
        let temp = [];
      for(let i=0;i<companyData.allData.length;i++){
        const metadataLink = companyData.allData[i].metadata;
        const metadata = await fetch(metadataLink);
        const metadataJson = await metadata.json();
        const thisCompanyData = {...metadataJson, avgRating: companyData.allData[i].avgRating, id: companyData.allData[i].id};
        temp.push(thisCompanyData);
      }
      setCompanyMetadata(temp);
    }    
  }
  getCompanyData();
  }, [onFocus]);

  const searchBarVariants = {
    hidden: { y: '-100%' },
    visible: { y: 0, transition: { duration: 0.3 } },
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
      {onFocus?null:
      <div>
        <Heading as="h1" size="2xl" m={"2rem"} align={"center"}>
        Welcome to <span style={{
          color: useColorModeValue("#ffe53d", "#ffe53d")
        }}>PeepIn</span>
      </Heading>
      <Heading size="lg" m={"1rem"} align={"center"}>
        No. 1 Decentralized app to put & get company reviews and ratings
      </Heading>
      </div>
      }
      {onFocus?null:
      <SimpleGrid columns={2} spacing={10} m={5} minChildWidth='450px'>
        <Box p={5} shadow="sm" flex="1" borderRadius="md">
          <Text fontSize="lg" m={"1rem"}>
            <Highlight
              query={['reviews', 'ratings', 'insights']}
              styles={{px:'2', py: '1', rounded: 'full', bg: 'yellow.400'}}
            >
          Peek into your next workplace like never before! 
          PeepIn is your go-to platform for legit reviews, ratings, and insider insights 
          into the companies and offices that makes up for professional universe.
            </Highlight>
          </Text>
        </Box>
        <Box p={5}  flex="1" borderRadius="md">
          <Text  size="lg" m={"1rem"}>
           
          </Text>
        </Box>
      </SimpleGrid>
      }

      <InputGroup 
          as={motion.div} 
          position="sticky"
          // top="0"
          zIndex="1"
          mx="auto"
          my="4"
          width="80%"
          drag='x'
          dragConstraints={{ left: -100, right: 100 }}
          transition='0.5s linear'
          size="lg" >
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input 
          placeholder="Search for company..." 
          colorScheme="yellow" 
          // onFocus={()=>setOnFocus(true)}
          onChange={(e)=>setSearchTerm(e.target.value)}
          // onChange={(e)=>setCompanyMetadata(companyMetadata.filter((company)=>company.name.toLowerCase().includes(e.target.value.toLowerCase())))}
          onFocusCapture={()=>setOnFocus(true)}
          
        />
        <InputRightElement>
        <SmallCloseIcon color='gray.300' cursor={'pointer'} onClick={()=>setOnFocus(false)} />
        </InputRightElement>
      </InputGroup>

      {
        onFocus?null:
        <>
        <SimpleGrid columns={2} spacing={10} m={5} minChildWidth='450px'>
        <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Heading as="h2" size="lg" m={"1rem"}>
            What is PeepIn?
          </Heading>
          <Text m={"1rem"}>
          PeepIn is an innovative platform that allows users 
          to explore and share candid reviews, ratings, and genuine insights 
          about companies and workplaces. PeepIn aims to bring transparency, authenticity 
          and decentralization by empowering users to share their honest thoughts 
          and valuable perspectives.
          </Text>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Heading as="h2" size="lg" m={"1rem"}>
            Why PeepIn?
          </Heading>
          <Text m={"1rem"}>
          Because Honesty is the Best Policy!
          With peepIn, we believe in bringing transparency to the 
          corporate realm, Our platform is where professionals 
          like you share their unfiltered thoughts, without any fear or worries.
          </Text>
        </Box>
        
      </SimpleGrid>
      <Text fontSize="lg" m={"1rem"} align={'center'}>
      While we thrive on honesty, We foster a positive environment where constructive feedback 
      is welcomed and encouraged. Our platform is dedicated to providing a supportive space for
       users to share their experiences and insights with the power of anonymity.
       <br />
       Together, let's build a hub of support and collaboration while maintaining a culture of respect and professionalism 💪
      </Text>
      </>
      }

      {
        onFocus?<TableList data={companyMetadata} searchTerm={searchTerm} />:null
      }


      
      


      <FloatingButton onClick={toggleColorMode} />
    </div>
  );
}
