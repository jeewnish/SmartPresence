# ============================================================
#  SmartPresence — Root Outputs
#  Surfaces the most important values after deployment
# ============================================================

# ── Networking ──────────────────────────────────────────────

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

# ── Database ────────────────────────────────────────────────

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.database.db_endpoint
}

output "rds_connection_string" {
  description = "JDBC connection string for the smartpresence database"
  value       = "jdbc:postgresql://${module.database.db_endpoint}/smartpresence"
}

# ── Compute ─────────────────────────────────────────────────

output "ec2_public_ip" {
  description = "EC2 instance public IP for SSH"
  value       = module.compute.public_ip
}

output "ec2_ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ${var.key_pair_name}.pem ubuntu@${module.compute.public_ip}"
}

# ── Load Balancer ───────────────────────────────────────────

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.alb_dns_name
}

# ── Frontend ────────────────────────────────────────────────

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = module.frontend.cloudfront_distribution_id
}

output "dashboard_bucket_name" {
  description = "S3 bucket name for dashboard uploads"
  value       = module.frontend.s3_bucket_name
}

# ── URLs ────────────────────────────────────────────────────

output "api_url" {
  description = "Spring Boot API URL"
  value       = "https://api.${var.domain_name}"
}

output "auth_url" {
  description = "Keycloak auth URL"
  value       = "https://auth.${var.domain_name}"
}

output "dashboard_url" {
  description = "React Dashboard URL"
  value       = "https://dashboard.${var.domain_name}"
}

# ── Deployment Commands ─────────────────────────────────────

output "dashboard_deploy_command" {
  description = "Command to deploy a new dashboard build"
  value       = <<-EOT
    aws s3 sync ./build s3://${module.frontend.s3_bucket_name} --delete
    aws cloudfront create-invalidation --distribution-id ${module.frontend.cloudfront_distribution_id} --paths "/*"
  EOT
}
