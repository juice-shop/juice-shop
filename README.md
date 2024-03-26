*[original Juice Shop readme](./JUICESHOP_README.md)*

# Snyk Juice Shop

This is a vulnerable by design repository for demonstrating Snyk Insights. Do not deploy this in production.

## Step 0: Prepare Demo Environemnt

### Install Tools

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [helm](https://helm.sh/docs/intro/install/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Fork & Import

Fork this repository and import it in a new or existing org.

```
git clone https://github.com/somerset-inc/juice-shop-goof.git
cd juice-shop
```

### Deploy Juice Shop to EKS

In A Cloud Guru create an AWS sandbox environment, then add the following as GitHub Actions Variables:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SNYK_ORG_ID
SNYK_TOKEN
```

Edit the [_build_flag](./_build_flag) file to trigger EKS provisioning and Juice Shop deployment.

## Step 1: Deploy the Kubernetes Connector

Create Snyk Service Acount with minimum scope: [docs](https://docs.snyk.io/manage-risk/snyk-apprisk/risk-based-prioritization-for-snyk-apprisk/prioritization-setup/prioritization-setup-kubernetes-connector#step-2-create-a-new-role)

Log into AWS CLI:
```
aws configure
aws eks update-kubeconfig --region us-east-1 --name juice-shop-cluster
```

Add the secret
```
kubectl create secret generic insights-secret --from-literal=snykServiceAccountToken=YOUR_SNYK_TOKEN
```

Add the Helm chart
```
helm repo add kubernetes-scanner https://snyk.github.io/kubernetes-scanner
helm repo update
```

Install the chart
```
helm install insights \
	--set "secretName=insights-secret" \
	--set "config.clusterName=juice-shop-cluster" \
	--set "config.routes[0].organizationID=YOUR_ORG_ID" \
	--set "config.routes[0].clusterScopedResources=true" \
	--set "config.routes[0].namespaces[0]=*"  \
	kubernetes-scanner/kubernetes-scanner
```

Run `kubectl get pods` to verify the pod is running.

## Step 2: Scan and Tag Container projects

See [full docs](https://docs.snyk.io/manage-risk/snyk-apprisk/risk-based-prioritization-for-snyk-apprisk/prioritization-setup/prioritization-setup-associating-snyk-open-source-code-and-container-projects) on tagging format. This is required to link Open Source and Code projects with Container projects.

Add tags to container images: [see example workflow](./.github/workflows/container-build-and-test.yml#L35).

Examples:

```
snyk container monitor your/image:tag --tags="component=pkg:${{ github.repository }}@${{ github.ref_name }}"
snyk container monitor your/image:tag --tags="component=pkg:github/org/repo@branch"
```

## Step 3: Tag Open Source and Code projects

Review script at [insights/apply-tags.py](./insights/apply-tags.py).

```
pip install requests
python3 insights/apply-tags.py --org-id your-org-id --snyk-token your-snyk-token --origin github
```
