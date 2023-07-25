const { ethers } = require("hardhat");
const contractAddress = require("./config.json");

async function verifyContract() {
  try {
    await run("verify:verify", {
      constructorArguments: [],
      contract: "contracts/PeepInContract.sol:PeepInContract",
      address: contractAddress.peepIn,
    });
  } catch (err) {
    console.log("verify error: ", err);
  }
}

async function main() {
  console.log("starting verify");
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("blockNumber: ", blockNumber);
  await verifyContract();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
