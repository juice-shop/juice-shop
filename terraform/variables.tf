variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "juice-shop"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory (MiB) for the ECS task"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Number of ECS task instances"
  type        = number
  default     = 2
}

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
}

variable "container_image" {
  description = "Docker image for the application"
  type        = string
  default     = "juice-shop:latest"
}

variable "efs_encrypted" {
  description = "Enable encryption at rest for EFS"
  type        = bool
  default     = true
}
