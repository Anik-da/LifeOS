const fs = require('fs');
const path = require('path');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { S3Client, PutBucketPolicyCommand, PutObjectCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  CreateOriginAccessControlCommand,
  ListOriginAccessControlsCommand,
  CreateDistributionCommand,
  ListDistributionsCommand,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    });
  }
}

loadEnv();

const region = process.env.AWS_REGION || 'us-east-1';
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error('AWS credentials missing in .env');
  process.exit(1);
}

const config = { region, credentials };
const sts = new STSClient(config);
const s3 = new S3Client(config);
const cf = new CloudFrontClient(config);

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

async function uploadDir(bucketName, localDir, baseDir) {
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    const fullPath = path.join(localDir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await uploadDir(bucketName, fullPath, baseDir);
    } else {
      const s3Key = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const body = fs.readFileSync(fullPath);
      const contentType = getContentType(fullPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: body,
          ContentType: contentType,
        })
      );
      console.log(`  Uploaded ${s3Key} (${contentType})`);
    }
  }
}

async function main() {
  console.log('🚀 Starting LifeOS Secure CloudFront + HTTPS Deployment...');

  const identity = await sts.send(new GetCallerIdentityCommand({}));
  const accountId = identity.Account || '062577348302';
  console.log(`✅ Authenticated with AWS Account: ${accountId}`);

  const webBucketName = `${accountId}-${region}-lifeos-web`;
  const s3OriginDomain = `${webBucketName}.s3.${region}.amazonaws.com`;

  // 1. Provision CloudFront Origin Access Control (OAC)
  console.log('🔑 Checking CloudFront Origin Access Control (OAC)...');
  let oacId = '';
  try {
    const oacList = await cf.send(new ListOriginAccessControlsCommand({}));
    const existingOac = oacList.OriginAccessControlList?.Items?.find((o) => o.Name === 'LifeOS-Web-OAC');
    if (existingOac) {
      oacId = existingOac.Id;
      console.log(`  Found existing OAC: ${oacId}`);
    } else {
      const newOac = await cf.send(
        new CreateOriginAccessControlCommand({
          OriginAccessControlConfig: {
            Name: 'LifeOS-Web-OAC',
            Description: 'OAC for LifeOS Web App S3 Origin',
            OriginAccessControlOriginType: 's3',
            SigningBehavior: 'always',
            SigningProtocol: 'sigv4',
          },
        })
      );
      oacId = newOac.OriginAccessControl.Id;
      console.log(`  Created Origin Access Control: ${oacId}`);
    }
  } catch (e) {
    console.error('OAC error:', e.message);
  }

  // 2. Provision CloudFront Distribution
  console.log('🌐 Provisioning CloudFront Distribution...');
  let distributionId = '';
  let distributionDomain = '';

  const distList = await cf.send(new ListDistributionsCommand({}));
  const existingDist = distList.DistributionList?.Items?.find((d) =>
    d.Origins?.Items?.some((o) => o.DomainName === s3OriginDomain)
  );

  if (existingDist) {
    distributionId = existingDist.Id;
    distributionDomain = existingDist.DomainName;
    console.log(`  Found existing CloudFront Distribution: ${distributionId} (${distributionDomain})`);
  } else {
    const callerReference = `lifeos-web-${Date.now()}`;
    const newDist = await cf.send(
      new CreateDistributionCommand({
        DistributionConfig: {
          CallerReference: callerReference,
          Comment: 'LifeOS Secure Production Web App Distribution',
          Enabled: true,
          DefaultRootObject: 'index.html',
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: `S3-${webBucketName}`,
                DomainName: s3OriginDomain,
                OriginAccessControlId: oacId,
                S3OriginConfig: {
                  OriginAccessIdentity: '',
                },
              },
            ],
          },
          DefaultCacheBehavior: {
            TargetOriginId: `S3-${webBucketName}`,
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS'],
              CachedMethods: {
                Quantity: 3,
                Items: ['GET', 'HEAD', 'OPTIONS'],
              },
            },
            Compress: true,
            CachePolicyId: '658327ea-f89d-4fcb-a63a-7e4e42158641', // AWS Managed CachingOptimized
            ResponseHeadersPolicyId: '67f5470d-4f36-4a60-8b70-7772c6437419', // AWS Managed SecurityHeadersPolicy
          },
          CustomErrorResponses: {
            Quantity: 2,
            Items: [
              {
                ErrorCode: 403,
                ResponsePagePath: '/index.html',
                ResponseCode: '200',
                ErrorCachingMinTTL: 1,
              },
              {
                ErrorCode: 404,
                ResponsePagePath: '/index.html',
                ResponseCode: '200',
                ErrorCachingMinTTL: 1,
              },
            ],
          },
        },
      })
    );
    distributionId = newDist.Distribution.Id;
    distributionDomain = newDist.Distribution.DomainName;
    console.log(`  Created CloudFront Distribution: ${distributionId} (${distributionDomain})`);
  }

  // 3. Update S3 Bucket Policy for OAC
  console.log('🛡️ Updating S3 Bucket Policy for CloudFront OAC...');
  const oacPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowCloudFrontServicePrincipalReadOnly',
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${webBucketName}/*`,
        Condition: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`,
          },
        },
      },
    ],
  };

  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: webBucketName,
        Policy: JSON.stringify(oacPolicy),
      })
    );
    console.log('  Updated S3 Bucket Policy for CloudFront OAC read access.');
  } catch (e) {
    console.log(`  S3 Bucket policy update notice: ${e.message}`);
  }

  // 4. Upload Dist Assets to S3
  const distDir = path.resolve(__dirname, '../../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Frontend dist/ folder missing. Run "npm run build" first.');
  }

  console.log('📤 Uploading frontend assets to S3...');
  await uploadDir(webBucketName, distDir, distDir);

  // 5. Invalidate CloudFront Cache
  if (distributionId) {
    console.log('🔄 Invalidating CloudFront Cache (/*)...');
    try {
      const invRes = await cf.send(
        new CreateInvalidationCommand({
          DistributionId: distributionId,
          InvalidationBatch: {
            CallerReference: `inv-${Date.now()}`,
            Paths: {
              Quantity: 1,
              Items: ['/*'],
            },
          },
        })
      );
      console.log(`  Created CloudFront Invalidation: ${invRes.Invalidation?.Id}`);
    } catch (e) {
      console.log(`  CloudFront Invalidation notice: ${e.message}`);
    }
  }

  const httpsUrl = `https://${distributionDomain}`;
  const httpUrl = `http://${distributionDomain}`;

  console.log('\n==================================================');
  console.log('🎉 LIFEOS SECURE CLOUDFRONT + HTTPS IS LIVE!');
  console.log('==================================================');
  console.log(`📌 CloudFront Distribution ID: ${distributionId}`);
  console.log(`📌 HTTPS Secure Production URL: ${httpsUrl}`);
  console.log(`📌 HTTP Redirect URL:           ${httpUrl}`);
  console.log(`📌 S3 Web Bucket Name:          ${webBucketName}`);
  console.log(`📌 AWS Region:                  ${region}`);
  console.log('==================================================\n');

  // Save distribution info to root .env
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  let envLines = fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf-8').split('\n') : [];
  envLines = envLines.filter((l) => !l.startsWith('CLOUDFRONT_DISTRIBUTION_ID=') && !l.startsWith('CLOUDFRONT_DOMAIN='));
  envLines.push(`CLOUDFRONT_DISTRIBUTION_ID=${distributionId}`);
  envLines.push(`CLOUDFRONT_DOMAIN=${distributionDomain}`);
  fs.writeFileSync(rootEnvPath, envLines.join('\n'));
}

main().catch((err) => {
  console.error('❌ CloudFront Deployment Error:', err);
  process.exit(1);
});
