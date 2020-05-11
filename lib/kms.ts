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

fromAlias just creates kms.IAlias compatible readonly instance of key alias
*/
export const fromAlias = (scope: cdk.Construct, id: string): kms.IAlias => {
  return new JustAlias(scope, id)
} 

class JustAlias extends cdk.Resource implements kms.IAlias {
  public readonly aliasName: string;
  public readonly aliasTargetKey: kms.IKey;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)
    this.aliasName = id
  }

  public get keyArn(): string {
    return ''
  }

  public get keyId(): string {
    return this.aliasName;
  }

  public addAlias(alias: string): kms.Alias {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    return this.aliasTargetKey.addAlias(alias);
  }

  public addToResourcePolicy(statement: iam.PolicyStatement, allowNoOp?: boolean): void {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    this.aliasTargetKey.addToResourcePolicy(statement, allowNoOp);
  }

  public grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    return this.aliasTargetKey.grant(grantee, ...actions);
  }

  public grantDecrypt(grantee: iam.IGrantable): iam.Grant {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    return this.aliasTargetKey.grantDecrypt(grantee);
  }

  public grantEncrypt(grantee: iam.IGrantable): iam.Grant {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    return this.aliasTargetKey.grantEncrypt(grantee);
  }

  public grantEncryptDecrypt(grantee: iam.IGrantable): iam.Grant {
    if (!this.aliasTargetKey)
      throw new Error(`Alias ${this.aliasName} is read-only.`)
    return this.aliasTargetKey.grantEncryptDecrypt(grantee);
  }  
}


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
