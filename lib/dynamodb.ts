//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as ddb from '@aws-cdk/aws-dynamodb'
import { Crypto } from './kms'

/*

TableProps is an extended property of dynamodb.TableProps
that requires usage of encryption key.
*/
export type TableProps =
  Omit<Omit<ddb.TableProps, 'encryptionKey'>, 'encryption'> & Crypto

/*

Table enforces AWS DynamoDB encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html
*/
export class Table extends ddb.Table {
  constructor(scope: cdk.Construct, id: string, props: TableProps) {
    const { kmsKey, ...other } = props
    super(scope, id, {
      ...other,
      encryption: ddb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: kmsKey,
    })
  }
}