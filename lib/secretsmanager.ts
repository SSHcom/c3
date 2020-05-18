//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as vault from '@aws-cdk/aws-secretsmanager'
import { Crypto } from './kms'

/*

BucketProps is an extended property of s3.BucketProps
that requires usage of encryption key.
*/
export type SecretProps =
  Omit<vault.SecretProps, 'encryptionKey'> & Crypto

/*

Secret enforces Secret encryption with specified KMS key.
It just makes it convenient to use same key within the application

*/
export class Secret extends vault.Secret {
  constructor(scope: cdk.Construct, id: string, props: SecretProps) {
    const { kmsKey, ...other } = props
    super(scope, id, other)

    const sm = this.node.defaultChild as vault.CfnSecret
    sm.kmsKeyId = kmsKey.aliasName
  }
}
