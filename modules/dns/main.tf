# ============================================================
#  Module: DNS — Route 53 + ACM Certificates
#  Matches Phase 6a & 6c of the deployment guide
# ============================================================

terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws, aws.us_east_1]
    }
  }
}

# ── Route 53 Hosted Zone ──────────────────────────────────
# NOTE: If you already have a hosted zone, import it with:
#   terraform import module.dns.aws_route53_zone.main <ZONE_ID>

resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name = var.domain_name
  }
}

# ── ACM Certificate (Regional — for ALB) ─────────────────

resource "aws_acm_certificate" "regional" {
  domain_name               = var.domain_name
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]
  validation_method = "DNS"

  tags = {
    Name = "${var.domain_name}-regional"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ── ACM Certificate (us-east-1 — for CloudFront) ─────────

resource "aws_acm_certificate" "cloudfront" {
  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]
  validation_method = "DNS"

  tags = {
    Name = "${var.domain_name}-cloudfront"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ── DNS Validation Records ────────────────────────────────

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.regional.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# ── Certificate Validation Waiter ─────────────────────────

resource "aws_acm_certificate_validation" "regional" {
  certificate_arn         = aws_acm_certificate.regional.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]


}

resource "aws_acm_certificate_validation" "cloudfront" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]


}

# ── DNS A Records (Alias) ────────────────────────────────

# api.yourdomain.com → ALB
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# auth.yourdomain.com → ALB
resource "aws_route53_record" "auth" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "auth.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# dashboard.yourdomain.com → CloudFront
resource "aws_route53_record" "dashboard" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "dashboard.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}
