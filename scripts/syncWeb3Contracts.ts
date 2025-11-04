import * as https from 'https'
import * as fs from 'fs/promises'
import * as path from 'path'

interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
}

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'juice-shop'
const REPO_NAME = 'web3-contracts'
const BRANCH = 'dev'
const CONTRACTS_PATH = 'contracts'
const TARGET_DIR = path.join(process.cwd(), 'data', 'static', 'web3-snippets')

/**
 * Fetches data from a URL using HTTPS
 */
async function fetchFromGitHub(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'OWASP-Juice-Shop'
      }
    }

    https.get(url, options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}: ${data}`))
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Downloads raw file content from GitHub
 */
async function downloadFileContent(downloadUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(downloadUrl, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data)
        } else {
          reject(new Error(`Failed to download file: ${res.statusCode}`))
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Lists all Solidity files in the contracts directory
 */
async function listContractFiles(): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTRACTS_PATH}?ref=${BRANCH}`
  
  try {
    const files = await fetchFromGitHub(url)
    return files.filter((file: GitHubFile) => 
      file.type === 'file' && file.name.endsWith('.sol')
    )
  } catch (error: any) {
    // Try main branch if dev doesn't exist
    console.log(`Branch '${BRANCH}' not found, trying 'main' branch...`)
    const mainUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTRACTS_PATH}?ref=main`
    const files = await fetchFromGitHub(mainUrl)
    return files.filter((file: GitHubFile) => 
      file.type === 'file' && file.name.endsWith('.sol')
    )
  }
}

/**
 * Syncs a single contract file from the repository
 */
async function syncContractFile(file: GitHubFile): Promise<void> {
  console.log(`Syncing ${file.name}...`)
  
  const content = await downloadFileContent(file.download_url)
  const targetPath = path.join(TARGET_DIR, file.name)
  
  // Check if file already exists and compare content
  try {
    const existingContent = await fs.readFile(targetPath, 'utf-8')
    if (existingContent === content) {
      console.log(`  ✓ ${file.name} is up to date`)
      return
    }
  } catch (error) {
    // File doesn't exist, will be created
  }
  
  await fs.writeFile(targetPath, content, 'utf-8')
  console.log(`  ✓ ${file.name} synced successfully`)
}

/**
 * Main sync function
 */
async function syncWeb3Contracts(): Promise<void> {
  console.log('Starting Web3 contracts sync...\n')
  
  try {
    // Ensure target directory exists
    await fs.mkdir(TARGET_DIR, { recursive: true })
    
    // List all contract files from the repository
    const files = await listContractFiles()
    console.log(`Found ${files.length} contract files to sync\n`)
    
    // Sync each file
    for (const file of files) {
      try {
        await syncContractFile(file)
      } catch (error: any) {
        console.error(`  ✗ Failed to sync ${file.name}: ${error.message}`)
      }
    }
    
    console.log('\n✓ Web3 contracts sync completed!')
  } catch (error: any) {
    console.error(`\n✗ Sync failed: ${error.message}`)
    console.error('\nNote: The web3-contracts repository may not exist yet or may be private.')
    console.error('You can manually add contracts to:', TARGET_DIR)
    process.exit(1)
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncWeb3Contracts().catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
}

export { syncWeb3Contracts }
