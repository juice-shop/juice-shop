output "workgroup_one_id" {
  value = aws_security_group.worker_group_mgmt_one.id
}

output "workgroup_two_id" {
  value = aws_security_group.worker_group_mgmt_two.id
}

output "rds_sg_id" {
  value = aws_security_group.snyk_rds_sg.id
}
