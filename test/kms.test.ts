import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
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

it('kms.Key alias does nothing',
  () => {
    const stack = new cdk.Stack()
    const key = kms.fromAlias(stack, 'alias/key')
    const role = new iam.ArnPrincipal(`arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/Role`)

    expect(() => key.addAlias('other')).toThrow()
    expect(() => key.addToResourcePolicy(new iam.PolicyStatement())).toThrow()
    expect(() => key.grant(role)).toThrow()
    expect(() => key.grantDecrypt(role)).toThrow()
    expect(() => key.grantEncrypt(role)).toThrow()
    expect(() => key.grantEncryptDecrypt(role)).toThrow()

    assert.expect(stack).to(assert.countResources('AWS::KMS::Alias', 0))
  }
)