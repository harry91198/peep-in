// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const fileName = "./scripts/config.json";
var file = require("./config.json");

async function main() {
  const PeepIn = await ethers.getContractFactory("PeepInContract");
  const contract = await upgrades.deployProxy(PeepIn, [
    process.env.TRUSTED_FORWARDER_ADDRESS,
  ]);
  await contract.deployed();
  console.log("PeepIn deployed to:", contract.address);
  file.peepIn = contract.address;
  fs.writeFileSync(
    fileName,
    JSON.stringify(file, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log("writing to " + fileName);
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
