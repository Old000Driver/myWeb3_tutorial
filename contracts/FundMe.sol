// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.创建一个收款函数
// 2.记录投资人并查看
// 3.达到目标值, 投资人可以提款
// 4.没有达到目标值, 投资人可以退款

contract FundMe {
    AggregatorV3Interface internal dataFeed;
    mapping(address => uint256) public funderToAmount;
    uint256 MINIMUM_VALUE = 100 * 10**18; // USD
    uint256 constant TARGET = 1000 * 10**18;
    uint256 deploymentTimestamp;
    uint256 lockTime;
    bool public getFundSuccess = false;

    address erc20Addr;

    address owner;

    constructor(uint256 _lockTime) {
        owner = msg.sender;
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(deploymentTimestamp + lockTime < block.timestamp,"window is closed");
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Sende more ETH");
        funderToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10**8);
    }

    function getFund() external windowClose onlyOwner{
        require(
            convertEthToUsd(address(this).balance) >= TARGET,
            "Target is not reached"
        );
        // payable(msg.sender).transfer(address(this).balance);
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(success, "transfer tx failed");
        funderToAmount[msg.sender] = 0;
        getFundSuccess = true;
    }

    function transferOwnership(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    function refund() external payable windowClose{
        
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is not reached"
        );
        require(funderToAmount[msg.sender] != 0, "this is no fund for you");
        bool success;
        (success, ) = payable(msg.sender).call{
            value: funderToAmount[msg.sender]
        }("");
        require(success, "transfer tx failed");
        funderToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "You do not have permission to call this function");
        funderToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    modifier windowClose(){ 
        require(deploymentTimestamp + lockTime > block.timestamp,"window is not closed");
        _;
    }

    modifier onlyOwner(){ 
       require(
            msg.sender == owner,
            "this function can only be called by owner"
        );
        _;
    }
}
