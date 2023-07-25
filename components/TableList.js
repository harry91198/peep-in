import React from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    useColorModeValue,
    Avatar,
    Link
  } from '@chakra-ui/react'

  import {StarIcon} from '@chakra-ui/icons'
  import { useRouter } from 'next/router';
  import RATING_PRECISION from "../lib/constants";
import Rating from 'react-rating';

// Function to calculate the Levenshtein distance between two strings
function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
  
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0) dp[i][j] = j;
        else if (j === 0) dp[i][j] = i;
        else if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
  
    return dp[m][n];
}

const TableList = ({data, searchTerm}) => {
    const router = useRouter();

    const sortedData = [...data].sort((a, b) => {
        const distanceA = levenshteinDistance(searchTerm.toLowerCase(), a.name.toLowerCase());
        const distanceB = levenshteinDistance(searchTerm.toLowerCase(), b.name.toLowerCase());
        return distanceA - distanceB;
      });

    return (
        <TableContainer>
        <Table variant='striped' colorScheme='yellow'>
            {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
            <Thead>
            <Tr>
                <Th></Th>
                <Th>Name</Th>
                <Th>Website</Th>
                <Th>Rating</Th>
            </Tr>
            </Thead>
            <Tbody>
                {
                    sortedData.map((item, index) => {
                        return (
                            <Tr key={index} onClick={()=>router.push({
                                pathname: `/company/${item.id}`,
                              }, undefined, { shallow: true }
                            )}>
                                <Td>
                                    <Avatar size={"sm"} src={item.logo} name={item.name} />
                                </Td>
                                <Td>{item.name}</Td>
                                <Td>{item.website}</Td>
                                <Td>
                                    <Rating 
                                    initialRating={Number(item.avgRating)/RATING_PRECISION} 
                                    fractions={3} 
                                    quiet={true} 
                                    readOnly={true}
                                    emptySymbol={<StarIcon color={"gray.400"} />}
                                    fullSymbol={<StarIcon color={"yellow.400"} />}
                                    onHover={()=>{}}
                                    />
                                </Td>
                            </Tr>
                        )
                    }
                    )
                }

            </Tbody>
        </Table>
        </TableContainer>
    );
};

export default TableList;