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
  return new JustAlias(scope, id, id)
} 

class JustAlias extends cdk.Resource implements kms.IAlias {
  public readonly aliasName: string;
  public readonly aliasTargetKey: kms.IKey;

  constructor(scope: cdk.Construct, id: string, alias: string) {
    super(scope, id)
    this.aliasName = alias
  }

  public get keyArn(): string {
    return `arn:aws:kms:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:${this.aliasName}`
  }

  public get keyId(): string {
    return (null as unknown) as string
  }

  public addAlias(_alias: string): kms.Alias {
    return (null as unknown) as kms.Alias
  }

  public addToResourcePolicy(_statement: iam.PolicyStatement, _allowNoOp?: boolean): iam.AddToResourcePolicyResult {
    return { statementAdded: false }
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
  public readonly alias: kms.IAlias
  public readonly accessPolicy: iam.IManagedPolicy
  public readonly encryptPolicy: iam.IManagedPolicy
  public readonly decryptPolicy: iam.IManagedPolicy

  constructor(scope: cdk.Construct, id: string, props: kms.KeyProps = {}) {
    const { alias, ...other } = props
    const keyAlias = alias || `alias/${id}`
    super(scope, id, symmetricKeyProps({ alias: keyAlias, ...other }))

    this.accessPolicy = new iam.ManagedPolicy(this, 'PolicyFullAccess', {
      managedPolicyName: `allow-crypto-${id}`,
      statements: [
        new iam.PolicyStatement({
          actions: [
            "kms:Decrypt",
            "kms:DescribeKey",
            "kms:Encrypt",
            "kms:GenerateDataKey*",
            "kms:ReEncrypt*",
            "kms:CreateGrant",
          ],
          resources: [this.keyArn],
        }),
      ]
    })

    this.encryptPolicy = new iam.ManagedPolicy(this, 'PolicyEncrypt', {
      managedPolicyName: `allow-encrypt-${id}`,
      statements: [
        new iam.PolicyStatement({
          actions: [
            "kms:DescribeKey",
            "kms:Encrypt",
            "kms:ReEncrypt*",
          ],
          resources: [this.keyArn],
        }),
      ]
    })

    this.decryptPolicy = new iam.ManagedPolicy(this, 'PolicyDecrypt', {
      managedPolicyName: `allow-decrypt-${id}`,
      statements: [
        new iam.PolicyStatement({
          actions: [
            "kms:Decrypt",
            "kms:DescribeKey",
          ],
          resources: [this.keyArn],
        }),
      ]
    })

    this.alias = new JustAlias(scope, keyAlias, keyAlias)
    cdk.Tag.add(this, 'stack', cdk.Aws.STACK_NAME)
  }

  //
  // Allow Access through the AWS Service in the account
  // that are authorized to use the AWS Service
  //   key.grantViaService(
  //     new iam.ServicePrincipal(`secretsmanager.${cdk.Aws.REGION}.amazonaws.com`)
  //   )
  public grantViaService(principal: iam.ServicePrincipal): iam.Grant {
    const grant = this.grant(
      new iam.ArnPrincipal('*'),
      'kms:Encrypt',
      'kms:Decrypt',
      'kms:ReEncrypt*',
      'kms:GenerateDataKey*',
      'kms:CreateGrant',
      'kms:DescribeKey',
    )
    // Note: the resource statement is always defined for KMS grant
    const statement = grant.resourceStatement as iam.PolicyStatement
    statement.addCondition('kms:CallerAccount', cdk.Aws.ACCOUNT_ID)
    statement.addCondition('kms:ViaService', principal.service)
    return grant
  }

  //
  // Allow access to the service
  //   key.grantViaService(
  //     new iam.ServicePrincipal(`logs.${cdk.Aws.REGION}.amazonaws.com`)
  //   )
  public grantToService(principal: iam.ServicePrincipal): iam.Grant {
    return this.grant(
      principal,
      'kms:Encrypt',
      'kms:Decrypt',
      'kms:ReEncrypt*',
      'kms:GenerateDataKey*',
      'kms:DescribeKey',
    )
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
