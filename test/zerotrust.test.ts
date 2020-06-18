import * as assert from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as c3 from '../lib'

it('Zero Trust Access Policy is embedded into AutoScalingGroup',
  () => {
    const stack = new cdk.Stack()
    const vpc = new ec2.Vpc(stack, 'VPC')
    const zeroTrustAccessPolicy: c3.zerotrust.AccessPolicy = {
      policyName: 'my-policy',
      gateway: 'extender',
      account: 'ec2-root',
      audit: true,
    }
    const instanceType = new ec2.InstanceType('t3.small')
    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    })

    new c3.zerotrust.AutoScalingGroup(stack, 'MyAsg', {
      zeroTrustAccessPolicy,
      vpc,
      instanceType,
      machineImage,
    })

    const expectConfig = {
      KeyName: 'my-policy',
    }

    assert.expect(stack).to(assert.countResources('AWS::AutoScaling::LaunchConfiguration', 1))
    assert.expect(stack).to(assert.haveResource('AWS::AutoScaling::LaunchConfiguration', expectConfig))

    const expectAsg = {
      Tags: [
        {
          Key: "Name",
          PropagateAtLaunch: true,
          Value: "MyAsg"
        },
        {
          Key: "privx-enable-auditing",
          PropagateAtLaunch: true,
          Value: "yes"
        },
        {
          Key: "privx-extender",
          PropagateAtLaunch: true,
          Value: "extender"
        },
        {
          Key: "privx-ssh-principals",
          PropagateAtLaunch: true,
          Value: "ec2-root=my-policy"
        },
      ],
    }

    assert.expect(stack).to(assert.countResources('AWS::AutoScaling::AutoScalingGroup', 1))
    assert.expect(stack).to(assert.haveResource('AWS::AutoScaling::AutoScalingGroup', expectAsg))
  }
)
