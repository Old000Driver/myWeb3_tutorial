const { ethers } = require("hardhat");

async function main() {
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy(120);
  await fundMe.waitForDeployment();
  console.log(
    "contract has been deployed successfully, contract address is " +
      fundMe.target
  );
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
