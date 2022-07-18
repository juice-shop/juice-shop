resource "aws_subnet" "main" {
  vpc_id     = var.vpc_id
  cidr_block = var.cidr_main
  availability_zone = "${var.region}a"

  tags = {
    Name = "Main"
  }
}

resource "aws_subnet" "secondary" {
  vpc_id     = var.vpc_id
  cidr_block = var.cidr_secondary
  availability_zone = "${var.region}c"

  tags = {
    Name = "Main"
  }
}
