const fs = require('fs');
const path = require('path');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { CognitoIdentityProviderClient, CreateUserPoolCommand, CreateUserPoolClientCommand, ListUserPoolsCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, GetRoleCommand } = require('@aws-sdk/client-iam');
const { LambdaClient, CreateFunctionCommand, UpdateFunctionCodeCommand, UpdateFunctionConfigurationCommand, GetFunctionCommand, AddPermissionCommand } = require('@aws-sdk/client-lambda');
const { APIGatewayClient, CreateRestApiCommand, GetResourcesCommand, CreateResourceCommand, PutMethodCommand, PutIntegrationCommand, CreateDeploymentCommand, GetRestApisCommand } = require('@aws-sdk/client-api-gateway');

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
const ddb = new DynamoDBClient(config);
const cognito = new CognitoIdentityProviderClient(config);
const iam = new IAMClient(config);
const lambda = new LambdaClient(config);
const apiGw = new APIGatewayClient(config);

async function createZipBuffer() {
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('backend/dist directory does not exist.');
  }

  const files = [];
  function addFilesFromDir(dir, baseDir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const fullPath = path.join(dir, item);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFilesFromDir(fullPath, baseDir);
      } else {
        files.push({ name: relPath, content: fs.readFileSync(fullPath) });
      }
    }
  }

  addFilesFromDir(distDir, distDir);

  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    files.forEach((f) => zip.addFile(f.name, f.content));
    return zip.toBuffer();
  } catch {
    const child_process = require('child_process');
    const zipPath = path.resolve(__dirname, '../dist.zip');
    if (process.platform === 'win32') {
      child_process.execSync(`powershell Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipPath}" -Force`);
    } else {
      child_process.execSync(`zip -r "${zipPath}" .`, { cwd: distDir });
    }
    const buf = fs.readFileSync(zipPath);
    try { fs.unlinkSync(zipPath); } catch {}
    return buf;
  }
}

async function main() {
  console.log('🚀 Starting LifeOS AWS Deployment...');

  const identity = await sts.send(new GetCallerIdentityCommand({}));
  const accountId = identity.AccountId;
  console.log(`✅ Authenticated with AWS Account: ${accountId} (${identity.Arn})`);

  const bucketName = process.env.S3_BUCKET_NAME || `${accountId}-${region}-lifeos-documents`;
  console.log(`📦 Checking S3 Bucket: ${bucketName}...`);
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`  Created S3 Bucket: ${bucketName}`);
  } catch (err) {
    if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
      console.log(`  S3 Bucket already exists.`);
    } else {
      console.log(`  S3 Bucket notice: ${err.message}`);
    }
  }

  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );
    console.log(`  Set S3 Bucket CORS rules.`);
  } catch (err) {
    console.log(`  S3 CORS notice: ${err.message}`);
  }

  const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'LifeOS';
  const tableNames = ['Documents', 'Actions', 'Workflows', 'Changes', 'Notifications', 'Career', 'Finance', 'Security'];

  for (const tName of tableNames) {
    const fullTableName = `${tablePrefix}-${tName}`;
    try {
      await ddb.send(new DescribeTableCommand({ TableName: fullTableName }));
      console.log(`📊 Table ${fullTableName} ready.`);
    } catch {
      console.log(`📊 Creating table ${fullTableName}...`);
      try {
        await ddb.send(
          new CreateTableCommand({
            TableName: fullTableName,
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [
              { AttributeName: 'userId', AttributeType: 'S' },
              { AttributeName: 'id', AttributeType: 'S' },
            ],
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'id', KeyType: 'RANGE' },
            ],
          })
        );
        console.log(`  Created table ${fullTableName}.`);
      } catch (e) {
        console.log(`  Table creation notice: ${e.message}`);
      }
    }
  }

  let userPoolId = process.env.COGNITO_USER_POOL_ID;
  let userPoolClientId = process.env.COGNITO_CLIENT_ID;

  console.log('🔑 Checking Cognito User Pool...');
  try {
    const poolList = await cognito.send(new ListUserPoolsCommand({ MaxResults: 10 }));
    const existingPool = poolList.UserPools?.find((p) => p.Name === `${tablePrefix}-UserPool`);

    if (existingPool) {
      userPoolId = existingPool.Id;
      console.log(`  Found existing User Pool: ${userPoolId}`);
    } else {
      const newPool = await cognito.send(
        new CreateUserPoolCommand({
          PoolName: `${tablePrefix}-UserPool`,
          AutoVerifiedAttributes: ['email'],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: false,
              RequireUppercase: true,
            },
          },
        })
      );
      userPoolId = newPool.UserPool.Id;
      console.log(`  Created User Pool: ${userPoolId}`);
    }
  } catch (err) {
    console.log(`  Cognito User Pool notice: ${err.message}`);
  }

  if (userPoolId && !userPoolClientId) {
    try {
      const clientRes = await cognito.send(
        new CreateUserPoolClientCommand({
          UserPoolId: userPoolId,
          ClientName: `${tablePrefix}-UserPoolClient`,
          GenerateSecret: false,
          ExplicitAuthFlows: ['ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH', 'ALLOW_USER_PASSWORD_AUTH'],
        })
      );
      userPoolClientId = clientRes.UserPoolClient.ClientId;
      console.log(`  Created User Pool Client ID: ${userPoolClientId}`);
    } catch (err) {
      console.log(`  Cognito Client notice: ${err.message}`);
    }
  }

  const roleName = `${tablePrefix}-LambdaExecutionRole`;
  let roleArn = `arn:aws:iam::${accountId}:role/${roleName}`;

  console.log('🛡️ Checking IAM Lambda Execution Role...');
  try {
    const roleRes = await iam.send(new GetRoleCommand({ RoleName: roleName }));
    roleArn = roleRes.Role.Arn;
    console.log(`  Found existing IAM Role: ${roleArn}`);
  } catch {
    console.log(`  Creating IAM Role ${roleName}...`);
    try {
      const assumeRolePolicyDocument = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole',
          },
        ],
      });

      const roleRes = await iam.send(
        new CreateRoleCommand({
          RoleName: roleName,
          AssumeRolePolicyDocument: assumeRolePolicyDocument,
          Description: 'Execution role for LifeOS Lambda handlers',
        })
      );
      roleArn = roleRes.Role.Arn;

      const policiesToAttach = [
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        'arn:aws:iam::aws:policy/AmazonBedrockFullAccess',
        'arn:aws:iam::aws:policy/AmazonTextractFullAccess',
        'arn:aws:iam::aws:policy/AmazonS3FullAccess',
        'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
        'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess',
        'arn:aws:iam::aws:policy/AmazonSESFullAccess',
      ];

      for (const policyArn of policiesToAttach) {
        try {
          await iam.send(new AttachRolePolicyCommand({ RoleName: roleName, PolicyArn: policyArn }));
        } catch {}
      }
      console.log(`  Created IAM Role: ${roleArn}`);
      await new Promise((r) => setTimeout(r, 10000));
    } catch (err) {
      console.log(`  IAM Role creation notice: ${err.message}`);
    }
  }

  console.log('⚡ Preparing Lambda deployment package...');
  const zipBuffer = await createZipBuffer();
  const functionName = `${tablePrefix}-ApiHandler`;
  const lambdaFunctionArn = `arn:aws:lambda:${region}:${accountId}:function:${functionName}`;

  const lambdaEnvVars = {
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    S3_BUCKET_NAME: bucketName,
    DYNAMODB_TABLE_PREFIX: tablePrefix,
    COGNITO_USER_POOL_ID: userPoolId || '',
    COGNITO_CLIENT_ID: userPoolClientId || '',
    API_HANDLER_FUNCTION_ARN: lambdaFunctionArn,
    LAMBDA_FUNCTION_ARN: lambdaFunctionArn,
    SCHEDULER_ROLE_ARN: roleArn,
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || 'notifications@lifeos.app',
  };

  let lambdaArn = '';
  console.log(`⚡ Deploying Lambda Function: ${functionName}...`);
  try {
    const fnRes = await lambda.send(new GetFunctionCommand({ FunctionName: functionName }));
    lambdaArn = fnRes.Configuration.FunctionArn;
    console.log(`  Updating existing Lambda code...`);
    await lambda.send(new UpdateFunctionCodeCommand({ FunctionName: functionName, ZipFile: zipBuffer }));

    // Wait for function update to complete
    let attempts = 0;
    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 1500));
      const statusRes = await lambda.send(new GetFunctionCommand({ FunctionName: functionName }));
      const status = statusRes.Configuration.LastUpdateStatus;
      if (status === 'Successful' || status === undefined) break;
      attempts++;
    }

    console.log(`  Updating existing Lambda configuration...`);
    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        Runtime: 'nodejs22.x',
        Environment: { Variables: lambdaEnvVars },
        Timeout: 30,
        MemorySize: 512,
      })
    );
    console.log(`  Successfully updated Lambda: ${functionName}`);

  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`  Creating new Lambda function ${functionName}...`);
      try {
        const createRes = await lambda.send(
          new CreateFunctionCommand({
            FunctionName: functionName,
            Runtime: 'nodejs22.x',
            Role: roleArn,
            Handler: 'index.handler',
            Code: { ZipFile: zipBuffer },
            Timeout: 30,
            MemorySize: 512,
            Environment: { Variables: lambdaEnvVars },
          })
        );
        lambdaArn = createRes.FunctionArn;
        console.log(`  Created Lambda Function: ${lambdaArn}`);
      } catch (e) {
        console.error(`  Lambda creation error: ${e.message}`);
      }
    } else {
      console.log(`  Lambda update notice: ${err.message}`);
    }
  }

  console.log('🌐 Provisioning API Gateway REST API...');
  const apiName = `${tablePrefix}-API`;
  let restApiId = '';

  const apiList = await apiGw.send(new GetRestApisCommand({}));
  const existingApi = apiList.items?.find((a) => a.name === apiName);

  if (existingApi) {
    restApiId = existingApi.id;
    console.log(`  Found existing API Gateway REST API: ${restApiId}`);
  } else {
    const newApi = await apiGw.send(
      new CreateRestApiCommand({
        name: apiName,
        description: 'REST API Gateway for LifeOS Serverless Backend',
        endpointConfiguration: { types: ['REGIONAL'] },
      })
    );
    restApiId = newApi.id;
    console.log(`  Created API Gateway REST API: ${restApiId}`);
  }

  if (restApiId && lambdaArn) {
    try {
      const resourcesRes = await apiGw.send(new GetResourcesCommand({ restApiId }));
      const rootResource = resourcesRes.items.find((r) => r.path === '/');

      let proxyResourceId = resourcesRes.items.find((r) => r.path === '/{proxy+}')?.id;
      if (!proxyResourceId && rootResource) {
        const proxyRes = await apiGw.send(
          new CreateResourceCommand({
            restApiId,
            parentId: rootResource.id,
            pathPart: '{proxy+}',
          })
        );
        proxyResourceId = proxyRes.id;
      }

      if (proxyResourceId) {
        try {
          await apiGw.send(
            new PutMethodCommand({
              restApiId,
              resourceId: proxyResourceId,
              httpMethod: 'ANY',
              authorizationType: 'NONE',
            })
          );
        } catch {}

        const lambdaUri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
        await apiGw.send(
          new PutIntegrationCommand({
            restApiId,
            resourceId: proxyResourceId,
            httpMethod: 'ANY',
            type: 'AWS_PROXY',
            integrationHttpMethod: 'POST',
            uri: lambdaUri,
          })
        );

        try {
          await apiGw.send(
            new PutMethodCommand({
              restApiId,
              resourceId: rootResource.id,
              httpMethod: 'ANY',
              authorizationType: 'NONE',
            })
          );
          await apiGw.send(
            new PutIntegrationCommand({
              restApiId,
              resourceId: rootResource.id,
              httpMethod: 'ANY',
              type: 'AWS_PROXY',
              integrationHttpMethod: 'POST',
              uri: lambdaUri,
            })
          );
        } catch {}
      }

      try {
        await lambda.send(
          new AddPermissionCommand({
            FunctionName: functionName,
            StatementId: `apigateway-invoke-${Date.now()}`,
            Action: 'lambda:InvokeFunction',
            Principal: 'apigateway.amazonaws.com',
            SourceArn: `arn:aws:execute-api:${region}:${accountId}:${restApiId}/*/*/*`,
          })
        );
      } catch {}

      await apiGw.send(new CreateDeploymentCommand({ restApiId, stageName: 'Prod' }));
      console.log(`  Deployed API Gateway stage "Prod".`);
    } catch (err) {
      console.log(`  API Gateway configuration notice: ${err.message}`);
    }
  }

  const liveApiUrl = `https://${restApiId}.execute-api.${region}.amazonaws.com/Prod`;

  console.log('\n==================================================');
  console.log('🎉 LIFEOS AWS BACKEND DEPLOYMENT COMPLETE!');
  console.log('==================================================');
  console.log(`📌 Live API Gateway URL: ${liveApiUrl}`);
  console.log(`📌 Cognito User Pool ID: ${userPoolId || 'N/A'}`);
  console.log(`📌 Cognito Client ID:    ${userPoolClientId || 'N/A'}`);
  console.log(`📌 Document S3 Bucket:   ${bucketName}`);
  console.log(`📌 AWS Region:           ${region}`);
  console.log('==================================================\n');

  const rootEnvPath = path.resolve(__dirname, '../../.env');
  let envLines = fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf-8').split('\n') : [];
  envLines = envLines.filter((l) => !l.startsWith('VITE_API_BASE_URL=') && !l.startsWith('COGNITO_USER_POOL_ID=') && !l.startsWith('COGNITO_CLIENT_ID='));
  envLines.push(`VITE_API_BASE_URL=${liveApiUrl}`);
  if (userPoolId) envLines.push(`COGNITO_USER_POOL_ID=${userPoolId}`);
  if (userPoolClientId) envLines.push(`COGNITO_CLIENT_ID=${userPoolClientId}`);
  fs.writeFileSync(rootEnvPath, envLines.join('\n'));
  console.log('✅ Updated root .env file with live VITE_API_BASE_URL.');
}

main().catch((err) => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
