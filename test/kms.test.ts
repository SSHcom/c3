import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { kms } from '../lib'

const allowRootAccess = {
  Action: "kms:*",
  Effect: 'Allow',
  Principal: {
    AWS: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':iam::',
          {
            Ref: 'AWS::AccountId',
          },
          ':root',
        ],
      ],
    },
  },
  Resource: '*',
}

it('symmetric kms.Key compliant with CIS 2.8',
  () => {
    const stack = new cdk.Stack()
    new kms.SymmetricKey(stack, 'MyKey')
    
    const expect = {
      Properties: {
        EnableKeyRotation: true,
        KeyPolicy: {
          Statement: [allowRootAccess],
          Version: '2012-10-17',
        },
      },
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    }

    assert.expect(stack).to(assert.countResources('AWS::KMS::Key', 1))
    assert.expect(stack).to(assert.haveResource('AWS::KMS::Key', expect, assert.ResourcePart.CompleteDefinition))
  }
)

it('symmetric kms.Key defines an alias',
  () => {
    const stack = new cdk.Stack()
    new kms.SymmetricKey(stack, 'MyKey')

    const expect = {
      AliasName: 'alias/MyKey',
      TargetKeyId: {
        'Fn::GetAtt': ['MyKey6AB29FA6', 'Arn'],
      },
    }

    assert.expect(stack).to(assert.countResources('AWS::KMS::Alias', 1))
    assert.expect(stack).to(assert.haveResource('AWS::KMS::Alias', expect))
  }
)
