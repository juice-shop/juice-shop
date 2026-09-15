/*
 * infra.tf - Arquivo intencionalmente vulnerável para testes
*/

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "bucket_vulneravel" {
  bucket = "meu-bucket-super-secreto-lab"
  acl    = "public-read" /* Falha crítica de segurança */
}