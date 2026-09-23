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

variable "ecr_repository_url" {
  description = "ECR repository URL for the Docker image"
  type        = string
  default     = "123456789012.dkr.ecr.eu-west-1.amazonaws.com/juice-shop"
}

variable "container_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "efs_encrypted" {
  description = "Enable encryption at rest for EFS"
  type        = bool
  default     = true
}

variable "alb_certificate_arn" {
  description = "ARN of an issued ACM certificate in the ALB region; provisioned outside this stack"
  type        = string
  nullable    = false

  validation {
    condition     = can(regex("^arn:[a-z0-9-]+:acm:[a-z0-9-]+:[0-9]{12}:certificate/[a-f0-9-]+$", var.alb_certificate_arn))
    error_message = "Provide an ACM certificate ARN."
  }
}

variable "jwt_private_key_secret_arn" {
  description = "ARN of a Secrets Manager secret containing a separate RSA private key as raw PEM, using the default Secrets Manager KMS key"
  type        = string
  nullable    = false

  validation {
    condition     = can(regex("^arn:[a-z0-9-]+:secretsmanager:[a-z0-9-]+:[0-9]{12}:secret:.+$", var.jwt_private_key_secret_arn))
    error_message = "Provide a Secrets Manager secret ARN."
  }
}
