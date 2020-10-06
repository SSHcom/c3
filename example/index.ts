//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as ddb from '@aws-cdk/aws-dynamodb'
import * as logs from '@aws-cdk/aws-logs'
import * as c3 from '@ssh/c3'

//
// Usage
//   cdk deploy c3-example-kms
//   cdk deploy c3-example
//
const app = new cdk.App()
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
}

//
// Intentional split of essential app resources from other's
const stackKey = new cdk.Stack(app, 'c3-example-kms', { env })

const key = new c3.kms.SymmetricKey(stackKey, 'MyKey', {
  alias: 'my-encryption-key'
})
key.grantToService(new iam.ServicePrincipal(`logs.${cdk.Aws.REGION}.amazonaws.com`))


//
//
const stack = new cdk.Stack(app, 'c3-example', { env })

const removalPolicy = cdk.RemovalPolicy.DESTROY
const kmsKey = c3.kms.fromAlias(stack, key.alias.aliasName)

new c3.logs.LogGroup(stack, 'MyLogs', {
  kmsKey,
  logGroupName: 'MyLogs',
  removalPolicy,
  retention: logs.RetentionDays.ONE_DAY,
})

new c3.dynamodb.Table(stack, 'MyDynamo', {
  kmsKey,
  tableName: 'MyDynamo',
  partitionKey: {type: ddb.AttributeType.STRING, name: 'id'},
})

new c3.s3.Bucket(stack, 'MyBucket', {
  kmsKey,
  removalPolicy,
})

new c3.secretsmanager.Secret(stack, 'MySecret', {
  kmsKey,
  secretName: 'MySecret',
  removalPolicy,
})

app.synth()