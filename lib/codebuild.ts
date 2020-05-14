//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
import * as cdk from '@aws-cdk/core'
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as logs from './logs'


/*

LogConfig extends codebuild.ProjectProps with ability to specify
logs target
*/
interface LogConfig {
  logsConfig: logs.LogGroup
}

/*

ProjectProps is an extended property of codebuild.ProjectProps
that requires usage of encryption key.
*/
export type ProjectProps = 
  Omit<codebuild.ProjectProps, 'encryptionKey'> & LogConfig


/*

Project enforces logs encryption with KMS key.
The usage of this component ensures a data protection by design 
and by default, which makes it compliant with
- GDPR-25
- GDPR-32 1.a
*/
export class Project extends codebuild.Project {
  constructor(scope: cdk.Construct, id: string, props: ProjectProps) {
    const { logsConfig, ...other } = props
    super(scope, id, other)

    const cb = this.node.defaultChild as codebuild.CfnProject
    cb.logsConfig = {
      cloudWatchLogs: {
        status: 'ENABLED',
        groupName: logsConfig.logGroupName,
        streamName: props.projectName,
      }
    }
  }
}