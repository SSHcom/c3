//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as asg from '@aws-cdk/aws-autoscaling'


/*

AccessPolicy is applicable to target EC2 instances. The policy resolves
few security questions:
- Who can use account on the target machine?
- How machines in private subnet are accessed?
- What is the audit policy for the access session(s)?

The policy is enforced by 3rd party tools using tags. This policy document is
converted to AWS EC2 Tags.
*/
export interface AccessPolicy {
  /* ZeroTrust Policy Name */
  readonly policyName: string

  /* ZeroTrust Gateway Id */
  readonly gateway: string

  /* The account on target host, which is controlled by the policy */
  readonly account?: string

  /* Enables audit */ 
  readonly audit?: boolean
}

/*

AutoScalingGroupProps extends asg.AutoScalingGroupProps with
Zero Trust AccessPolicy document.
*/
export type AutoScalingGroupProps =
  Omit<asg.AutoScalingGroupProps, 'keyName'> & {zeroTrustAccessPolicy: AccessPolicy}


/*

AutoScalingGroup enforces Zero Trust Access principles to EC2 instances
launched by its configuration. Zero Trust access policy implies that no one
has permanent access to the instance. The access is (re-)verifying
a user before any access is granted. The policy is enforced by 3rd
party tools. 

The component replaces management of SSH key via Zero Trust AccessPolicy and
embeds the document into EC2 instances.
*/
export class AutoScalingGroup extends asg.AutoScalingGroup {
  constructor(scope: cdk.Construct, id: string, props: AutoScalingGroupProps) {
    const { zeroTrustAccessPolicy, ...other } = props
    const { policyName, gateway, account, audit } = zeroTrustAccessPolicy

    super(scope, id, { ...other, keyName: policyName })

    const sshAccount = account || 'ec2-user'
    cdk.Tag.add(this, 'privx-ssh-principals', `${sshAccount}=${policyName}`)
    cdk.Tag.add(this, 'privx-extender', gateway)
    if (audit) {
      cdk.Tag.add(this, 'privx-enable-auditing', 'yes')
    }
  }
}
