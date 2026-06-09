# ============================================================
#  Module: Database — RDS PostgreSQL 15
#  Matches Phase 3 of the deployment guide
# ============================================================

# ── DB Subnet Group (private subnets only) ─────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# ── RDS Parameter Group ────────────────────────────────────

resource "aws_db_parameter_group" "postgres15" {
  name_prefix = "${var.project_name}-pg15-"
  family      = "postgres15"
  description = "SmartPresence PostgreSQL 15 parameters"

  # Enable logging for debugging (optional, disable in prod to reduce costs)
  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking longer than 1 second
  }

  tags = {
    Name = "${var.project_name}-pg15-params-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ── RDS Instance ───────────────────────────────────────────

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db-${var.environment}"

  # Engine
  engine         = "postgres"
  engine_version = "15"

  # Sizing
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"

  # Credentials
  db_name  = "smartpresence"
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false
  multi_az               = var.environment == "prod" ? true : false

  # Parameter group
  parameter_group_name = aws_db_parameter_group.postgres15.name

  # Backup & Maintenance
  backup_retention_period = 7
  backup_window           = "03:00-04:00"        # 3-4 AM UTC
  maintenance_window      = "sun:04:00-sun:05:00" # Sunday 4-5 AM UTC
  copy_tags_to_snapshot   = true

  # Monitoring
  performance_insights_enabled = var.environment == "prod" ? true : false

  # Protection
  deletion_protection = var.environment == "prod" ? true : false
  skip_final_snapshot = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-final-snapshot" : null

  # Timeouts — RDS creation can take 10-15 minutes
  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }
}
