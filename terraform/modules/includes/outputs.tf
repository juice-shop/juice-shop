output "cluster_host" {
  value = data.aws_eks_cluster.cluster.endpoint
}

output "cluster_token" {
  value = data.aws_eks_cluster_auth.cluster.token
}

output "cluster_cert" {
value = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
}

output "cluster_name" {
  value = local.cluster_name
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
