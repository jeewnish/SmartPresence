# AWS Architecture

Domain (Route53)
        │
        ▼
 ACM SSL Certificate
        │
        ▼
 Application Load Balancer
        │
        ▼
 ECS Fargate
 (Spring Boot API)
        │
        ▼
 PostgreSQL RDS

External Services:

- Clerk Authentication
- Firebase Push Notifications (optional)

Supporting Services:

- ECR
- Secrets Manager
- CloudWatch



terraform/
│
├── vpc
├── ecs
├── ecr
├── rds
├── alb
├── acm
├── route53
├── secrets
└── cloudwatch



Yes, you need **both ECR and ECS** if you're deploying your Spring Boot backend using Docker containers.

Think of it this way:

```text
Docker Image
      ↓
    ECR
      ↓
    ECS
      ↓
 Running Container
```

### ECR (Elastic Container Registry)

Purpose:

```text
Stores Docker images
```

Similar to:

- Docker Hub

- GitHub Container Registry

Example:

You build:

```bash
docker build -t smartpresence-api .
```

Then push:

```bash
docker push <ecr-repository>/smartpresence-api:latest
```

AWS stores the image in ECR.

Without ECR, ECS has nowhere to pull your backend image from.

---

### ECS (Elastic Container Service)

Purpose:

```text
Runs Docker containers
```

ECS takes the image from ECR and launches it.

Example:

```text
Spring Boot API
```

running as:

```text
Container #1
Container #2
Container #3
```

for scaling and availability.

For your project:

```text
1 ECS Cluster
1 ECS Service
1 Spring Boot Container
```

is enough.

---

# Every AWS Service in Your System

## 1. VPC

Purpose:

```text
Private network for AWS resources
```

Similar to your university LAN.

Contains:

```text
Subnets
Routing
Security Groups
Internet Access
```

Your architecture:

```text
VPC
│
├── Public Subnet
│     └── ALB
│
└── Private Subnet
      ├── ECS
      └── RDS
```

---

## 2. ALB (Application Load Balancer)

Purpose:

```text
Receives internet traffic
```

Users never talk directly to ECS.

Instead:

```text
Student App
      ↓
 ALB
      ↓
 ECS
```

Benefits:

- HTTPS termination

- Load balancing

- Health checks

Example:

```text
https://api.smartpresence.com
```

lands on ALB first.

---

## 3. ACM (Certificate Manager)

Purpose:

```text
Provides SSL certificates
```

Without ACM:

```text
http://
```

With ACM:

```text
https://
```

Free certificates.

No renewal work.

---

## 4. Route53

Purpose:

```text
DNS
```

Converts:

```text
api.smartpresence.com
```

into:

```text
alb-123456.ap-southeast-1.elb.amazonaws.com
```

Users remember your domain.

Not AWS URLs.

---

## 5. ECS Fargate

Purpose:

```text
Runs your Spring Boot backend
```

Instead of renting a VM:

```text
EC2
```

AWS runs containers automatically.

You only provide:

```text
Docker Image
CPU
Memory
```

Much easier for a capstone.

---

## 6. ECR

Purpose:

```text
Stores Docker Images
```

Example:

```text
smartpresence-api:v1
smartpresence-api:v2
```

ECS pulls from here.

---

## 7. RDS PostgreSQL

Purpose:

```text
Stores application data
```

From your design:

```text
users
courses
enrollments
attendance_sessions
attendance_records
ble_checkin_events
attendance_challenges
```

All live here.

---

## 8. Secrets Manager

Purpose:

```text
Stores sensitive values
```

Never hardcode:

```properties
DB_PASSWORD=password123
CLERK_SECRET=abc123
```

Store:

```text
DB Password
JWT Secret
Clerk Secret Key
```

inside Secrets Manager.

ECS reads them securely.

---

## 9. CloudWatch

Purpose:

```text
Logs + Monitoring
```

Every Spring Boot log:

```text
User authenticated
Attendance submitted
BLE validation failed
```

goes to CloudWatch.

Useful when debugging.

---

## How the Attendance Flow Looks

```text
Student App
     │
     ▼
 Route53
     │
     ▼
 ALB
     │
     ▼
 ECS Fargate
(Spring Boot API)
     │
     ├── Verify Clerk JWT
     │
     ├── Read Secrets
     │
     └── PostgreSQL RDS
           │
           ├── Users
           ├── Sessions
           ├── Attendance Records
           └── BLE Events
```

---

## For Your Capstone I Would Deploy

### Must Have

✅ VPC  
✅ ECS Fargate  
✅ ECR  
✅ RDS PostgreSQL  
✅ ALB  
✅ ACM  
✅ Route53  
✅ Secrets Manager  
✅ CloudWatch

### Skip For Now

❌ API Gateway  
❌ Redis (ElastiCache)  
❌ Lambda  
❌ EventBridge  
❌ SQS  
❌ Kubernetes (EKS)

This gives you a professional AWS architecture that is realistic to build, easy to explain during the viva, and directly supports the BLE attendance system you've designed.
