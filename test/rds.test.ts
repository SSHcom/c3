import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
import * as c3 from '../lib'

it('c3.rds.DatabaseInstance compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const vpc = new ec2.Vpc(stack, 'VPC')
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')
    new c3.rds.DatabaseInstance(stack, 'MyRDS', {
      kmsKey,
      vpc,
      masterUsername: 'test',
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: new ec2.InstanceType('t3.small'),
    })

    // Note: unit test checks only Properties that impact on compliance 
    const expect = {
      StorageEncrypted: true,
      KmsKeyId: 'alias/key',
    }

    assert.expect(stack).to(assert.countResources('AWS::RDS::DBInstance', 1))
    assert.expect(stack).to(assert.haveResource('AWS::RDS::DBInstance', expect))
  }
)