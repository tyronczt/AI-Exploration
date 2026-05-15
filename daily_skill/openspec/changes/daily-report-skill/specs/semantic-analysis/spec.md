## ADDED Requirements

### Requirement: Adaptive two-level semantic analysis
The system SHALL analyze each commit using an adaptive strategy: first read message + stat, then read diff content only when the message is insufficient to understand the business meaning.

#### Scenario: Message sufficient
- **WHEN** commit message clearly describes the business change (e.g., "feat: 分润结算-汇总详情接口") and stat shows affected files
- **THEN** system derives business meaning from message + stat alone without reading diff

#### Scenario: Message insufficient, deep read needed
- **WHEN** commit message is ambiguous (e.g., "fix: bug", "fix: 调整") and stat does not clarify the business context
- **THEN** system reads the diff content to understand what code changed and derives business meaning from the actual changes

#### Scenario: Deep read still insufficient
- **WHEN** even after reading diff, the business meaning cannot be determined
- **THEN** system marks the commit as "other optimization" and includes a brief technical description

### Requirement: Business language transformation
The system SHALL transform technical commit descriptions into business-language descriptions suitable for leadership review.

#### Scenario: Technical to business transformation
- **WHEN** commit is "fix: 分润结算单结算-用户、商户的分润参数对象未序列化导致结算失败"
- **THEN** system produces business language like "修复结算流程中用户/商户分润参数序列化缺陷，保障结算正常执行"

#### Scenario: Preserve domain terms
- **WHEN** commit contains domain-specific terms (e.g., "分润", "结算单", "Seata")
- **THEN** system preserves these terms in the business description as they are meaningful to leadership
