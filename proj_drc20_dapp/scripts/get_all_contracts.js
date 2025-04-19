const { deployments } = require("hardhat");

async function listDeployedContracts() {
  const allDeployments = await deployments.all();
  console.log("Deployed contracts:", Object.keys(allDeployments));
}

listDeployedContracts();