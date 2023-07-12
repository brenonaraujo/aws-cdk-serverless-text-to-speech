import { S3, DynamoDB, Polly } from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { GenerateUUID } from './utils/UUIDGenerator';

const s3 = new S3();
const dynamodb = new DynamoDB.DocumentClient();
const polly = new Polly();

exports.handler = async (event: SQSEvent) => {
    const textBucketName = process.env.TEXT_BUCKET_NAME || '';
    const audioBucketName = process.env.AUDIO_BUCKET_NAME || '';
    const metadataTableName = process.env.METADATA_TABLE_NAME || '';

    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        const textKey = body.Records[0].s3.object.key;

        // Read the text file from the text bucket
        const textObject = await s3.getObject({
            Bucket: textBucketName,
            Key: textKey
        }).promise();
        if (!textObject.Body) {
            throw new Error(`Failed to get text body from S3 object: ${textKey}`);
        }
        const text = textObject.Body.toString();

        const pollyResponse = await polly.synthesizeSpeech({
            OutputFormat: 'mp3',
            Text: text,
            VoiceId: 'Joanna',
        }).promise();

        if (pollyResponse.AudioStream) {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const timestamp = Date.now();

            const uuid = GenerateUUID();

            const audioKey = `synthesized/${uuid}/year=${year}/month=${month}/day=${day}/${timestamp}.mp3`;
            await s3.putObject({
                Bucket: audioBucketName,
                Key: audioKey,
                Body: pollyResponse.AudioStream
            }).promise();

            await dynamodb.put({
                TableName: metadataTableName,
                Item: {
                    'uuid': uuid,
                    'submissionTime': textObject.LastModified?.toISOString(),
                    'textKey': textKey,
                    'audioKey': audioKey,
                    'characters': pollyResponse.RequestCharacters,
                    'status': 'completed'
                }
            }).promise();
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify('Text to speech conversion completed successfully!'),
    };
};
