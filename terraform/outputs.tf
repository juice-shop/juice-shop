output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.hayrok_commercehub.dns_name
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.hayrok_commercehub.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.hayrok_commercehub.name
}
