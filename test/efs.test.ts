import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { efs } from '../lib'

it('efs.FileSystem compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const vpc = new ec2.Vpc(stack, 'VPC')
    const kmsKeyId = 'alias/key'
    new efs.CryptoFileSystem(stack, 'MyEFS', {vpc, kmsKeyId})

    const expect = {
      Properties: {
        Encrypted: true,
        KmsKeyId: 'alias/key',
        FileSystemTags: [
          {
            Key: "Name",
            Value: "MyEFS",
          }
        ],
      }
    }

    assert.expect(stack).to(assert.countResources('AWS::EFS::FileSystem', 1))
    assert.expect(stack).to(assert.countResources('AWS::EFS::MountTarget', 2))
    assert.expect(stack).to(assert.haveResource('AWS::EFS::FileSystem', expect, assert.ResourcePart.CompleteDefinition))
  }
)