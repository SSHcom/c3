//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import { Crypto } from './kms'

/*

BucketProps is an extended property of s3.BucketProps
that requires usage of encryption key.
*/
export type BucketProps =
  Omit<Omit<s3.BucketProps, 'encryptionKey'>, 'encryption'> & Crypto

/*

Bucket enforces AWS S3 encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a

https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html
*/
export class Bucket extends s3.Bucket {
  constructor(scope: cdk.Construct, id: string, props: BucketProps) {
    const { kmsKey, blockPublicAccess, ...other } = props
    super(scope, id, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      ...other
    })

    const policy = new s3.BucketPolicy(scope, `${id}Policy`, { bucket: this })
    policy.document.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['*'],
        resources: [`${this.bucketArn}/*`],
        conditions: {
          Bool: { 'aws:SecureTransport': false },
        },
      })
    )

    const cask = this.node.defaultChild as s3.CfnBucket
    cask.bucketEncryption = {
      serverSideEncryptionConfiguration: [
        {
          serverSideEncryptionByDefault: {
            sseAlgorithm: 'aws:kms',
            kmsMasterKeyId: kmsKey.aliasName,
          },
        },
      ],
    }
  }
}
