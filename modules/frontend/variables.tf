variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  description = "Base domain name for the dashboard subdomain"
  type        = string
}

variable "acm_cert_arn_us_east_1" {
  description = "ACM certificate ARN in us-east-1 (required for CloudFront)"
  type        = string
}
