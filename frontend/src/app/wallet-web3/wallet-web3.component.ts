import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { web3WalletABI } from '../../assets/public/ContractABIs'
import { getDefaultProvider, ethers, BigNumber } from 'ethers'
import {
  createClient,
  connect,
  disconnect,
  getAccount,
  signMessage,
  InjectedConnector
} from '@wagmi/core'
const { ethereum } = window
const BankAddress = '0x01C4940a077FfD53a494D1cF547cB5209875a173'
const attackerAddress = '0x85a48Dc8679760059a6eb5724C11cDC725A167A8'
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})
const attackerABI = [
  {
    inputs: [],
    name: 'attack',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'challenge',
    outputs: [
      {
        internalType: 'contract IReentrance',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    stateMutability: 'payable',
    type: 'receive'
  }
]

@Component({
  selector: "app-wallet-web3",
  templateUrl: "./wallet-web3.component.html",
  styleUrls: ["./wallet-web3.component.scss"],
})
export class WalletWeb3Component {
  constructor (
    private readonly keysService: KeysService,
    private readonly snackBarHelperService: SnackBarHelperService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  userData: object
  session = false
  walletBalance = '0'
  myBEEBalance = 0
  inputAmount: number = null
  successResponse = false
  mintButtonDisabled = true
  challengeSolved = false
  errorMessage = ''
  metamaskAddress = ''
  ngOnInit (): void {
    this.handleAuth()
    window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))
  }

  async handleChainChanged (chainId: string) {
    await this.handleAuth()
  }

  async depositETH () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(BankAddress, web3WalletABI, signer)
      const depositAmount = this.inputAmount.toString()
      console.log(depositAmount)
      const transaction = await contract.ethdeposit(this.metamaskAddress, {
        value: ethers.utils.parseEther(depositAmount)
      })
      const txConfirmation = await transaction.wait()
      console.log(txConfirmation)
      this.getUserEthBalance()
    } catch (error) {
      console.error('Error minting NFT:', error)
      this.errorMessage = error.message
    }
  }

  async withdrawETH () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(BankAddress, web3WalletABI, signer)
      const withdrawalAmount = this.inputAmount.toString()
      console.log(withdrawalAmount)
      const transaction = await contract.withdraw(
        ethers.utils.parseEther(withdrawalAmount)
      )
      const txConfirmation = await transaction.wait()
      console.log(txConfirmation)
      this.getUserEthBalance()
    } catch (error) {
      console.error('Error minting NFT:', error)
      this.errorMessage = error.message
    }
  }

  async attackBEE () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(
        attackerAddress,
        attackerABI,
        signer
      )
      const transaction = await contract.attack({
        value: ethers.utils.parseEther('0.1'),
        gasLimit: 5000000
      })
      console.log(transaction)

      const mintConfirmation = await transaction.wait()
      console.log(mintConfirmation)
    } catch (error) {
      console.error('Error minting NFT:', error)
    }
  }

  async getUserEthBalance () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(BankAddress, web3WalletABI, signer)
      const userBalance = await contract.balanceOf(this.metamaskAddress)
      const formattedBalance = ethers.utils.formatEther(userBalance)
      this.walletBalance = formattedBalance
      console.log(this.walletBalance)
    } catch (error) {
      console.error('Error fetching user Ethereum balance:', error)
    }
  }

  async handleAuth () {
    try {
      const { isConnected } = getAccount()

      if (isConnected) {
        await disconnect()
      }
      if (!window.ethereum) {
        this.snackBarHelperService.open(
          'Please install a Web3 Wallet like Metamask to proceed.',
          'errorBar'
        )
        return
      }

      const provider = await connect({ connector: new InjectedConnector() })
      this.metamaskAddress = provider.account
      this.keysService.walletAddressSend(this.metamaskAddress).subscribe(
        (response) => {
          if (response.success) {
            this.successResponse = response.status
            this.mintButtonDisabled = true
          }
        },
        (error) => {
          console.error(error)
          this.successResponse = false
        }
      )
      this.userData = {
        address: provider.account,
        chain: provider.chain.id,
        network: 'evm'
      }
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }
        ]
      })
      const targetChainId = '11155111'
      const currentChainId = String(provider.chain?.id)

      if (provider && currentChainId !== targetChainId) {
        this.session = false
        this.snackBarHelperService.open(
          'Please connect to the Sepolia Network',
          'errorBar'
        )
      } else {
        console.log('Should show ethereum chain now')
        this.session = true
        this.getUserEthBalance()
      }
      console.log('session', this.session)
      this.changeDetectorRef.detectChanges()
    } catch (err) {
      console.log(err)
      console.log('An error occured')
    }
  }
}
