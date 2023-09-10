// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BeeFaucet {
    Token public token = Token(0x36435796Ca9be2bf150CE0dECc2D8Fab5C4d6E13);
    uint8 public balance = 200;

    function withdraw(uint8 amount) public {
        balance -= amount;
        require(balance >= 0, "Withdrew more than the account balance!");
        token.transfer(msg.sender, uint256(amount) * 1000000000000000000);
    }

    function getBalance() public view returns (uint8) {
        return balance;
    }
}
