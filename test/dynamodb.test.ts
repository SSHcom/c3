import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as ddb from '@aws-cdk/aws-dynamodb'
import * as c3 from '../lib'

it('c3.dynamodb.Table compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')
    new c3.dynamodb.Table(stack, 'MyDDB', {
      kmsKey,
      partitionKey: {type: ddb.AttributeType.STRING, name: 'id'},
    })

    // Note: unit test checks only Properties that impact on compliance 
    const expectKey = [ "arn:aws:kms:", { "Ref": "AWS::Region" }, ":", { "Ref": "AWS::AccountId" }, ":alias/key" ]
    const expect =  {
      SSESpecification: {
        KMSMasterKeyId: { "Fn::Join": [ "", expectKey ] },
        SSEEnabled: true,
        SSEType: "KMS",
      }
    }

    assert.expect(stack).to(assert.countResources('AWS::DynamoDB::Table', 1))
    assert.expect(stack).to(assert.haveResource('AWS::DynamoDB::Table', expect))
  }
)