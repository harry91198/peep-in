import { useEffect, useState } from "react";
import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';

import { useContractWrite, useAccount, useContractRead, useContractReads } from 'wagmi'

export default function useGetCompany(i) {
  let allData = {
    id: "",
    metadata: "",
    avgRating: 0
  };
    // if(!!i){

    const { data: comData, isError: comError, isLoading: comLoading } = useContractReads({
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
    if(comData){
      allData = {id: i, metadata: comData[0].result, avgRating: comData[1].result}
      return {
        allData
      };
    }
    
    // }
  return {
    allData
  };
}