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

const allowCloudWatchLogs = {
  Action: [
    'kms:Encrypt',
    'kms:Decrypt',
    'kms:ReEncrypt*',
    'kms:GenerateDataKey*',
    'kms:DescribeKey',
  ],
  Effect: 'Allow',
  Principal: {
    Service: {
      'Fn::Join': ['', ['logs.', { Ref: 'AWS::Region' }, '.amazonaws.com' ]],
    }
  },
  Resource: '*',
}

const allowSecretManager = {
  Action: [
    'kms:Encrypt',
    'kms:Decrypt',
    'kms:ReEncrypt*',
    'kms:GenerateDataKey*',
    'kms:CreateGrant',
    'kms:DescribeKey',
  ],
  Effect: 'Allow',
  Principal: '*',
  Resource: '*',
  Condition: {
    'kms:CallerAccount': { Ref: 'AWS::AccountId' },
    'kms:ViaService': {
      'Fn::Join': ['', ['secretsmanager.', { Ref: 'AWS::Region' }, '.amazonaws.com' ]]
    }
  },
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

    expect(key.alias.aliasName).toBe('alias/MyKey')
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

it('symmetric kms.Key defines an policy',
  () => {
    const stack = new cdk.Stack()
    const key = new c3.kms.SymmetricKey(stack, 'MyKey')

    const expectEncryptDecrypt = {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              "kms:Decrypt",
              "kms:DescribeKey",
              "kms:Encrypt",
              "kms:GenerateDataKey*",
              "kms:ReEncrypt*",
              "kms:CreateGrant",
            ],
            Effect: "Allow",
            Resource: { "Fn::GetAtt": ["MyKey6AB29FA6", "Arn"] }
          }
        ],
        Version: "2012-10-17"
      },
      Description: "",
      ManagedPolicyName: "allow-crypto-MyKey",
      Path: "/",
    }

    const expectEncrypt = {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              "kms:DescribeKey",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            Effect: "Allow",
            Resource: { "Fn::GetAtt": ["MyKey6AB29FA6", "Arn"] }
          }
        ],
        Version: "2012-10-17"
      },
      Description: "",
      ManagedPolicyName: "allow-encrypt-MyKey",
      Path: "/",
    }

    const expectDecrypt = {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              "kms:Decrypt",
              "kms:DescribeKey",
            ],
            Effect: "Allow",
            Resource: { "Fn::GetAtt": ["MyKey6AB29FA6", "Arn"] }
          }
        ],
        Version: "2012-10-17"
      },
      Description: "",
      ManagedPolicyName: "allow-decrypt-MyKey",
      Path: "/",
    }

    assert.expect(stack).to(assert.countResources('AWS::IAM::ManagedPolicy', 3))
    assert.expect(stack).to(assert.haveResource('AWS::IAM::ManagedPolicy', expectEncryptDecrypt))
    assert.expect(stack).to(assert.haveResource('AWS::IAM::ManagedPolicy', expectEncrypt))
    assert.expect(stack).to(assert.haveResource('AWS::IAM::ManagedPolicy', expectDecrypt))
    expect(key.accessPolicy).toBeDefined()
    expect(key.encryptPolicy).toBeDefined()
    expect(key.decryptPolicy).toBeDefined()
  }
)


it('symmetric kms.Key grants encrypt/decrypt via service',
  () => {
    const stack = new cdk.Stack()
    const key = new c3.kms.SymmetricKey(stack, 'MyKey')
    key.grantViaService(
      new iam.ServicePrincipal(`secretsmanager.${cdk.Aws.REGION}.amazonaws.com`)
    )

    const expect = {
      Properties: {
        EnableKeyRotation: true,
        KeyPolicy: {
          Statement: [allowRootAccess, allowSecretManager],
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


it('symmetric kms.Key grants encrypt/decrypt to service',
  () => {
    const stack = new cdk.Stack()
    const key = new c3.kms.SymmetricKey(stack, 'MyKey')
    key.grantToService(
      new iam.ServicePrincipal(`logs.${cdk.Aws.REGION}.amazonaws.com`)
    )

    const expect = {
      Properties: {
        EnableKeyRotation: true,
        KeyPolicy: {
          Statement: [allowRootAccess, allowCloudWatchLogs],
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
    expect(key.keyArn).toBe("arn:aws:kms:${Token[AWS::Region.4]}:${Token[AWS::AccountId.0]}:alias/key")
    expect(key.keyId).toBeNull()
    expect(key.grant(role)).toBeNull()
    expect(key.grantDecrypt(role)).toBeNull()
    expect(key.grantEncrypt(role)).toBeNull()
    expect(key.grantEncryptDecrypt(role)).toBeNull()
    expect(key.addToResourcePolicy(new iam.PolicyStatement())).toStrictEqual({statementAdded: false})

    assert.expect(stack).to(assert.countResources('AWS::KMS::Alias', 0))
  }
)
