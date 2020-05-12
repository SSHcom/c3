import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as c3 from '../lib'

it('c3.s3.Bucket compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')
    new c3.s3.Bucket(stack, 'MyS3C', {
      kmsKey,
    })

    // Note: unit test checks only Properties that impact on compliance 
    const expect = {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              KMSMasterKeyID: "alias/key",
              SSEAlgorithm: "aws:kms",
            },
          },
        ],
      },
    }

    assert.expect(stack).to(assert.countResources('AWS::S3::Bucket', 1))
    assert.expect(stack).to(assert.countResources('AWS::S3::BucketPolicy', 1))
    assert.expect(stack).to(assert.haveResource('AWS::S3::Bucket', expect))
  }
)