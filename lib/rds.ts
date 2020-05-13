//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import { Crypto } from './kms'


/*

DatabaseInstanceProps is an extended property of rds.DatabaseInstanceProps
that requires usage of encryption key.
*/
export type DatabaseInstanceProps =
  Omit<rds.DatabaseInstanceProps, 'kmsKey'> & Crypto

/*

DatabaseInstance enforces AWS RDS encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
*/
export class DatabaseInstance extends rds.DatabaseInstance {
  constructor(scope: cdk.Construct, id: string, props: DatabaseInstanceProps) {
    const { storageEncrypted, kmsKey, ...other } = props
    super(scope, id, other)

    const db = this.node.defaultChild as rds.CfnDBInstance
    db.storageEncrypted = true
    db.kmsKeyId = kmsKey.aliasName
  }
}
