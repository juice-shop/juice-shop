param(
    [Parameter(Mandatory=$true)]
    [string]$LabInstance,
    [Parameter(Mandatory=$true)]
    [string]$adminUsername,
    [Parameter(Mandatory=$true)]
    [string]$adminPassword,
    [Parameter(Mandatory=$true)]
    [string]$personalAccessToken,
    [Parameter(Mandatory=$true)]
    [string]$accountName,
    [Parameter(Mandatory=$true)]
    [string]$location,
    [Parameter(Mandatory=$true)]
    [string]$vmSize
)

$AzureContext = Get-AzContext

# Create a new resource group
New-AzResourceGroup -Name ${{ secrets.PRODRESOURCEGROUP }} -Location $location -Tag @{ LabInstance = $LabInstance; Environment = 'Prod' }
New-AzResourceGroup -Name ${{ secrets.DEVRESOURCEGROUP }} -Location $location -Tag @{ LabInstance = $LabInstance; Environment = 'Dev' }
New-AzResourceGroup -Name rg-devops-agent-lod -Location $location -Tag @{ LabInstance = $LabInstance; Environment = 'Prod' }


$Providers = Get-AzResourceProvider -ListAvailable

foreach ($Provider in $Providers) {
    if ($Provider.RegistrationState -ne "Registered") {
        Write-Host "Registering $($Provider.ProviderNamespace)..."
        Register-AzResourceProvider -ProviderNamespace $Provider.ProviderNamespace -ErrorAction SilentlyContinue
    } else {
        Write-Host "$($Provider.ProviderNamespace) is already registered."
    }
}

git clone https://github.com/RobertoBorges/devopsagent.git

cd devopsagent

az deployment group create --name DeployDevOpsAgent --resource-group rg-devops-agent-lod  --template-file vmwindows.bicep  --parameters adminUsername=$adminUsername adminPassword=$adminPassword accountName=$accountName personalAccessToken=$personalAccessToken vmSize=$vmSize