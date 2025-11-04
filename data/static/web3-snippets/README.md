# Web3 Smart Contract Snippets

This directory contains Solidity smart contracts used for Web3 hacking challenges in OWASP Juice Shop.

## Purpose

These smart contracts serve two purposes:

1. **"Find It" Phase**: The contracts are parsed to extract code snippets with vulnerability markers for the coding challenge interface
2. **Source of Truth**: These contracts represent the actual vulnerable implementations used in the Web3 challenges

## Vulnerability Markers

Contracts use special comment markers to indicate vulnerable and neutral lines:

```solidity
// vuln-code-snippet start challengeKey
// ... contract code ...
balances[msg.sender] -= _amount; // vuln-code-snippet vuln-line challengeKey
// ... more code ...
// vuln-code-snippet end challengeKey
```

### Marker Types:

- `// vuln-code-snippet start <key>` - Marks the beginning of a code snippet
- `// vuln-code-snippet end <key>` - Marks the end of a code snippet
- `// vuln-code-snippet vuln-line <key>` - Marks a line containing a vulnerability
- `// vuln-code-snippet neutral-line <key>` - Marks a neutral line (for context)
- `// vuln-code-snippet hide-line` - Hides a line from the displayed snippet
- `// vuln-code-snippet hide-start` / `hide-end` - Hides a block of lines

## Contracts

### ETHWalletBank.sol
**Challenge**: `web3WalletChallenge`  
**Vulnerability**: Reentrancy attack  
**Description**: A wallet contract that allows deposits and withdrawals. The vulnerability is in the `withdraw` function where the balance is updated AFTER the external call, allowing reentrancy attacks.

### HoneyPotNFT.sol
**Challenge**: `nftMintChallenge`  
**Vulnerability**: Reentrancy during minting  
**Description**: An NFT contract where `totalSupply` is incremented after `_safeMint`, potentially allowing reentrancy attacks during the mint callback.

### JuiceShopSBT.sol
**Challenge**: `nftUnlockChallenge`  
**Vulnerability**: None (secure contract, challenge is about exposed seed phrase)  
**Description**: A Soul Bound Token (SBT) that cannot be transferred after minting. The challenge is about finding the accidentally exposed wallet seed phrase, not a contract vulnerability.

### BEEToken.sol
**Challenge**: Supporting contract for NFT minting  
**Description**: An ERC20 token used as payment for minting HoneyPot NFTs.

### BeeFaucet.sol
**Challenge**: Supporting contract for token distribution  
**Description**: A faucet contract for distributing BEE tokens.

## Syncing Contracts

### Automatic Sync from web3-contracts Repository

To keep contracts synchronized with the upstream repository:

```bash
npm run sync:web3-contracts
```

This script:
1. Fetches the latest contracts from `https://github.com/juice-shop/web3-contracts`
2. Compares with local versions
3. Updates only changed files
4. Preserves vulnerability markers from the upstream repository

### Manual Updates

If you need to manually update a contract:

1. Ensure vulnerability markers are properly placed
2. Update the corresponding fix options in `data/static/codefixes/`
3. Update the `.info.yml` file with proper explanations and hints

## Fix Options

For each Web3 challenge with a smart contract vulnerability, there should be:

1. **Original contract** in this directory (with vuln markers)
2. **3-4 fix options** in `data/static/codefixes/` directory:
   - `<challengeKey>_1.sol` - Incorrect fix option 1
   - `<challengeKey>_2.sol` - Incorrect fix option 2
   - `<challengeKey>_3_correct.sol` - Correct fix
   - `<challengeKey>_4.sol` - Incorrect fix option 3
3. **Info file** at `data/static/codefixes/<challengeKey>.info.yml` with:
   - Explanations for each fix option
   - Hints for finding the vulnerability

## Adding New Web3 Challenges

To add a new Web3 challenge:

1. **Add the contract** to this directory with vulnerability markers
2. **Create fix options** in `data/static/codefixes/`:
   ```
   newChallenge_1.sol
   newChallenge_2.sol
   newChallenge_3_correct.sol
   newChallenge_4.sol
   ```
3. **Create info file** at `data/static/codefixes/newChallenge.info.yml`:
   ```yaml
   fixes:
     - id: 1
       explanation: 'Why this fix is wrong...'
     - id: 2
       explanation: 'Why this fix is wrong...'
     - id: 3
       explanation: 'Why this is the correct fix...'
     - id: 4
       explanation: 'Why this fix is wrong...'
   hints:
     - 'First hint...'
     - 'Second hint...'
     - 'Third hint...'
   ```
4. **Update challenges.yml** to link the hacking challenge with the coding challenge

## Best Practices

1. **Keep markers in sync**: When updating contracts from web3-contracts repo, ensure vulnerability markers are preserved
2. **Diverse fix options**: Make fix options meaningfully different, not just cosmetic changes
3. **Educational explanations**: Write clear explanations that teach the vulnerability and proper fix
4. **Test contracts**: Ensure contracts compile and work as expected
5. **Follow Solidity best practices**: Use appropriate compiler versions and security patterns

## References

- [OWASP Juice Shop](https://github.com/juice-shop/juice-shop)
- [Web3 Contracts Repository](https://github.com/juice-shop/web3-contracts)
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
