# Welcome to your CDK TypeScript project - AWS CDK Serverless Text-to-speech pipeline

This project sets up an AWS infrastructure for a text-to-speech application using the AWS Cloud Development Kit (CDK). The infrastructure includes two S3 buckets for storing text and audio files, a DynamoDB table for storing metadata, an SQS queue for processing, and a Lambda function for handling text submissions and converting text to speech.

## Deploying with CDK

Before you can deploy this project, you need to have the AWS CDK installed. If you haven't installed it yet, you can do so by running `npm install -g aws-cdk`. You also need to have your AWS credentials set up. You can follow the [AWS CDK Getting Started guide](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) for more information.

Once you have the AWS CDK installed and your credentials set up, you can deploy the project by following these steps:

- Clone the repository:
`git clone git@github.com:brenonaraujo/aws-cdk-serverless-text-to-speech.git`

- Navigate to the project directory:
 `cd aws-cdk-serverless-text-to-speech`

- Install the dependencies:
 `npm install`

- Compile the TypeScript code:
 `npm run build`

- Deploy the stack:
 `cdk deploy`

Please note that the `cdk deploy` command will create real resources in your AWS account and may incur costs if you are out of the free tier period (12 months after account creation).

Once your are done, you can just destroy all the resources created:
 `cdk destroy`

 This code is part of two blog posts maded on dev.to if you wanna to dive in and get more explanations about this project please check it out:
 - []()
 - []()
