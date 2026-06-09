# SmartPresence — AWS Infrastructure (Terraform)

Modular Terraform configuration for deploying the SmartPresence capstone project to AWS.

## Architecture

```
Internet
    │
    ▼
[Route 53] ─── DNS
    │
    ▼
[Application Load Balancer]
    │
    ├── api.domain   ─────▶  [EC2: Spring Boot :8080]
    ├── auth.domain  ─────▶  [EC2: Keycloak :8180]
    └── dashboard.domain ─▶  [S3 + CloudFront]
    
[EC2: Spring Boot] ─────▶  [RDS: PostgreSQL 15]
[EC2: Keycloak]    ─────▶  [RDS: PostgreSQL 15]
```

## Module Structure

```
AWS/
├── main.tf                      # Root orchestration
├── variables.tf                 # All configurable inputs
├── outputs.tf                   # Useful outputs after deploy
├── terraform.tfvars.example     # Copy → terraform.tfvars
│
└── modules/
    ├── networking/              # VPC, subnets, IGW, route tables
    ├── security/                # Security groups (ALB, EC2, RDS)
    ├── database/                # RDS PostgreSQL 15
    ├── compute/                 # EC2 instance + bootstrap script
    │   └── templates/
    │       └── user-data.sh     # Docker install + docker-compose setup
    ├── alb/                     # Application Load Balancer + HTTPS routing
    ├── frontend/                # S3 bucket + CloudFront distribution
    └── dns/                     # Route 53 hosted zone + ACM certificates
```

## Prerequisites

1. **AWS CLI** configured with your credentials: `aws configure`
2. **Terraform** >= 1.5.0 installed
3. **EC2 Key Pair** created in the AWS Console (download the `.pem` file)
4. **Domain name** — either register in Route 53 or point your existing registrar's NS records

## Quick Start

```bash
# 1. Clone and navigate
cd AWS/

# 2. Create your variable file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 3. Initialize Terraform
terraform init

# 4. Preview changes
terraform plan

# 5. Deploy! (type 'yes' when prompted)
terraform apply

# 6. Note the outputs — you'll need them
terraform output
```

## After Deployment

### 1. Update Domain Registrar

If your domain is NOT in Route 53, copy the `name_servers` output and update your registrar.

### 2. Deploy Backend to EC2

```bash
# SSH into the server
ssh -i your-key.pem ubuntu@$(terraform output -raw ec2_public_ip)

# Copy your backend project files
scp -i your-key.pem -r ../backend ubuntu@<EC2-IP>:/home/ubuntu/smartpresence/backend

# Copy Keycloak realm export
scp -i your-key.pem -r ../backend/keycloak ubuntu@<EC2-IP>:/home/ubuntu/smartpresence/keycloak

# Start services
cd /home/ubuntu/smartpresence
docker compose up -d
docker compose logs -f
```

### 3. Deploy Dashboard to S3

```bash
# Build locally
cd ../dashboard
echo "VITE_API_URL=https://api.$(terraform output -raw domain_name)/api/v1" > .env.production
echo "VITE_KEYCLOAK_URL=https://auth.$(terraform output -raw domain_name)" >> .env.production
npm run build

# Upload to S3
aws s3 sync ./dist s3://$(terraform output -raw dashboard_bucket_name) --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### 4. Update Expo App

Update your mobile app config to use the new URLs:
```typescript
export const CONFIG = {
  API_BASE_URL: 'https://api.yourdomain.com/api/v1',
  KEYCLOAK_URL: 'https://auth.yourdomain.com',
  KEYCLOAK_REALM: 'smartpresence',
  KEYCLOAK_CLIENT_ID: 'smartpresence-app',
  WS_URL: 'wss://api.yourdomain.com/api/v1/ws',
};
```

## Estimated Costs (Dev/Capstone)

| Service | Monthly Cost |
|---------|-------------|
| EC2 `t3.medium` | ~$30–40 |
| RDS `db.t3.micro` | ~$15 |
| S3 + CloudFront | ~$0 (at this scale) |
| Route 53 Hosted Zone | $0.50 |
| **Total** | **~$45–55/month** |

## Teardown

```bash
# Destroy everything (careful!)
terraform destroy
```

> ⚠️ If `deletion_protection` is enabled on RDS (prod), you'll need to disable it first in the AWS Console or by setting `environment = "dev"`.

## Customization

- **Change instance sizes**: Edit `ec2_instance_type` and `db_instance_class` in `terraform.tfvars`
- **Add more services**: Create a new module in `modules/` and wire it in `main.tf`
- **Switch to production**: Set `environment = "prod"` to enable multi-AZ RDS, deletion protection, and performance insights
