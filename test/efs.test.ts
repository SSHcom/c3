import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { efs, kms } from '../lib'

it('c3.efs.FileSystem compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const vpc = new ec2.Vpc(stack, 'VPC')
    const kmsKey = kms.fromAlias(stack, 'alias/key')
    new efs.FileSystem(stack, 'MyEFS', {vpc, kmsKey})

    const expect = {
      Encrypted: true,
      KmsKeyId: 'alias/key',
    }

    assert.expect(stack).to(assert.countResources('AWS::EFS::FileSystem', 1))
    assert.expect(stack).to(assert.countResources('AWS::EFS::MountTarget', 2))
    assert.expect(stack).to(assert.haveResource('AWS::EFS::FileSystem', expect))
  }
)