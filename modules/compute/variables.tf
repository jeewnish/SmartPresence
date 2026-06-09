variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "public_subnet_id" {
  description = "Public subnet ID to launch the EC2 instance in"
  type        = string
}

variable "ec2_security_group_id" {
  description = "Security group ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "key_pair_name" {
  description = "Name of the SSH key pair"
  type        = string
}

# ── Passed to user-data template ────────────────────────────

variable "db_endpoint" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "beacon_api_key" {
  type      = string
  sensitive = true
}

variable "keycloak_admin_password" {
  type      = string
  sensitive = true
}

variable "domain_name" {
  type = string
}
