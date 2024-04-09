import { Component, ChangeDetectorRef } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { web3WalletABI } from '../../assets/public/ContractABIs'
import { getDefaultProvider, ethers } from 'ethers'
import {
  createClient,
  connect,
  disconnect,
  getAccount,
  InjectedConnector
} from '@wagmi/core'
const { ethereum } = window
const BankAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})

@Component({
  selector: 'app-wallet-web3',
  templateUrl: './wallet-web3.component.html',
  styleUrls: ['./wallet-web3.component.scss']
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
      const transaction = await contract.ethdeposit(this.metamaskAddress, {
        value: ethers.utils.parseEther(depositAmount)
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const txConfirmation = await transaction.wait()
      this.getUserEthBalance()
    } catch (error) {
      this.errorMessage = error.message
    }
  }

  async withdrawETH () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(BankAddress, web3WalletABI, signer)
      const withdrawalAmount = this.inputAmount.toString()
      const transaction = await contract.withdraw(
        ethers.utils.parseEther(withdrawalAmount)
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const txConfirmation = await transaction.wait()
      this.getUserEthBalance()
    } catch (error) {
      this.errorMessage = error.message
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
    } catch (error) {
      this.errorMessage = error.message
    }
  }

  async handleAuth () {
    try {
      const { isConnected } = getAccount()

      if (isConnected) {
        await disconnect()
      }
      if (!window.ethereum) {
        this.snackBarHelperService.open('PLEASE_INSTALL_WEB3_WALLET', 'errorBar')
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
        this.snackBarHelperService.open('PLEASE_CONNECT_TO_SEPOLIA_NETWORK', 'errorBar')
      } else {
        this.session = true
        this.getUserEthBalance()
      }
      this.changeDetectorRef.detectChanges()
    } catch (err) {
      console.log(err)
    }
  }
}
