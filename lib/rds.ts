//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import * as kms from '@aws-cdk/aws-kms'

/*

DatabaseInstanceProps is an extended property of rds.DatabaseInstanceProps
that requires usage of encryption key.
*/
export interface DatabaseInstanceProps extends Omit<rds.DatabaseInstanceProps, 'kmsKey'> {
  /* An alias to KMS key, use c3.kms.fromAlias(...) to build alias from literal value */
  readonly kmsKey: kms.IAlias
}

/*

DatabaseInstance enforces AWS RDS encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

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
