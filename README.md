# 𝗖𝟯: Compliant Cloud Components

The library 𝗖𝟯 provides configuration to AWS CDK components which is compliant with CIS, GDPR and other security standards. 

[![Build Status](https://api.travis-ci.org/SSHcom/c3.svg?branch=master)](http://travis-ci.org/SSHcom/c3)
[![Coverage Status](https://coveralls.io/repos/github/SSHcom/c3/badge.svg?branch=master)](https://coveralls.io/github/SSHcom/c3?branch=master)

## Inspiration

Cyber-security address various threats with data loses thefts, breaches and violation of privacy. Fortunately, we have a group of security experts who looks after these threats. They have developed controls and benchmark protocols to address these challenges. Often, usage of the tools requires a special effort and domain knowledge from software engineers. This library helps AWS cloud developers with controls defined by:

* [CIS: Center for Internet Security](https://www.cisecurity.org)
* [GDPR: General Data Protection Regulation](https://gdpr.eu/tag/gdpr/)

Please find details about supported controls in [the checklists](doc/checklist.md)

## Getting Started

The latest version of the library is available at `master` branch of the repository. All development, including new features and bug fixes, take place on the `master` branch using forking and pull requests as described in contribution guidelines.

```bash
npm install --save @ssh.com/c3
```

The library acts as an overlay for existing AWS CDK components. It aims to minimize effort required to enable compliancy with privacy and security best practices. For example:

```typescript
//
// Your CDK application creates S3 bucket
import * as s3 from '@aws-cdk/aws-s3'

new s3.Bucket(stack, 'MyS3', /* ... */)

//
// It is easy to enable its encryption and disable public access,
// hence making it compliant with GDPR-25 and GDPR-32 1.a.
// 
// Just make following changes:
import * as c3 from '@ssh.com/c3'

const kmsKey = c3.kms.fromAlias(stack, 'alias/MyKey')
new c3.s3.Bucket(stack, 'MyS3', { kmsKey, /* ... */ })
```

Please notice that each component enforces encryption and requires
mandatory `kmsKey: kms.IAlias` parameter. The [KMS Alias](https://docs.aws.amazon.com/kms/latest/developerguide/programming-aliases.html) is used intentionally to allow flexibility on key management. We do also recommend to create and use key from different stacks. It prevents accidental deletion of key while you dispose an application. See more about KMS key design at 𝗖𝟯 library [here](./doc/kms-key.md).

```typescript
//
// Stack A
new c3.kms.SymmetricKey(stack, 'MyKey')

// 
// Stack B
const kmsKey = c3.kms.fromAlias(stack, 'alias/MyKey')
```

The library support following components, we are actively seeking for contribution:

```typescript
import * as c3 from '@ssh.com/c3'

const stack = new cdk.Stack()
new c3.kms.SymmetricKey(stack, 'MyKey')
new c3.logs.LogGroup(stack, 'MyLogs', /* ... */)
new c3.efs.FileSystem(stack, 'MyEFS', /* ... */)
new c3.rds.DatabaseInstance(stack, 'MyRDS', /* ... */)
new c3.s3.Bucket(stack, 'MyS3', /* ... */)
new c3.codebuild.Project(stack, 'MyCodeBuild', /* ... */)
new c3.secretsmanager.Secret(stack, 'MySecret', /* ... */)
```

## How To Contribute

The project is [MIT](LICENSE) licensed and accepts contributions via GitHub pull requests:

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Tag each commit with control id (`(CIS-2.8) ...`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request

The development requires TypeScript and AWS CDK

```bash
npm install -g typescript ts-node aws-cdk
```

```bash
git clone https://github.com/SSHcom/c3
cd c3

npm install
npm run build
npm run test
npm run lint
```

## License

[![See LICENSE](https://img.shields.io/github/license/SSHcom/c3.svg?style=for-the-badge)](LICENSE)
