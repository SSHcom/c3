import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as c3 from '../lib'

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

const allowCloudWatch = {
  Action: [
    'kms:Encrypt*',
    'kms:Decrypt*',
    'kms:ReEncrypt*',
    'kms:GenerateDataKey*',
    'kms:Describe*',
  ],
  Effect: 'Allow',
  Principal: {
    Service: {
      'Fn::Join': ['', ['logs.', { Ref: 'AWS::Region' }, '.amazonaws.com' ]],
    }
  },
  Resource: '*',
}

it('symmetric kms.Key compliant with CIS 2.8',
  () => {
    const stack = new cdk.Stack()
    const key = new c3.kms.SymmetricKey(stack, 'MyKey')
    
    const expectKey = {
      Properties: {
        EnableKeyRotation: true,
        KeyPolicy: {
          Statement: [allowRootAccess],
          Version: '2012-10-17',
        },
        Tags: [
          {
            Key: "stack",
            Value: { Ref: "AWS::StackName" },
          },
        ]
      },
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    }

    expect(key.alias.aliasName).toBe('MyKey')
    expect(key.alias.aliasTargetKey).toBeUndefined()
    assert.expect(stack).to(assert.countResources('AWS::KMS::Key', 1))
    assert.expect(stack).to(assert.haveResource('AWS::KMS::Key', expectKey, assert.ResourcePart.CompleteDefinition))
  }
)

it('symmetric kms.Key defines an alias',
  () => {
    const stack = new cdk.Stack()
    new c3.kms.SymmetricKey(stack, 'MyKey')

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

it('symmetric kms.Key grants encrypt/decrypt to logs',
  () => {
    const stack = new cdk.Stack()
    const key = new c3.kms.SymmetricKey(stack, 'MyKey')
    key.grantEncryptDecryptLogs()

    const expect = {
      Properties: {
        EnableKeyRotation: true,
        KeyPolicy: {
          Statement: [allowRootAccess, allowCloudWatch],
          Version: '2012-10-17',
        },
        Tags: [
          {
            Key: "stack",
            Value: { Ref: "AWS::StackName" },
          },
        ]
      },
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    }

    assert.expect(stack).to(assert.countResources('AWS::KMS::Key', 1))
    assert.expect(stack).to(assert.haveResource('AWS::KMS::Key', expect, assert.ResourcePart.CompleteDefinition))
  }
)

it('fromAlias creates a kms.IAlias, that does nothing',
  () => {
    const stack = new cdk.Stack()
    const key = c3.kms.fromAlias(stack, 'alias/key')
    const role = new iam.ArnPrincipal(`arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/Role`)
    
    expect(key.addAlias('other')).toBeNull()
    expect(key.keyArn).toBeNull()
    expect(key.keyId).toBeNull()
    expect(key.grant(role)).toBeNull()
    expect(key.grantDecrypt(role)).toBeNull()
    expect(key.grantEncrypt(role)).toBeNull()
    expect(key.grantEncryptDecrypt(role)).toBeNull()
    expect(key.addToResourcePolicy(new iam.PolicyStatement())).toBeUndefined()

    assert.expect(stack).to(assert.countResources('AWS::KMS::Alias', 0))
  }
)
