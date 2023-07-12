import { Construct } from "constructs";
import path = require("path");
import * as cdk from 'aws-cdk-lib';

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from 'aws-cdk-lib/aws-iam';
import { IBucket } from "aws-cdk-lib/aws-s3";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue } from "aws-cdk-lib/aws-sqs";

export class TextToSpeech extends Construct {
    constructor(scope: Construct, id: string, props: {
        textBucket: IBucket,
        audioBucket: IBucket,
        metadataTable: ITable,
        processingQueue: IQueue

    }) {
        super(scope, id)

        const textToSpeechFunction = new NodejsFunction(this, "NodejsFunction", {
            entry: path.resolve(__dirname, "TextToSpeech.lambda.ts"),
            bundling: {
                nodeModules: ['aws-sdk'],
            },
            environment: {
                TEXT_BUCKET_NAME: props.textBucket.bucketName,
                AUDIO_BUCKET_NAME: props.audioBucket.bucketName,
                METADATA_TABLE_NAME: props.metadataTable.tableName
            },
            timeout: cdk.Duration.seconds(60) // 1 min
        })

        props.textBucket.grantRead(textToSpeechFunction);
        props.metadataTable.grantReadWriteData(textToSpeechFunction);
        props.audioBucket.grantWrite(textToSpeechFunction);
        textToSpeechFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['polly:SynthesizeSpeech'],
                resources: ['*'],
            })
        );

        textToSpeechFunction.addEventSource(
            new SqsEventSource(props.processingQueue)
        )

    }
}
