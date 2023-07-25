import { useEffect, useState } from "react";
import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';

import { useContractWrite, useAccount, useContractRead, useContractReads } from 'wagmi'

export default function useCompanyData() {

  const { data: totalComData, isError: totalComError, isLoading: totalComLoading } = useContractRead({
    address: config.peepIn,
    abi: contract.abi,
    functionName: 'totalCom',
    watch: true
  })

  let allData = []
  if (totalComData) {

    for(let i = 1; i <= totalComData; i++){

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

        console.log("comData", comData, comError, comLoading);
        // get data from comData[0].result which is ipfs url
        // const data = await fetch(comData[0].result)
        // const metadata = await data.json()
        // console.log("metadata", metadata);
        if(comData){

        allData.push({id: i, metadata: comData[0].result, avgRating: comData[1].result})
        }

        // if(comData && avgRatingData){
        //     console.log("comData", comData, comError, comLoading);
        //     console.log("avgRatingData", avgRatingData, avgRatingError, avgRatingLoading);
        //     comData.avgRating = avgRatingData
        //     allData.push(comData)
        // }
    }
  }

  return {
    allData
  };
}