//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as kms from '@aws-cdk/aws-kms'
import * as iam from '@aws-cdk/aws-iam'

/*

SymmetricKey applies best practice on kms.Key

* Key Alias
https://docs.aws.amazon.com/kms/latest/developerguide/programming-aliases.html

* Key Rotation
https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html

* Access via IAM policies
https://docs.aws.amazon.com/kms/latest/developerguide/control-access-overview.html#managing-access

Once key is created in your account. It is re-usable across stacks:

  const key = kms.Key.fromKeyArn(this, 'MyKey', 'arn:...')
  key.grantDecrypt( iam.IRole )
*/
export class SymmetricKey extends kms.Key {
  constructor(scope: cdk.Construct, id: string, props: kms.KeyProps = {}) {
    const { alias, ...other } = props
    super(scope, id, symmetricKeyProps({ alias: alias || id, ...other }))
  }

  public grantEncryptDecryptLogs() {
    return this.grant(
      new iam.ServicePrincipal(`logs.${cdk.Aws.REGION}.amazonaws.com`),
      'kms:Encrypt*',
      'kms:Decrypt*',
      'kms:ReEncrypt*',
      'kms:GenerateDataKey*',
      'kms:Describe*',
    )
  }
}

/*

symmetricKeyProps makes kms.KeyProps compliant with
 - CIS 2.8
 - GDPR-25 enabler
 - GDPR 32 enabler

*/
export const symmetricKeyProps = ({
  enableKeyRotation,
  trustAccountIdentities,
  removalPolicy,
  ...props
}: kms.KeyProps): kms.KeyProps => ({
  enableKeyRotation: true,
  trustAccountIdentities: true,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
  ...props
})
