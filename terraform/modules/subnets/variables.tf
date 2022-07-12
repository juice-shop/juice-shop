variable "cidr_main" {
  type    = string
  default = "10.0.0.0/24"
}

variable "cidr_secondary" {
  type    = string
  default = "10.0.64.0/19"
}

variable "vpc_id" {
  type    = string
}

variable "region" {
  type    = string
}
