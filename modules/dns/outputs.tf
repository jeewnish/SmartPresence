output "hosted_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Name servers for the hosted zone (update your domain registrar with these)"
  value       = aws_route53_zone.main.name_servers
}

output "acm_certificate_arn" {
  description = "Regional ACM certificate ARN (for ALB)"
  value       = aws_acm_certificate_validation.regional.certificate_arn
}

output "acm_certificate_arn_us_east_1" {
  description = "us-east-1 ACM certificate ARN (for CloudFront)"
  value       = aws_acm_certificate_validation.cloudfront.certificate_arn
}
