############################################
# PROVIDER
############################################
provider "aws" {
  region = "us-east-1"
}

############################################
# POSITIVE CASES (SHOULD PASS)
############################################

# --- Old style: private ACL ---
resource "aws_s3_bucket" "old_style_private" {
  bucket = "example-old-style-private"
  acl    = "private"
}

# --- New style: private ACL ---
resource "aws_s3_bucket" "new_style_private" {
  bucket = "example-new-style-private"
}

resource "aws_s3_bucket_acl" "new_style_private" {
  bucket = aws_s3_bucket.new_style_private.id
  acl    = "private"
}

# --- Bucket without inline ACL but separate private ACL resource ---
resource "aws_s3_bucket" "separate_acl_bucket" {
  bucket = "example-separate-acl"
}

resource "aws_s3_bucket_acl" "separate_acl_bucket" {
  bucket = aws_s3_bucket.separate_acl_bucket.id
  acl    = "private"
}

# --- Terraform docs style private example ---
resource "aws_s3_bucket" "docs_private" {
  bucket = "example-docs-private"
}

resource "aws_s3_bucket_acl" "docs_private" {
  bucket = aws_s3_bucket.docs_private.id
  acl    = "private"
}

############################################
# NEGATIVE CASES (SHOULD FAIL)
############################################

# --- Old style: public-read ---
resource "aws_s3_bucket" "old_style_public_read" {
  bucket = "example-old-style-public-read"
  acl    = "public-read"
}

# --- Old style: public-read-write ---
resource "aws_s3_bucket" "old_style_public_read_write" {
  bucket = "example-old-style-public-read-write"
  acl    = "public-read-write"
}

# --- New style: public-read ---
resource "aws_s3_bucket" "new_style_public_read" {
  bucket = "example-new-style-public-read"
}

resource "aws_s3_bucket_acl" "new_style_public_read" {
  bucket = aws_s3_bucket.new_style_public_read.id
  acl    = "public-read"
}

# --- New style: public-read-write ---
resource "aws_s3_bucket" "new_style_public_read_write" {
  bucket = "example-new-style-public-read-write"
}

resource "aws_s3_bucket_acl" "new_style_public_read_write" {
  bucket = aws_s3_bucket.new_style_public_read_write.id
  acl    = "public-read-write"
}

# --- Terraform docs style public-read (sanity fail) ---
resource "aws_s3_bucket" "docs_public_read" {
  bucket = "example-docs-public-read"
}

resource "aws_s3_bucket_acl" "docs_public_read" {
  bucket = aws_s3_bucket.docs_public_read.id
  acl    = "public-read"
}