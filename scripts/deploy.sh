#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="${STACK_NAME:-wedding-website-stack}"
REGION="${AWS_REGION:-${VITE_AWS_REGION:-us-east-1}}"
TEMPLATE_FILE="infrastructure/template.yaml"
DIST_DIR="dist"
ENV_FILE=".env"

if ! command -v aws >/dev/null 2>&1; then
  echo "Error: AWS CLI is required." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required." >&2
  exit 1
fi

if [[ -z "${WEDDING_PASSWORD:-}" ]]; then
  echo "Error: WEDDING_PASSWORD is required." >&2
  echo "Example: WEDDING_PASSWORD='your-secure-password' npm run deploy" >&2
  exit 1
fi

echo "Building frontend..."
npm run build

echo "Deploying CloudFormation stack '${STACK_NAME}' in '${REGION}'..."
aws cloudformation deploy \
  --template-file "${TEMPLATE_FILE}" \
  --stack-name "${STACK_NAME}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "WeddingPassword=${WEDDING_PASSWORD}" \
  --region "${REGION}"

echo "Fetching stack outputs..."
API_ENDPOINT="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
  --output text \
  --region "${REGION}")"

WEBSITE_URL="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text \
  --region "${REGION}")"

WEBSITE_BUCKET="$(aws cloudformation describe-stack-resources \
  --stack-name "${STACK_NAME}" \
  --logical-resource-id WebsiteBucket \
  --query "StackResources[0].PhysicalResourceId" \
  --output text \
  --region "${REGION}")"

if [[ -z "${WEBSITE_BUCKET}" || "${WEBSITE_BUCKET}" == "None" ]]; then
  echo "Error: could not determine WebsiteBucket resource." >&2
  exit 1
fi

echo "Syncing '${DIST_DIR}/' to s3://${WEBSITE_BUCKET} ..."
aws s3 sync "${DIST_DIR}/" "s3://${WEBSITE_BUCKET}" --delete --region "${REGION}"

if [[ -n "${API_ENDPOINT}" && "${API_ENDPOINT}" != "None" ]]; then
  touch "${ENV_FILE}"
  if grep -q '^VITE_AWS_API_GATEWAY_URL=' "${ENV_FILE}"; then
    sed -i '' "s#^VITE_AWS_API_GATEWAY_URL=.*#VITE_AWS_API_GATEWAY_URL=${API_ENDPOINT}#" "${ENV_FILE}"
  else
    echo "VITE_AWS_API_GATEWAY_URL=${API_ENDPOINT}" >> "${ENV_FILE}"
  fi
  echo "Updated ${ENV_FILE} with VITE_AWS_API_GATEWAY_URL."
fi

echo "Deployment complete."
echo "API Endpoint: ${API_ENDPOINT}"
echo "Website URL: ${WEBSITE_URL}"
