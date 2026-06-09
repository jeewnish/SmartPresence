# ============================================================
#  Module: Compute — EC2 Instance (Spring Boot + Keycloak)
#  Matches Phase 4 & 5 of the deployment guide
# ============================================================

# ── Latest Ubuntu 22.04 LTS AMI ────────────────────────────

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Elastic IP (stable public IP) ──────────────────────────

resource "aws_eip" "server" {
  instance = aws_instance.server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip-${var.environment}"
  }
}

# ── EC2 Instance ───────────────────────────────────────────

resource "aws_instance" "server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.ec2_security_group_id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = base64encode(templatefile("${path.module}/templates/user-data.sh", {
    project_name           = var.project_name
    db_endpoint            = var.db_endpoint
    db_username            = var.db_username
    db_password            = var.db_password
    jwt_secret             = var.jwt_secret
    beacon_api_key         = var.beacon_api_key
    keycloak_admin_password = var.keycloak_admin_password
    domain_name            = var.domain_name
  }))

  tags = {
    Name = "${var.project_name}-server-${var.environment}"
  }

  lifecycle {
    ignore_changes = [ami, user_data] # Don't recreate on AMI update
  }
}
