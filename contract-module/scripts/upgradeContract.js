// scripts/upgradeProxy.js
const { ethers, upgrades } = require("hardhat");
var file = require("./config.json");
async function main() {
  const PeepIn = await ethers.getContractFactory("PeepInContract");
  const contract = await upgrades.upgradeProxy(file.peepIn, PeepIn, [
    process.env.TRUSTED_FORWARDER_ADDRESS,
  ]);
  console.log("contract upgraded", contract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
