import { useEffect, useState } from "react";
import config from '../../contract-module/scripts/config.json';
import contract from '../../contract-module/artifacts/contracts/PeepInContract.sol/PeepInContract.json';

import { useContractWrite, useAccount, useContractRead } from 'wagmi'

export default function useOwner() {
  const { data, isError, isLoading } = useContractRead({
    address: config.peepIn,
    abi: contract.abi,
    functionName: 'owner',
  })
  console.log("data", data, isError, isLoading);

  return {
    data,
    isError,
    isLoading
  };
}