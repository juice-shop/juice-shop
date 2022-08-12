terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.20.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.1.0"
    }

    local = {
      source  = "hashicorp/local"
      version = "2.1.0"
    }

    null = {
      source  = "hashicorp/null"
      version = "3.1.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.1"
    }
  }

  required_version = ">= 0.14"
}

provider "aws" {
  region                      = var.region
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  access_key                  = var.access_key
  secret_key                  = var.secret_key
}

provider "kubernetes" {
  host                   = module.includes.cluster_host
  token                  = module.includes.cluster_token
  cluster_ca_certificate = module.includes.cluster_cert
}

module "includes" {
  source = "./terraform/modules/includes"

  sg_wg_one_id = module.sg.workgroup_one_id
  sg_wg_two_id = module.sg.workgroup_two_id
}

module "sg"  {
  source = "./terraform/modules/security-groups"
  vpc_id = module.includes.vpc_id
}

module "subnets" {
  source = "./terraform/modules/subnets"

  region = var.region
  vpc_id = module.includes.vpc_id
}

module "storage" {
  source = "./terraform/modules/storage"

  cluster_name = module.includes.cluster_name
  rds_sg_id = module.sg.rds_sg_id
  private_subnet = [module.subnets.subnet_id_main, module.subnets.subnet_id_secondary]
}


