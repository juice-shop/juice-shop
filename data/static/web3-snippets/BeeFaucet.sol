// vuln-marker: neutral
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// vuln-marker: neutral
interface Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// vuln-marker: vulnerable
contract BeeFaucet {
    // vuln-marker: neutral
    Token public token = Token(0x36435796Ca9be2bf150CE0dECc2D8Fab5C4d6E13);
    uint8 public balance = 200;

    // vuln-marker: vulnerable
    function withdraw(uint8 amount) public {
        balance -= amount; // ⚠️ Potential underflow vulnerability (unchecked subtraction)
        require(balance >= 0, "Withdrew more than the account balance!"); // This check comes too late
        token.transfer(msg.sender, uint256(amount) * 1e18); // ⚠️ Unprotected transfer (no reentrancy guard)
    }

    // vuln-marker: to-hide
    function getBalance() public view returns (uint8) {
        return balance;
    }
}
