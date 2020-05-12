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
    return (null as unknown) as string
  }

  public get keyId(): string {
    return (null as unknown) as string
  }

  public addAlias(_alias: string): kms.Alias {
    return (null as unknown) as kms.Alias
  }

  public addToResourcePolicy(_statement: iam.PolicyStatement, _allowNoOp?: boolean): void {
    return
  }

  public grant(_grantee: iam.IGrantable, ..._actions: string[]): iam.Grant {
    return (null as unknown) as iam.Grant
  }

  public grantDecrypt(_grantee: iam.IGrantable): iam.Grant {
    return (null as unknown) as iam.Grant
  }

  public grantEncrypt(_grantee: iam.IGrantable): iam.Grant {
    return (null as unknown) as iam.Grant
  }

  public grantEncryptDecrypt(_grantee: iam.IGrantable): iam.Grant {
    return (null as unknown) as iam.Grant
  }  
}

/*

Crypto interface injects KMS Key into component properties
*/
export interface Crypto {
  /* An alias to KMS key, use c3.kms.fromAlias(...) to build alias from literal value */
  readonly kmsKey: kms.IAlias
}


/*

SymmetricKey makes on kms.Key compliant with
 - CIS 2.8
 - GDPR-25 enabler
 - GDPR 32 enabler

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

const symmetricKeyProps = ({
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
