# ============================================================
#  SmartPresence — Root Variables
#  All configurable values are centralized here
# ============================================================

# ── General ─────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "smartpresence"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

# ── Networking ──────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH into EC2 (set to your IP/32 in prod)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # ⚠ Restrict in production!
}

# ── Database (RDS) ──────────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Free tier eligible; use db.t3.medium for prod
}

variable "db_username" {
  description = "Master username for PostgreSQL RDS"
  type        = string
  default     = "smartpresence_user"
}

variable "db_password" {
  description = "Master password for PostgreSQL RDS"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS"
  type        = number
  default     = 20
}

# ── Compute (EC2) ───────────────────────────────────────────

variable "ec2_instance_type" {
  description = "EC2 instance type (t3.medium recommended for Keycloak)"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
}

# ── Application Secrets ─────────────────────────────────────

variable "jwt_secret" {
  description = "JWT signing secret (min 64 chars recommended)"
  type        = string
  sensitive   = true
}

variable "beacon_api_key" {
  description = "API key for beacon endpoints"
  type        = string
  sensitive   = true
  default     = "sp-beacon-key-change-in-prod"
}

variable "keycloak_admin_password" {
  description = "Keycloak admin console password"
  type        = string
  sensitive   = true
}

# ── Domain & DNS ────────────────────────────────────────────

variable "domain_name" {
  description = "Base domain name (e.g., smartpresence.example.com)"
  type        = string
}
