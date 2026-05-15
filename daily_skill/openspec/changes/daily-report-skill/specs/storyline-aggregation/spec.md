## ADDED Requirements

### Requirement: Group commits by business storyline
The system SHALL group analyzed commits into coherent business storylines rather than listing them chronologically.

#### Scenario: Multiple commits form one storyline
- **WHEN** multiple commits relate to the same business feature or module (e.g., three commits all about "用户认证模块")
- **THEN** system groups them under one storyline with a unified title

#### Scenario: Commits span multiple storylines
- **WHEN** commits relate to different business features (e.g., some about "注册规则", others about "个人中心页")
- **THEN** system creates separate storylines for each feature area

### Requirement: Generate storyline title
The system SHALL generate a descriptive title for each storyline that combines the module name with the business action summary.

#### Scenario: Title generation
- **WHEN** storyline contains commits about "用户认证模块" including adding distributed transactions and fixing serialization
- **THEN** system generates a title like "用户中心模块优化与重构" (not "用户中心代码修改")

### Requirement: Generate numbered points per storyline
The system SHALL generate numbered points for each storyline, where each point describes a business-level change.

#### Scenario: Point structure
- **WHEN** generating a numbered point for a storyline
- **THEN** each point follows the structure: [业务对象]：[改动描述] + [业务价值/效果]

#### Scenario: Multiple commits in one point
- **WHEN** two commits are tightly coupled (e.g., one adds a feature, another fixes a bug in that feature)
- **THEN** system may merge them into a single numbered point that describes the combined outcome
