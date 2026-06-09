variable "domain_name" {
  description = "Base domain name (e.g., smartpresence.example.com)"
  type        = string
}

variable "aws_region" {
  description = "AWS region (for tagging/reference)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for api.* and auth.* records"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB hosted zone ID for alias records"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for dashboard.* record"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront hosted zone ID for alias record"
  type        = string
}
