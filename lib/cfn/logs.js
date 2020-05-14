//
// Copyright (C) 2020 SSH Communications Security Corp.
//
// This file may be modified and distributed under the terms
// of the MIT license.  See the LICENSE file for details.
// https://github.com/SSHcom/c3
//
'use strict'

// See Developer Guideline about Custom Resource Handlers
//https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html

const aws = require("aws-sdk")
const cfn = require('cfn-response')

//
exports.handler = async (event, context) => {
  const { Region, LogGroupName } = event.ResourceProperties
  const logs = new aws.CloudWatchLogs({region: Region})

  switch (event.RequestType) {
  case 'Create':
    return create(logs, event.ResourceProperties)
      .then(data => cfn.send(event, context, cfn.SUCCESS, { data }, LogGroupName))
      .catch(reason => cfn.send(event, context, cfn.FAILED, { reason }, LogGroupName))
  case 'Update':
    return cfn.send(event, context, cfn.SUCCESS, {}, LogGroupName)
  case 'Delete':
    return remove(logs, event.ResourceProperties)
      .then(data => cfn.send(event, context, cfn.SUCCESS, { data }, LogGroupName))
      .catch(reason => cfn.send(event, context, cfn.FAILED, { reason }, LogGroupName))
  }
}

//
const create = (logs, {
  LogGroupName,
  Retention,
  KmsKeyId,
}) => (
  logs.createLogGroup({
    logGroupName: LogGroupName,
    kmsKeyId: KmsKeyId,
  }).promise().then(_ => (
    logs.putRetentionPolicy({
      logGroupName: LogGroupName,
      retentionInDays: Retention,
    }).promise()
  ))
)

//
const remove = (logs, {
  LogGroupName,
  RemovalPolicy
}) => (
  RemovalPolicy != "destroy"
    ? Promise.resolve(true)
    : logs.deleteLogGroup({
        logGroupName: LogGroupName
      }).promise()
)
