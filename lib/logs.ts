//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as cfn from '@aws-cdk/aws-cloudformation'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as lambda from '@aws-cdk/aws-lambda'
import { readFileSync } from 'fs'
import { Crypto } from './kms'

/*

LogGroupProps is an extended property of s3.BucketProps
that requires usage of encryption key.
*/
export type LogGroupProps = logs.LogGroupProps & Crypto

/*

Bucket enforces AWS CloudWatch encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

AWS CDK and CloudFormation do not allow to associate LogGroup
with KMS Key. It is only possible via cli or direct api calls.

https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/encrypt-log-data-kms.html
*/
export class LogGroup extends cdk.Construct {
  readonly logGroupName?: string

  constructor(scope: cdk.Construct, id: string, props: LogGroupProps) {
    super(scope, id)
    this.logGroupName = props.logGroupName

    //
    const role = new iam.Role(this, 'C3LogGroupRole', {
      assumedBy: new iam.ServicePrincipal(`lambda.${cdk.Aws.REGION}.amazonaws.com`),
    })
    role.addToPolicy(this.allowLogGroup())
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'))

    //
    const fn = new lambda.SingletonFunction(this, 'C3LogGroupLambda', {
      uuid: 'C3LogGroup',
      code: new lambda.InlineCode(
        readFileSync(__dirname + '/cfn/logs.js', { encoding: 'utf-8' })
      ),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.NODEJS_12_X,
      role,
    })

    const { kmsKey, ...other } = props
    new cfn.CustomResource(this, 'C3LogGroup', {
      provider: cfn.CustomResourceProvider.lambda(fn),
      properties: {
        region: cdk.Aws.REGION,
        kmsKeyId: kmsKey.keyArn,
        ...other
      }
    })
  }

  private allowLogGroup(): iam.PolicyStatement {
    return new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'logs:Create*',
        'logs:PutRetentionPolicy',
        'logs:Delete*',
      ],
    })
  }
}