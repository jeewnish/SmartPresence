# SmartPresence deployment

The Spring Boot API is deployed to AWS ECS Fargate from the repository's
`.github/workflows/deploy.yml` workflow. The Expo application is built with EAS
from `frontend-validation/app`.

## 1. AWS prerequisites

The deployment workflow expects an existing ECS service behind an HTTPS load
balancer, an ECR repository, and an RDS PostgreSQL database. The ECS task
execution role must be allowed to pull from ECR, write CloudWatch logs, and read
the Secrets Manager values referenced by the task definition.

Use an HTTPS API hostname (for example `https://api.example.com`) with a Route 53
record and an ACM certificate attached to the load balancer. The load balancer
health-check path is `/actuator/health` on container port `8080`.

The checked-in `task-def.json` shows the environment variables and Secrets
Manager mappings required by the application. Before the first deployment,
register a task definition and create an ECS service whose container is named
`smartpresence-api`.

## 2. Configure GitHub deployment

Create protected GitHub environments named `staging` and `production`. Add the
following environment variables to each one:

| Variable | Example |
| --- | --- |
| `AWS_REGION` | `ap-southeast-1` |
| `ECR_REPOSITORY` | `smartpresence-api` |
| `ECS_CLUSTER_NAME` | `smartpresence-prod` |
| `ECS_SERVICE_NAME` | `smartpresence-api` |
| `ECS_CONTAINER_NAME` | `smartpresence-api` |
| `API_BASE_URL` | `https://api.example.com` |

Add this GitHub environment secret:

| Secret | Purpose |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | IAM role assumed by GitHub Actions through OIDC |

The IAM role trust policy must restrict GitHub's OIDC subject to this repository
and the selected GitHub environment. Grant it only the ECR and ECS operations
used by `.github/workflows/deploy.yml`, plus `iam:PassRole` for the ECS task and
execution roles.

Deploy from GitHub Actions by choosing **Deploy SmartPresence API**, selecting
`production`, and running the workflow. A push to `main` deploys the default
`staging` environment.

To deploy manually from this directory instead, replace the uppercase values:

```powershell
$AwsRegion = "ap-southeast-1"
$AwsAccountId = "YOUR_AWS_ACCOUNT_ID"
$EcrRepository = "smartpresence-api"
$ImageTag = "latest"
$Registry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

aws ecr get-login-password --region $AwsRegion |
  docker login --username AWS --password-stdin $Registry
docker build --tag "${Registry}/${EcrRepository}:${ImageTag}" .
docker push "${Registry}/${EcrRepository}:${ImageTag}"

aws ecs update-service `
  --region $AwsRegion `
  --cluster "YOUR_ECS_CLUSTER" `
  --service "YOUR_ECS_SERVICE" `
  --force-new-deployment
```

The GitHub workflow is preferred because it deploys by immutable image digest,
waits for service stability, checks the health endpoint, and rolls back a failed
release. The short manual example only republishes an image and restarts a
service whose task definition already points to the `latest` tag.

## 3. Configure EAS environments

Run these commands from `frontend-validation/app`. Log in to the Expo owner
already declared in `app.json`, then create the two public build-time variables
for each EAS environment. `EXPO_PUBLIC_*` values are embedded in the app binary,
so never put a server secret in them.

```powershell
cd frontend-validation/app
npx eas-cli@latest login

npx eas-cli@latest env:set --environment preview --visibility plaintext `
  --name EXPO_PUBLIC_API_BASE_URL --value "https://staging-api.example.com"
npx eas-cli@latest env:set --environment preview --visibility plaintext `
  --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "YOUR_CLERK_TEST_PUBLISHABLE_KEY"

npx eas-cli@latest env:set --environment production --visibility plaintext `
  --name EXPO_PUBLIC_API_BASE_URL --value "https://api.example.com"
npx eas-cli@latest env:set --environment production --visibility plaintext `
  --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "YOUR_CLERK_PRODUCTION_PUBLISHABLE_KEY"
```

The backend `CLERK_JWKS_URI` and the Expo Clerk publishable key must belong to
the same Clerk instance. Production should use Clerk production keys, not
`pk_test_...`.

## 4. Build the mobile application

Preview builds are internally installable; the Android preview is an APK:

```powershell
npm run eas:build:preview
```

Store-ready production builds:

```powershell
npm run eas:build:android
npm run eas:build:ios
```

Or build both platforms in one command:

```powershell
npm run eas:build:all
```

EAS will guide you through Android keystore and Apple signing credentials if
they have not been configured. iOS builds require an Apple Developer account;
Google Play submission requires a Play Console account.

## 5. Verify before release

```powershell
# Backend, from the repository root
./mvnw.cmd verify

# Expo configuration, from frontend-validation/app
npx expo config --type public
npx expo-doctor
```

After AWS deployment, verify `https://YOUR_API_HOST/actuator/health` returns a
JSON response with `"status":"UP"` before making a production EAS build.
