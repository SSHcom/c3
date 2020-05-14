import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as logs from '@aws-cdk/aws-logs'
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as c3 from '../lib'

it('c3.codebuild.Project logs are compliant with GDPR 25',
  () => {
    const stack = new cdk.Stack()
    const kmsKey = c3.kms.fromAlias(stack, 'alias/key')

    const logsConfig = new c3.logs.LogGroup(stack, 'MyLog', {
      kmsKey,
      logGroupName: `/aws/test`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    })

    new c3.codebuild.Project(stack, 'MyCodeBuild', {
      kmsKey,
      logsConfig,
      buildSpec: codebuild.BuildSpec.fromObject({}),
    })

    const expectCodeBuild = {
      LogsConfig: {
        CloudWatchLogs: {
          GroupName: "/aws/test",
          Status: "ENABLED"
        }
      }
    }

    assert.expect(stack).to(assert.countResources('AWS::IAM::Role', 2))
    assert.expect(stack).to(assert.countResources('AWS::Lambda::Function', 1))
    assert.expect(stack).to(assert.countResources('AWS::CloudFormation::CustomResource', 1))
    assert.expect(stack).to(assert.countResources('AWS::CodeBuild::Project', 1))
    assert.expect(stack).to(assert.haveResource('AWS::CodeBuild::Project', expectCodeBuild))
  }
)