//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as logs from '@aws-cdk/aws-logs'
import * as c3 from '../lib'

it('c3.logs.LogGroup compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')
    new c3.logs.LogGroup(stack, 'MyLog', {
      kmsKey,
      logGroupName: `/aws/test`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    })

    const expectLogGroup = {
      Region: { Ref: "AWS::Region" },
      KmsKeyId: {
        "Fn::Join": [
          "",
          [
            "arn:aws:kms:",
            { Ref: "AWS::Region" },
            ":",
            { Ref: "AWS::AccountId" },
            ":alias/key"
          ]
        ]
      },
      LogGroupName: "/aws/test",
      RemovalPolicy: "destroy",
      Retention: 30
    }

    const expectLambda = {
      Role: {
        "Fn::GetAtt": [ "MyLogC3LogGroupRole338A0284", "Arn" ]
      },
      Runtime: "nodejs12.x",
      Timeout: 300
    }

    assert.expect(stack).to(assert.countResources('AWS::IAM::Role', 1))
    assert.expect(stack).to(assert.countResources('AWS::Lambda::Function', 1))
    assert.expect(stack).to(assert.countResources('AWS::CloudFormation::CustomResource', 1))
    assert.expect(stack).to(assert.haveResource('AWS::CloudFormation::CustomResource', expectLogGroup))
    assert.expect(stack).to(assert.haveResource('AWS::Lambda::Function', expectLambda))
  }
)
