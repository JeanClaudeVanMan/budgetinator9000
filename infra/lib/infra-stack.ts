import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { appNamePrefix, senderEmail } from '../constants';
import { BudgetinatorFunction } from './constructs/BudgetinatorFunction';
import { PipelineStateMachine } from './constructs/pipeline/PipelineStateMachine';

export class BaseInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, `${appNamePrefix}TransactionsBucket`, {
      lifecycleRules: [
        {
          prefix: 'quarantine/',
          expiration: cdk.Duration.days(90),
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      eventBridgeEnabled: true,
    });

    const table = new dynamodb.Table(this, `${appNamePrefix}Transactions`, {
      tableName: `${appNamePrefix}Transactions`,
      partitionKey: { name: 'yearMonth', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'dateId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const lambdaDir = (name: string) => `../lambdas/${name}/src/index.ts`;

    // Validates and normalises uploaded CSV rows
    const cleaner = new BudgetinatorFunction(this, 'Cleaner', {
      entry: lambdaDir('cleaner'),
    });

    // Matches transactions to categories by description
    const categorizer = new BudgetinatorFunction(this, 'Categorizer', {
      entry: lambdaDir('categorizer'),
    });

    // Persists categorized and uncategorized transactions to DynamoDB
    const recorder = new BudgetinatorFunction(this, 'Recorder', {
      entry: lambdaDir('recorder'),
    });

    // Queries DynamoDB and builds the monthly report payload
    const reportMaker = new BudgetinatorFunction(this, 'ReportMaker', {
      entry: lambdaDir('report-maker'),
    });

    // Sends the report or error alert via SES
    const notifier = new BudgetinatorFunction(this, 'Notifier', {
      entry: lambdaDir('notifier'),
    });

    bucket.grantRead(cleaner);
    bucket.grantReadWrite(categorizer);
    table.grantWriteData(recorder);
    table.grantReadData(reportMaker);
    notifier.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );

    const { stateMachine } = new PipelineStateMachine(this, 'Pipeline');

    new events.Rule(this, `${appNamePrefix}UploadRule`, {
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['Object Created'],
        detail: {
          bucket: { name: [bucket.bucketName] },
          object: { key: [{ prefix: 'uploads/' }] },
        },
      },
      targets: [new targets.SfnStateMachine(stateMachine)],
    });

    new ses.EmailIdentity(this, `${appNamePrefix}SenderIdentity`, {
      identity: ses.Identity.email(senderEmail),
    });
  }
}
