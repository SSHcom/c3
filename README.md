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

Use components provided by the library:

```typescript
import * as c3 from '@ssh.com/c3'

const stack = new cdk.Stack()
new c3.kms.SymmetricKey(stack, 'MyKey')
new c3.efs.FileSystem(stack, 'MyEFS', /* ... */)
new c3.rds.DatabaseInstance(stack, 'MyRDS', /* ... */)
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
