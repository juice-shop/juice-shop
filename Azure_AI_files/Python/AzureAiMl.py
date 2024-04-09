from azure.ai.ml import MLClient 
from azure.identity import DefaultAzureCredential

class AzureMLClient:
    def __init__(self, subscription_id, resource_group, workspace):
        self.subscription_id = subscription_id
        self.resource_group = resource_group
        self.workspace = workspace
        

subscription_id = "your_subscription_id"
resource_group = "your_resource_group"
workspace = "your_workspace_name"
ml_client = MLClient(DefaultAzureCredential(), subscription_id, resource_group, workspace)
ml_client.compute.get("cpu-cluster")
ml_client_ai = MLClient()