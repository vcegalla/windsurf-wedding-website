# Wedding Event Website (AWS)

A wedding website with:

- Simple password-based guest login
- RSVP submission/update form
- AWS-backed API + data storage
- Static frontend hosting on S3 website hosting

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: AWS Lambda + API Gateway
- Database: DynamoDB
- Hosting: Amazon S3 static website hosting
- Infrastructure as code: CloudFormation (`infrastructure/template.yaml`)

## Project Structure

- `src/` - React frontend
- `src/services/api.ts` - API client for auth + RSVP
- `lambda/` - Lambda source handlers
- `infrastructure/template.yaml` - CloudFormation stack
- `.env.example` - frontend environment variable template

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

Optional type check:

```bash
npm run typecheck
```

The app runs at `http://localhost:3000`.

If `VITE_AWS_API_GATEWAY_URL` is empty, login and RSVP calls use local fallback behavior for quick UI testing.

## One-Command Deploy

Prerequisites:

- AWS CLI configured (`aws configure`)
- Valid AWS credentials with access to CloudFormation, Lambda, API Gateway, DynamoDB, S3, and IAM

Run everything (build + infrastructure deploy + S3 upload) with one command:

```bash
WEDDING_PASSWORD='your-secure-password' npm run deploy
```

Optional overrides:

```bash
STACK_NAME=my-wedding-stack AWS_REGION=us-east-1 WEDDING_PASSWORD='your-secure-password' npm run deploy
```

The script will:

- Build the frontend
- Deploy/update CloudFormation stack
- Upload `dist/` to the stack's S3 website bucket
- Update `.env` with `VITE_AWS_API_GATEWAY_URL`

## Deploy AWS Infrastructure (Manual)

Use CloudFormation template in `infrastructure/template.yaml`.

```bash
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name wedding-website-stack \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides WeddingPassword='your-secure-password'
```

After deployment, get outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name wedding-website-stack \
  --query "Stacks[0].Outputs"
```

Use the `APIEndpoint` output in frontend env:

```env
VITE_AWS_API_GATEWAY_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

## Deploy Frontend to S3 (Manual)

1. Build frontend:

```bash
npm run build
```

2. Upload to the stack-created website bucket:

```bash
aws s3 sync dist/ s3://<your-website-bucket-name> --delete
```

3. Open the CloudFormation `WebsiteURL` output.

## Environment Variables

Frontend variables (`.env`):

- `VITE_AWS_API_GATEWAY_URL` - API Gateway base URL (with `/prod` stage)
- `VITE_WEDDING_PASSWORD` - local fallback password only

AWS stack parameter:

- `WeddingPassword` - password checked by Lambda auth endpoint

## API Endpoints

- `POST /auth/login`
  - body: `{ "guestName": "Jane Doe", "password": "..." }`
- `POST /rsvp`
  - body: `{ "name": "Jane Doe", "attending": true, "guests": 2, "dietary": "", "message": "" }`
- `GET /rsvp?name=Jane%20Doe`

## Notes

- This is intentionally simple password auth (shared password), as requested.
- For stronger auth, replace with Cognito user pools and JWT-protected API routes.
