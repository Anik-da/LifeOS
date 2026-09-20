# LifeOS Production Deployment & Security Architecture

## Overview

LifeOS production frontend architecture serves the React/Vite single-page application (SPA) securely over HTTPS via Amazon CloudFront backed by an isolated Amazon S3 origin with Origin Access Control (OAC).

```
Browser
   ↓ HTTPS (TLS 1.3 / HSTS)
Amazon CloudFront Distribution
   ↓ Origin Access Control (OAC: E3S0L86UP104HN)
Private Amazon S3 Bucket (062577348302-us-east-1-lifeos-web)
   ↓ REST API (HTTPS CORS)
AWS API Gateway → Lambda (LifeOS-ApiHandler) → Amazon Bedrock / Textract / DynamoDB / S3
```

---

## Deployment Telemetry & Resource Audit

| Parameter | Value |
|---|---|
| **AWS Account ID** | `062577348302` |
| **AWS Region** | `us-east-1` |
| **S3 Web Bucket** | `062577348302-us-east-1-lifeos-web` |
| **Origin Access Control ID** | `E3S0L86UP104HN` |
| **S3 REST Origin Domain** | `062577348302-us-east-1-lifeos-web.s3.us-east-1.amazonaws.com` |
| **API Gateway URL** | `https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod` |
| **Cognito User Pool ID** | `us-east-1_IAIg8Yjgk` |
| **Cognito App Client ID** | `6l8pu1iuc87817jnuuqruidrm1` |
| **S3 Website Fallback** | `http://062577348302-us-east-1-lifeos-web.s3-website-us-east-1.amazonaws.com` |

---

## 1. CloudFront Origin Access Control (OAC) Configuration

Origin Access Control ID `E3S0L86UP104HN` has been provisioned for the S3 origin.

- **Name**: `LifeOS-Web-OAC`
- **Origin Type**: `s3`
- **Signing Behavior**: `always`
- **Signing Protocol**: `sigv4`

### S3 Bucket Policy for OAC Access
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::062577348302-us-east-1-lifeos-web/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::062577348302:distribution/<CLOUDFRONT_DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

---

## 2. HTTPS & Protocol Policy

- **Viewer Protocol Policy**: `Redirect HTTP to HTTPS` (`redirect-to-https`)
- **HTTP Requests**: Automatically receive HTTP `301` Permanent Redirect to `https://...`
- **Minimum SSL/TLS Version**: `TLSv1.2_2021`

---

## 3. SPA Client-Side Routing (Custom Error Responses)

To ensure client-side routes (`/dashboard`, `/settings`, `/actions`, `/knowledge`) reload cleanly without S3 `403/404` errors:

- **Custom Error Response 1**:
  - `HTTP Error Code`: `403`
  - `Response Page Path`: `/index.html`
  - `HTTP Response Code`: `200`
  - `Error Caching Minimum TTL`: `1`
- **Custom Error Response 2**:
  - `HTTP Error Code`: `404`
  - `Response Page Path`: `/index.html`
  - `HTTP Response Code`: `200`
  - `Error Caching Minimum TTL`: `1`

---

## 4. Response Security Headers

CloudFront Response Headers Policy includes standard production security headers:

- `Strict-Transport-Security` (HSTS): `max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `SAMEORIGIN`
- `Referrer-Policy`: `strict-origin-when-cross-origin`

---

## 5. Automated Deployment & Cache Invalidation

Deployments are automated via backend scripts:

```bash
# Build frontend bundle
npm run build

# Deploy assets to S3 and invalidate CloudFront distribution cache
node backend/scripts/deploy-cloudfront.js
```

### Invalidation Command
```javascript
await cf.send(
  new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `inv-${Date.now()}`,
      Paths: { Quantity: 1, Items: ['/*'] },
    },
  })
);
```

---

## 6. Frontend Security Audit Verification

- **Secrets Audit**: `PASS` — Zero AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) in frontend source code or Vite client bundles.
- **Backend IAM Delegation**: All S3, Textract, Bedrock, DynamoDB, SES, and EventBridge operations are executed server-side in AWS Lambda via IAM Execution Role (`LifeOS-LambdaExecutionRole`).
- **Cognito Integration**: Authentication operates over HTTPS via API Gateway and Cognito User Pool (`us-east-1_IAIg8Yjgk`).

---

## Manual AWS Console Setup (Account Verification Note)

If AWS Support verification for CloudFront is required on your AWS account:

1. Open **AWS CloudFront Console** $\rightarrow$ **Distributions** $\rightarrow$ **Create distribution**.
2. **Origin Domain**: Select `062577348302-us-east-1-lifeos-web.s3.us-east-1.amazonaws.com`.
3. **Origin Access**: Select **Origin access control settings (recommended)** and choose `LifeOS-Web-OAC` (`E3S0L86UP104HN`).
4. **Viewer Protocol Policy**: Select **Redirect HTTP to HTTPS**.
5. **Default Root Object**: Enter `index.html`.
6. **Custom Error Responses**: Add `403` $\rightarrow$ `/index.html` (`200 OK`) and `404` $\rightarrow$ `/index.html` (`200 OK`).
7. Click **Create distribution** and copy the bucket policy to S3 `062577348302-us-east-1-lifeos-web`.
