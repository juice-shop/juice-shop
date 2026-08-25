# vuln-code-snippet start iacLeakedKeyChallenge
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${var.project_name}-${var.environment}-flow-logs"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role" "flow_logs_role" {
  name = "${var.project_name}-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "flow_logs_role_attach" {
  role       = aws_iam_role.flow_logs_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_flow_log" "vpc_flow" {
  log_destination      = aws_cloudwatch_log_group.vpc_flow_logs.arn
  log_destination_type = "cloud-watch-logs"
  iam_role_arn         = aws_iam_role.flow_logs_role.arn
  resource_id          = aws_vpc.main.id
  traffic_type         = "ALL"
}

resource "aws_networkfirewall_firewall_policy" "juice_shop" {
  name = "${var.project_name}-nwfw-policy"

  firewall_policy {
    stateless_default_actions          = ["aws:pass"]
    stateless_fragment_default_actions = ["aws:pass"]
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_networkfirewall_firewall" "juice_shop" {
  name                = "${var.project_name}-nwfw"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.juice_shop.arn
  vpc_id              = aws_vpc.main.id

  subnet_mappings = [
    {
      subnet_id = aws_subnet.public[0].id
    }
  ]

  delete_protection = false

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_accessanalyzer_analyzer" "juice_shop" {
  name = "${var.project_name}-analyzer"
  type = "ACCOUNT"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name        = "${var.project_name}-public-${count.index}"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-igw"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-public-rt"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Internal ALB management - restricted"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  ingress {
    description = "Allow HTTPS from trusted network"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-alb-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-ecs-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_lb" "juice_shop" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  enable_deletion_protection = true
  drop_invalid_header_fields = true
  access_logs {
    bucket  = var.alb_access_log_bucket
    enabled = true
    prefix  = "${var.project_name}/alb"
  }

  protection = true

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_wafregional_web_acl" "juice_shop" {
  name        = "${var.project_name}-waf"
  metric_name = "${var.project_name}WAF"

  default_action {
    type = "ALLOW"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_wafregional_web_acl_association" "juice_shop" {
  resource_arn = aws_lb.juice_shop.arn
  web_acl_id   = aws_wafregional_web_acl.juice_shop.id
}

resource "aws_lb_target_group" "juice_shop" {
  name        = "${var.project_name}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/rest/admin/application-version"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol    = "HTTPS"
      port        = "443"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_iam_server_certificate" "juice_shop_tls" {
  name             = "${var.project_name}-tls-cert"
  certificate_body = file("${path.module}/certs/server.crt")
  private_key      = file("${path.module}/certs/server.key") # vuln-code-snippet vuln-line iacLeakedKeyChallenge

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_iam_server_certificate.juice_shop_tls.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.juice_shop.arn
  }
}

resource "aws_iam_role" "ecs_execution" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_security_group" "efs" {
  name        = "${var.project_name}-efs-sg"
  description = "Security group for EFS mount targets"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    description     = "Allow NFS from ECS security group"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-efs-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_efs_file_system" "juice_shop_data" {
  creation_token = "${var.project_name}-sqlite-data"
  encrypted      = var.efs_encrypted
  kms_key_id     = aws_kms_key.juice_shop.arn

  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"

  tags = {
    Name        = "${var.project_name}-sqlite-data"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_efs_mount_target" "juice_shop_data" {
  count           = length(var.public_subnet_cidrs)
  file_system_id  = aws_efs_file_system.juice_shop_data.id
  subnet_id       = aws_subnet.public[count.index].id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_access_point" "juice_shop_data" {
  file_system_id = aws_efs_file_system.juice_shop_data.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/data"
    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name        = "${var.project_name}-data-ap"
    Project     = var.project_name
    Environment = var.environment
  }
}
# vuln-code-snippet end iacLeakedKeyChallenge
