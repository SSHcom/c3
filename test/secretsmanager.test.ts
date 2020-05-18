import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as c3 from '../lib'

it('c3.secretsmanager.Secret uses key alias',
  () => {
    const stack = new cdk.Stack()
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')
    new c3.secretsmanager.Secret(stack, 'MySecret', {
      kmsKey
    })

    const expect = {
      KmsKeyId: "alias/key"
    }

    assert.expect(stack).to(assert.countResources('AWS::SecretsManager::Secret', 1))
    assert.expect(stack).to(assert.haveResource('AWS::SecretsManager::Secret', expect))
  }
)