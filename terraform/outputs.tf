output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.juice_shop.dns_name
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.juice_shop.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.juice_shop.name
}
