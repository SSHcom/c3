
//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as efs from '@aws-cdk/aws-efs'
import * as kms from '@aws-cdk/aws-kms'

/*

CryptoFileSystemProps emphasizes needs of file system encryption 
using KMS service.
*/
export interface CryptoFileSystemProps extends Omit<efs.FileSystemProps, 'kmsKey'>  {
  /* KMS key alias, use kms.fromAlias(...) */
  readonly kmsKey: kms.IAlias
}

/*

CryptoFileSystem enforces AWS EFS encryption with KMS key. The usage of
this component ensures a data protection by design and by default
- GDPR-25

https://docs.aws.amazon.com/efs/latest/ug/managing-encrypt.html
*/
export class CryptoFileSystem extends efs.FileSystem {
  constructor(scope: cdk.Construct, id: string, props: CryptoFileSystemProps) {
    const { encrypted, kmsKey, ...other } = props
    super(scope, id, other)

    const fs = this.node.defaultChild as efs.CfnFileSystem
    fs.encrypted = true
    fs.kmsKeyId = kmsKey.aliasName
  }
}
