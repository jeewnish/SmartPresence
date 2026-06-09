output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.dashboard.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.dashboard.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID (for Route 53 alias)"
  value       = aws_cloudfront_distribution.dashboard.hosted_zone_id
}

output "s3_bucket_name" {
  description = "S3 bucket name for dashboard uploads"
  value       = aws_s3_bucket.dashboard.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.dashboard.arn
}
