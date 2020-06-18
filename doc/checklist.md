# Supported controls

The checklist defines either already supported controls or controls to be implemented by one of the component. See the documentation of individual components for details of supported controls.


## CIS: Amazon Web Services Foundations

CIS defines guidance and controls to configure security options for a subset of AWS. The document is available of [CIS website](https://www.cisecurity.org/benchmark/amazon_web_services/).

**Identity and Access Management**

- [ ] CIS 1.1 Avoid the use of the "root" account
- [ ] CIS 1.2: Ensure multi-factor authentication (MFA) is enabled for all IAM users that have a console password
- [ ] CIS 1.3: Ensure credentials unused for 90 days or greater are disabled
- [ ] CIS 1.4: Ensure access keys are rotated every 90 days or less
- [ ] CIS 1.5: Ensure IAM password policy requires at least one uppercase letter
- [ ] CIS 1.6: Ensure IAM password policy require at least one lowercase letter
- [ ] CIS 1.7: Ensure IAM password policy require at least one symbol
- [ ] CIS 1.8: Ensure IAM password policy require at least one number
- [ ] CIS 1.9: Ensure IAM password policy requires minimum length of 14 or greater
- [ ] CIS 1.10: Ensure IAM password policy prevents password reuse
- [ ] CIS 1.11: Ensure IAM password policy expires passwords within 90 days or less
- [ ] CIS 1.12: Ensure no root account access key exists
- [ ] CIS 1.13: Ensure MFA is enabled for the "root" account
- [ ] CIS 1.14: Ensure hardware MFA is enabled for the "root" account
- [ ] CIS 1.15: Ensure security questions are registered in the AWS account
- [ ] CIS 1.16: Ensure IAM policies are attached only to groups or roles
- [ ] CIS 1.17: Maintain current contact details
- [ ] CIS 1.18: Ensure security contact information is registered
- [ ] CIS 1.19: Ensure IAM instance roles are used for AWS resource access from instances
- [ ] CIS 1.20: Ensure a support role has been created to manage incidents with AWS Support
- [ ] CIS 1.21: Do not setup access keys during initial user setup for all IAM users that have a console password
- [ ] CIS 1.22: Ensure IAM policies that allow full "*:*" administrative privileges are not created

**Logging**

- [ ] CIS 2.1: Ensure CloudTrail is enabled in all regions (Scored)
- [ ] CIS 2.2: Ensure CloudTrail log file validation is enabled (Scored)
- [ ] CIS 2.3: Ensure the S3 bucket used to store CloudTrail logs is not publicly accessible
- [ ] CIS 2.4: Ensure CloudTrail trails are integrated with CloudWatch Logs
- [ ] CIS 2.5: Ensure AWS Config is enabled in all regions
- [ ] CIS 2.6: Ensure S3 bucket access logging is enabled on the CloudTrail S3 bucket
- [ ] CIS 2.7: Ensure CloudTrail logs are encrypted at rest using KMS CMKs
- [x] CIS 2.8: Ensure rotation for customer created CMKs is enabled
- [ ] CIS 2.9: Ensure VPC flow logging is enabled in all VPCs

**Monitoring**

- [ ] CIS 3.1: Ensure a log metric filter and alarm exist for unauthorized API calls
- [ ] CIS 3.2: Ensure a log metric filter and alarm exist for Management Console sign-in without MFA
- [ ] CIS 3.3: Ensure a log metric filter and alarm exist for usage of "root" account (Scored)
- [ ] CIS 3.4: Ensure a log metric filter and alarm exist for IAM policy changes
- [ ] CIS 3.5: Ensure a log metric filter and alarm exist for CloudTrail configuration changes
- [ ] CIS 3.6: Ensure a log metric filter and alarm exist for AWS Management Console authentication failures
- [ ] CIS 3.7: Ensure a log metric filter and alarm exist for disabling or scheduled deletion of customer created CMKs
- [ ] CIS 3.8: Ensure a log metric filter and alarm exist for S3 bucket policy changes
- [ ] CIS 3.9: Ensure a log metric filter and alarm exist for AWS Config configuration changes
- [ ] CIS 3.10: Ensure a log metric filter and alarm exist for security group changes
- [ ] CIS 3.11: Ensure a log metric filter and alarm exist for changes to Network Access Control Lists
- [ ] CIS 3.12: Ensure a log metric filter and alarm exist for changes to network gateways
- [ ] CIS 3.13: Ensure a log metric filter and alarm exist for route table changes
- [ ] CIS 3.14: Ensure a log metric filter and alarm exist for VPC changes

**Networking**

- [ ] CIS 4.1: Ensure no security groups allow ingress from 0.0.0.0/0 to port 22
- [ ] CIS 4.2: Ensure no security groups allow ingress from 0.0.0.0/0 to port 3389
- [ ] CIS 4.3: Ensure the default security group of every VPC restricts all traffic
- [ ] CIS 4.4: Ensure routing tables for VPC peering are "least access"


## GDPR: General Data Protection Regulation

GDPR is tough to implement and understand. There are many important aspects to touch beside "state of the art" encryption. The library makes a
cloud components compliant with few GDPR articles, the full set of articles is available at [GDPR website](https://gdpr.eu/tag/gdpr).

- [ ] GDPR-5: Principles relating to processing of personal data
- [ ] GDPR-6: Lawfulness of processing
- [ ] GDPR-17: Right to erasure ('right to be forgotten')
- [ ] GDPR-20: Right to data portability
- [x] GDPR-25: Data protection by design and by default
- [ ] GDPR-30: Records of processing activities
- [ ] GDPR-32: Security of processing
- [ ] GDPR-33: Notification of a personal data breach to the supervisory authority
- [ ] GDPR-44: General principle for transfers
- [ ] GDPR-89: Safeguards and derogations relating to processing for archiving purposes in the public interest, scientific or historical research purposes or statistical purposes

## ZeroTrust

We wanted to build a solution that only grants access when it's needed & on the level needed. Zero Trust is always (re-)verifying a user before any access is granted.
