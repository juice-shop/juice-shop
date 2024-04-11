// SPDX-License-Identifier: MIT
// vuln-code-snippet start web3WalletChallenge
pragma solidity ^0.6.12;
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/math/SafeMath.sol';

contract ETHWalletBank {
  using SafeMath for uint256;

  mapping(address => uint) public balances;
  mapping(address => uint) public userWithdrawing;

  event ContractExploited(address indexed culprit);

  function ethdeposit(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    require(_amount <= 0.1 ether, "Withdrawal amount must be less than or equal to 0.1 ether");
    require(balances[msg.sender] >= _amount, "Insufficient balance");
    if (userWithdrawing[msg.sender] <= 1) {
      userWithdrawing[msg.sender] = userWithdrawing[msg.sender] + 1;
    } else {
      emit ContractExploited(tx.origin); // vuln-code-snippet hide-line
      userWithdrawing[msg.sender] = 0;
      return;
    }
    (bool result, ) = msg.sender.call{ value: _amount }("");
    require(result, "Withdrawal call failed");
    balances[msg.sender] -= _amount; // vuln-code-snippet vuln-line web3WalletChallenge
    if(userWithdrawing[msg.sender] == 2) // vuln-code-snippet hide-line
    { // vuln-code-snippet hide-line
      emit ContractExploited(tx.origin); // vuln-code-snippet hide-line
    } // vuln-code-snippet hide-line
    userWithdrawing[msg.sender] = 0;
  }

  receive() external payable {}
}
// vuln-code-snippet end web3WalletChallenge
