variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed SSH access to EC2"
  type        = list(string)
}
