import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import {
  BeeFaucetABI,
  BeeTokenABI,
  nftABI
} from '../../assets/private/ContractABIs'
import { getDefaultProvider, ethers, BigNumber } from 'ethers'
import {
  createClient,
  connect,
  disconnect,
  getAccount,
  signMessage,
  InjectedConnector
} from '@wagmi/core'

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})
const { ethereum } = window

const nftAddress = '0x5FDDEbB5bE5d2C2dfB2c758ED86D3E6A53366107'
const BeeTokenAddress = '0x36435796Ca9be2bf150CE0dECc2D8Fab5C4d6E13'
const BeeFaucetAddress = '0x860e3616aD0E0dEDc23352891f3E10C4131EA5BC'

@Component({
  selector: "app-faucet",
  templateUrl: "./faucet.component.html",
  styleUrls: ["./faucet.component.scss"],
})
export class FaucetComponent {
  constructor (
    private readonly keysService: KeysService,
    private readonly snackBarHelperService: SnackBarHelperService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  userData: object
  session = false
  deployedContractAddress = ''
  BEEBalance = 0
  myBEEBalance = 0
  withdrawAmount: number = null
  successResponse = false
  mintButtonDisabled = true
  challengeSolved = false
  nftMintText = 'Mint the Pot - 1000 BEE'
  errorMessage = ''

  ngOnInit (): void {
    this.handleAuth()
    this.fetchBeeBalance()
    this.fetchMyBeeBalance()
    this.checkNftMinted()
    window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))
  }

  checkNftMinted () {
    this.keysService.checkNftMinted().subscribe(
      (response) => {
        console.log(response.status, 'res')
        this.mintButtonDisabled = response.status
        this.challengeSolved = response.status
        if (response.status) {
          this.nftMintText = 'Minted Successfully'
        }
      },
      (error) => {
        console.error(error)
        this.successResponse = false
      }
    )
  }

  async fetchMyBeeBalance () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(
        BeeTokenAddress,
        BeeTokenABI,
        signer
      )
      const userAddress = await signer.getAddress()
      const balanceBigNumber: BigNumber = await contract.balanceOf(userAddress)
      console.log(balanceBigNumber)
      this.myBEEBalance = balanceBigNumber
        .div(ethers.constants.WeiPerEther)
        .toNumber()
      if (this.myBEEBalance >= 1000 && !this.challengeSolved) {
        this.mintButtonDisabled = false
      }
      if (this.myBEEBalance <= 1000 && !this.challengeSolved) {
        this.mintButtonDisabled = true
      }
    } catch (error) {
      console.error('Error fetching BEE balance:', error)
    }
  }

  async fetchBeeBalance () {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(
        BeeFaucetAddress,
        BeeFaucetABI,
        signer
      )
      const balance = await contract.balance()
      console.log(balance)
      this.BEEBalance = balance
    } catch (error) {
      console.error('Error fetching BEE balance:', error)
    }
  }

  async handleChainChanged (chainId: string) {
    await this.handleAuth()
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
      // console.log('pp', window.ethereum.chainId)
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
        await this.fetchBeeBalance()
        await this.fetchMyBeeBalance()
      }
      console.log('session', this.session)
      this.changeDetectorRef.detectChanges()
    } catch (err) {
      console.log('An error occured')
    }
  }

  async extractBEETokens (amount = this.withdrawAmount) {
    if (!this.session) {
      this.snackBarHelperService.open(
        'Please connect your web3 wallet first.',
        'errorBar'
      )
      return
    }
    try {
      if (amount < 0) {
        this.errorMessage = 'You could do better than the usual web2 primitve'
        return
      }
      if (amount > 255) {
        this.errorMessage = 'Uh Oh! looks like we cannot handle that.'
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const userAddress = await signer.getAddress()

      const balanceBigNumber = await provider.getBalance(userAddress)

      const balanceEth = ethers.utils.formatEther(balanceBigNumber)

      console.log('ETH balance:', balanceEth, typeof balanceEth)
      if (balanceEth < '0.001') {
        this.snackBarHelperService.open(
          'Deposit some test ETH from sepoliafaucet.com or any other ETH faucet to initiate transaction',
          'errorBar'
        )
        return
      }
      const contract = new ethers.Contract(
        BeeFaucetAddress,
        BeeFaucetABI,
        signer
      )
      const tx = await contract.withdraw(amount)
      await tx.wait()

      console.log('BEE tokens extracted successfully')
      this.fetchBeeBalance()
      this.fetchMyBeeBalance()
    } catch (error) {
      console.error('Error extracting BEEs:', error)
    }
  }

  async mintNFT () {
    if (!this.session) {
      this.snackBarHelperService.open(
        'Please connect your web3 wallet first.',
        'errorBar'
      )
      return
    }
    this.nftMintText = 'Awaiting Approval'
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const amountToApprove = ethers.utils.parseUnits('1000', '18')
      const BeeTokenContract = new ethers.Contract(
        BeeTokenAddress,
        BeeTokenABI,
        signer
      )
      const approvalTx = await BeeTokenContract.approve(
        nftAddress,
        amountToApprove
      )

      await approvalTx.wait()
      this.nftMintText = 'Confirm Mint...'

      const contract = new ethers.Contract(nftAddress, nftABI, signer)

      const transaction = await contract.mintNFT()
      console.log(transaction)
      this.nftMintText = 'Mint in Process...'

      const mintConfirmation = await transaction.wait()
      console.log(mintConfirmation)
      if (mintConfirmation) {
        this.nftMintText = 'Successfully Minted'
        this.mintButtonDisabled = false

        this.keysService.nftMinted().subscribe(
          (response) => {
            this.successResponse = response.status
          },
          (error) => {
            console.error(error)
            this.successResponse = false
          }
        )
      }

      console.log('NFT minted successfully!')
    } catch (error) {
      console.error('Error minting NFT:', error)
    }
  }

  async signOut () {
    await disconnect()
    this.session = false
  }
}
