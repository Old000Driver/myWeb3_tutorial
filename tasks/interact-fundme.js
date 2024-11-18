const { task } = require("hardhat/confi g");

task("interact-contact")
  .addParam("addr", "fundme contact address")
  .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.addr);
    const [firstAccount, secondAccount] = await ethers.getSigners();

    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.005") });
    await fundTx.wait();

    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log("Balance of the contract is " + balanceOfContract);

    const fundTxWithSecondAccount = await fundMe
      .connect(secondAccount)
      .fund({ value: ethers.parseEther("0.005") });
    await fundTxWithSecondAccount.wait();

    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(
      fundMe.target
    );
    console.log(
      "Balance of the contract is " + balanceOfContractAfterSecondFund
    );

    const firstAccountbalanceInFundMe = await fundMe.funderToAmount(
      firstAccount.address
    );
    const secondAccountbalanceInFundMe = await fundMe.funderToAmount(
      secondAccount.address
    );
  });

module.exports = {};
