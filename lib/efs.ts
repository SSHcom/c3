//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as efs from '@aws-cdk/aws-efs'
import { Crypto } from './kms'

/*

FileSystemProps is an extended property of efs.FileSystemProps
that requires usage of encryption key.
*/
export type FileSystemProps = 
  Omit<efs.FileSystemProps, 'kmsKey'> & Crypto

/*

FileSystem enforces AWS EFS encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

https://docs.aws.amazon.com/efs/latest/ug/managing-encrypt.html
*/
export class FileSystem extends efs.FileSystem {
  constructor(scope: cdk.Construct, id: string, props: FileSystemProps) {
    const { encrypted, kmsKey, ...other } = props
    super(scope, id, other)

    const fs = this.node.defaultChild as efs.CfnFileSystem
    fs.encrypted = true
    fs.kmsKeyId = kmsKey.aliasName
  }
}
