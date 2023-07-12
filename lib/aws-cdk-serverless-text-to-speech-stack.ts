import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkServerlessTextToSpeechStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const textBucket = new s3.Bucket(this, 'gptts-text-bucket', {
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const audioBucket = new s3.Bucket(this, 'gptts-audio-bucket', {
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const metadataTable = new dynamodb.Table(this, 'MetadataTable', {
      partitionKey: { name: 'uuid', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'submissionTime', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const processingQueue = new sqs.Queue(this, 'ProcessingQueue', {
      visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes
    });

    textBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(processingQueue), { prefix: 'upload/' });

  }
}
