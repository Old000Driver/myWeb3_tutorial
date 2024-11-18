const { task } = require("hardhat/config");

task("deploy-fundme").setAction(async (taskArgs, hre) => {
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy(300);
  await fundMe.waitForDeployment();
  console.log(
    "contract has been deployed successfully, contract address is " +
      fundMe.target
  );
  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("waiting for 5 confirmations");
    await fundMe.deploymentTransaction().wait(5);
    await verifyFundeMe(fundMe.target, [300]);
  } else {
    console.log("verification skipped...");
  }
});

async function verifyFundeMe(address, constructorArguments) {
  await hre.run("verify:verify", {
    address,
    constructorArguments,
  });
}

module.exports = {};
