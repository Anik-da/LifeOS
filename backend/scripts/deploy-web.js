const fs = require('fs');
const path = require('path');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutObjectCommand, DeletePublicAccessBlockCommand } = require('@aws-sdk/client-s3');

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

const sts = new STSClient({ region, credentials });
const s3 = new S3Client({ region, credentials });

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

async function deployWeb() {
  console.log('🚀 Deploying LifeOS Frontend to AWS S3 Static Website Hosting...');

  const identity = await sts.send(new GetCallerIdentityCommand({}));
  const accountId = identity.Account || '062577348302';
  const buckets = [`${accountId}-${region}-lifeos-web`, `${accountId}-${region}-lifeos-web3`];

  const distDir = path.resolve(__dirname, '../../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Frontend dist/ folder missing. Run "npm run build" first.');
  }

  for (const webBucketName of buckets) {
    console.log(`📦 Creating/Configuring Public S3 Bucket: ${webBucketName}...`);
    try {
      await s3.send(new CreateBucketCommand({ Bucket: webBucketName }));
    } catch (err) {
      if (err.name !== 'BucketAlreadyOwnedByYou' && err.name !== 'BucketAlreadyExists') {
        console.log(`Bucket notice: ${err.message}`);
      }
    }

    try {
      await s3.send(new DeletePublicAccessBlockCommand({ Bucket: webBucketName }));
    } catch (e) {
      console.log(`Public access block notice: ${e.message}`);
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${webBucketName}/*`,
        },
      ],
    };

    try {
      await s3.send(
        new PutBucketPolicyCommand({
          Bucket: webBucketName,
          Policy: JSON.stringify(policy),
        })
      );
    } catch (e) {
      console.log(`Bucket policy notice: ${e.message}`);
    }

    await s3.send(
      new PutBucketWebsiteCommand({
        Bucket: webBucketName,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'index.html' },
        },
      })
    );

    console.log(`📤 Uploading frontend assets to ${webBucketName}...`);
    await uploadDir(webBucketName, distDir, distDir);

    const websiteUrl = `http://${webBucketName}.s3-website-${region}.amazonaws.com`;
    console.log(`🌐 Public Link: ${websiteUrl}`);
  }
}

deployWeb().catch((err) => {
  console.error('❌ Web Deployment Error:', err);
  process.exit(1);
});
