provider "aws" {
  region = var.aws_region
}

resource "null_resource" "docker_build" {
  triggers = {
    dockerfile_hash = filemd5("${path.module}/../Dockerfile")
    compose_hash    = filemd5("${path.module}/../docker-compose.yml")
  }

  provisioner "local-exec" {
    command = "docker build -t ${var.ecr_repository_url}:${var.container_tag} -f ${path.module}/../Dockerfile ${path.module}/.."
  }

  provisioner "local-exec" {
    command = "docker push ${var.ecr_repository_url}:${var.container_tag}"
  }
}

resource "aws_ecs_cluster" "juice_shop" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_task_definition" "juice_shop" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = var.project_name
      image     = "${var.ecr_repository_url}:${var.container_tag}"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.node_env
        }
      ]
      mountPoints = [
        {
          sourceVolume  = "sqlite-data"
          containerPath = "/juice-shop/data/sqlite"
          readOnly      = false
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.juice_shop.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  volume {
    name = "sqlite-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.juice_shop_data.id
      transit_encryption = "ENABLED"

      authorization_config {
        access_point_id = aws_efs_access_point.juice_shop_data.id
        iam             = "DISABLED"
      }
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecs_service" "juice_shop" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.juice_shop.id
  task_definition = aws_ecs_task_definition.juice_shop.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.juice_shop.arn
    container_name   = var.project_name
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "juice_shop" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
