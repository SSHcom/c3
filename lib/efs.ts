
//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as efs from '@aws-cdk/aws-efs'

/*

CryptoFileSystemProps emphasizes needs of file system encryption 
using KMS service.

*/
export interface CryptoFileSystemProps extends efs.FileSystemProps {
  /** either KMS key alias or key id */
  readonly kmsKeyId: string
}

/*

CryptoFileSystem enforces AWS EFS encryption with KMS key. The usage of
this component ensures a data protection by design and by default
- GDPR-25

*/
export class CryptoFileSystem extends efs.FileSystem {
  constructor(scope: cdk.Construct, id: string, props: CryptoFileSystemProps) {
    const { encrypted, kmsKey, kmsKeyId, ...other } = props
    super(scope, id, other)

    const fs = this.node.defaultChild as efs.CfnFileSystem
    fs.encrypted = true
    fs.kmsKeyId = kmsKeyId
  }
}


/*

const fs = new efs.FileSystem(scope, 'Efs',
{
  vpc,
  fileSystemName: `${scope.node.path}/efs`,
  securityGroup: sg,
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
}
)
const cfnFs = fs.node.defaultChild as efs.CfnFileSystem
cfnFs.encrypted = true
cfnFs.kmsKeyId = 'alias/saas'

*/

