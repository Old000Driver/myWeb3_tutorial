const { ethers } = require("hardhat");

async function main() {
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

  const [firstAccount, secondAccount] = await ethers.getSigners();

  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.005") });
  await fundTx.wait();

  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log("Balance of the contract is " + balanceOfContract);

  const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.005") });
  await fundTxWithSecondAccount.wait();

  const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
  console.log("Balance of the contract is " + balanceOfContractAfterSecondFund);

  const firstAccountbalanceInFundMe = await fundMe.funderToAmount(firstAccount.address)
  const secondAccountbalanceInFundMe = await fundMe.funderToAmount(secondAccount.address)  

}

async function verifyFundeMe(address, constructorArguments) {
  await hre.run("verify:verify", {
    address,
    constructorArguments,
  });
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
