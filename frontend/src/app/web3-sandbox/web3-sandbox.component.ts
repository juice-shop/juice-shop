import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { getDefaultProvider, ethers } from 'ethers'
import {
  createClient,
  connect,
  disconnect,
  getAccount,
  InjectedConnector
} from '@wagmi/core'
import {
  solidityCompiler
} from 'solidity-browser-compiler'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'

import { MatButtonModule } from '@angular/material/button'
import { FormsModule } from '@angular/forms'
import { CodemirrorModule } from '@ctrl/ngx-codemirror'
import { MatIconModule } from '@angular/material/icon'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})
const { ethereum } = window
const compilerReleases = {
  '0.8.21': 'soljson-v0.8.21+commit.d9974bed.js',
  '0.8.9': 'soljson-v0.8.9+commit.e5eed63a.js',
  '0.7.6': 'soljson-v0.7.6+commit.7338295f.js',
  '0.6.12': 'soljson-v0.6.12+commit.27d51765.js',
  '0.5.17': 'soljson-v0.5.17+commit.d19bba13.js',
  '0.4.26': 'soljson-v0.4.26+commit.4563c3fc.js',
  '0.3.6': 'soljson-v0.3.6+commit.3fc68da5.js',
  '0.2.2': 'soljson-v0.2.2+commit.ef92f566.js',
  '0.1.7': 'soljson-v0.1.7+commit.b4e666cc.js'
}
@Component({
  selector: 'app-web3-sandbox',
  templateUrl: './web3-sandbox.component.html',
  styleUrls: ['./web3-sandbox.component.scss'],
  imports: [CodemirrorModule, FormsModule, MatButtonModule, MatIconModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule]
})
export class Web3SandboxComponent implements OnInit {
  private readonly keysService = inject(KeysService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);


  ngOnInit (): void {
    this.handleAuth()
    window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))
  }

  userData: object
  session = false
  metamaskAddress = ''
  selectedContractName: string
  compiledContracts = []
  deployedContractAddress = ''
  contractNames = []
  commonGweiValue = 0
  contractFunctions = []
  invokeOutput = ''
  selectedCompilerVersion = '0.8.21'
  compilerVersions: string[] = Object.keys(compilerReleases)
  compilerErrors = []

  code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract HelloWorld {
    function get()public pure returns (string memory){
        return 'Hello Contracts';
    }
}`
  editorOptions = {
    mode: 'text/x-solidity',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true
  }

  async compileAndFetchContracts (code: string) {
    try {
      this.deployedContractAddress = ''
      const selectedVersion = compilerReleases[
        this.selectedCompilerVersion
      ] as string

      if (!selectedVersion) {
        console.error('Selected compiler version not found.')
        return
      }

      const compilerInput = {
        version: `https://binaries.soliditylang.org/bin/${selectedVersion}`,
        contractBody: code
      }
      const output = await solidityCompiler(compilerInput)
      if (output.errors && output.errors.length > 0 && !output.contracts) {
        this.compiledContracts = null
        console.log(output.errors)
        this.compilerErrors.push(...output.errors)
      } else {
        this.compilerErrors = []
        console.log('output', output)
        this.compiledContracts = output.contracts.Compiled_Contracts
        this.contractNames = Object.keys(this.compiledContracts)
        this.selectedContractName = this.contractNames[0]
      }
    } catch (error) {
      console.error('Error compiling contracts:', error)
    }
  }

  async deploySelectedContract () {
    if (!this.session) {
      this.snackBarHelperService.open('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
      return
    }
    try {
      const selectedContractName = this.selectedContractName
      const selectedContract = this.compiledContracts[selectedContractName]

      if (!selectedContract) {
        console.error('Selected contract not found.')
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contractBytecode = selectedContract.evm.bytecode.object
      const contractAbi = selectedContract.abi

      const factory = new ethers.ContractFactory(
        contractAbi,
        contractBytecode,
        signer
      )
      const transactionOptions: ethers.PayableOverrides = {}
      if (this.commonGweiValue > 0) {
        transactionOptions.value = ethers.utils.parseUnits(
          this.commonGweiValue.toString(),
          'gwei'
        )
      }
      const contract = await factory.deploy(transactionOptions)
      await contract.deployed()
      this.deployedContractAddress = contract.address

      this.contractFunctions = contractAbi
        .filter((item) => item.type === 'function')
        .map((func) => {
          const inputHints =
            func.inputs.length > 0
              ? this.getInputHints(func.inputs)
              : 'No inputs'
          return {
            ...func,
            inputValues: '',
            outputValue: '',
            inputHints
          }
        })

      console.log(this.contractFunctions)
    } catch (error) {
      console.error('Error deploying contract:', error)
    }
  }

  getInputHints (inputs: { name: string, type: string }[]): string {
    return inputs.map((input) => `${input.name}: ${input.type}`).join(', ')
  }

  parseInputValue (value: string, type: string) {
    if (type === 'bool') {
      return value.toLowerCase() === 'true'
    } else {
      return value
    }
  }

  async invokeFunction (func) {
    if (!this.session) {
      this.snackBarHelperService.open('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
      return
    }
    try {
      const selectedContract =
        this.compiledContracts[this.selectedContractName]

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        this.deployedContractAddress,
        selectedContract.abi,
        signer
      )

      const inputs =
        func.inputValues.trim() !== ''
          ? func.inputValues.split(',').map((value, index) => {
            const inputType = func.inputs[index].type
            return this.parseInputValue(value.trim(), inputType)
          })
          : []
      const transactionOptions: ethers.PayableOverrides = {}
      if (this.commonGweiValue > 0) {
        transactionOptions.value = ethers.utils.parseUnits(
          this.commonGweiValue.toString(),
          'gwei'
        )
      }
      const transaction = await contract.functions[func.name](
        ...inputs,
        transactionOptions
      )
      console.log(transaction)

      if (
        func.outputs.length > 0 &&
        (func.stateMutability === 'view' || func.stateMutability === 'pure')
      ) {
        console.log('hello')
        const outputValue = transaction[0].toString()
        const updatedFunc = this.contractFunctions.find(
          (f) => f.name === func.name
        )
        if (updatedFunc) {
          updatedFunc.outputValue = outputValue
          const index = this.contractFunctions.indexOf(func)
          if (index !== -1) {
            this.contractFunctions[index] = updatedFunc
          }
        }
        console.log(func.outputValue)
      }
      console.log('Invoked:', transaction)
    } catch (error) {
      console.error('Error invoking function', error)
      const updatedFunc = this.contractFunctions.find(
        (f) => f.name === func.name
      )
      if (updatedFunc) {
        updatedFunc.outputValue = error.message
        const index = this.contractFunctions.indexOf(func)
        if (index !== -1) {
          this.contractFunctions[index] = updatedFunc
        }
      }
    }
  }

  async handleChainChanged () {
    await this.handleAuth()
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
        console.log('Should show ethereum chain now')
        this.session = true
      }
      console.log('session', this.session)
      this.changeDetectorRef.detectChanges()
    } catch (err) {
      console.log('An error occurred', err)
    }
  }
}
