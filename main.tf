# ============================================================
#  SmartPresence — Root Terraform Configuration
#  Orchestrates all modules for the complete AWS infrastructure
# ============================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state (recommended for teams)
  # backend "s3" {
  #   bucket         = "smartpresence-terraform-state"
  #   key            = "infrastructure/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "terraform-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SmartPresence"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ACM requires us-east-1 for CloudFront certificates
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "SmartPresence"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ── Module: Networking (VPC, Subnets, IGW, Route Tables) ─────
module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  aws_region   = var.aws_region
}

# ── Module: Security Groups ─────────────────────────────────
module "security" {
  source = "./modules/security"

  project_name  = var.project_name
  environment   = var.environment
  vpc_id        = module.networking.vpc_id
  allowed_ssh_cidr = var.allowed_ssh_cidr
}

# ── Module: RDS PostgreSQL ──────────────────────────────────
module "database" {
  source = "./modules/database"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  rds_security_group_id = module.security.rds_sg_id
  db_instance_class  = var.db_instance_class
  db_username        = var.db_username
  db_password        = var.db_password
  db_allocated_storage = var.db_allocated_storage
}

# ── Module: EC2 Instance (Spring Boot + Keycloak) ───────────
module "compute" {
  source = "./modules/compute"

  project_name       = var.project_name
  environment        = var.environment
  public_subnet_id   = module.networking.public_subnet_ids[0]
  ec2_security_group_id = module.security.ec2_sg_id
  instance_type      = var.ec2_instance_type
  key_pair_name      = var.key_pair_name

  # Pass RDS info for the user-data bootstrap
  db_endpoint       = module.database.db_endpoint
  db_username       = var.db_username
  db_password       = var.db_password
  jwt_secret        = var.jwt_secret
  beacon_api_key    = var.beacon_api_key
  keycloak_admin_password = var.keycloak_admin_password
  domain_name       = var.domain_name
}

# ── Module: Application Load Balancer + HTTPS ───────────────
module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  alb_security_group_id = module.security.alb_sg_id
  ec2_instance_id    = module.compute.instance_id
  acm_certificate_arn = module.dns.acm_certificate_arn
  domain_name        = var.domain_name
}

# ── Module: S3 + CloudFront (React Dashboard) ──────────────
module "frontend" {
  source = "./modules/frontend"

  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.domain_name
  acm_cert_arn_us_east_1 = module.dns.acm_certificate_arn_us_east_1

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

# ── Module: Route 53 + ACM Certificates ────────────────────
module "dns" {
  source = "./modules/dns"

  domain_name     = var.domain_name
  aws_region      = var.aws_region
  alb_dns_name    = module.alb.alb_dns_name
  alb_zone_id     = module.alb.alb_zone_id
  cloudfront_domain_name = module.frontend.cloudfront_domain_name
  cloudfront_zone_id     = module.frontend.cloudfront_hosted_zone_id

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}
