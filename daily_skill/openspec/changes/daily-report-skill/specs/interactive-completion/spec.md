## ADDED Requirements

### Requirement: Show draft before interactive phase
The system SHALL display the generated draft report before asking supplementary questions.

#### Scenario: Draft display
- **WHEN** storyline aggregation is complete
- **THEN** system displays the draft report in a formatted block and proceeds to interactive questions

### Requirement: Ask completion status per item
The system SHALL ask the user to mark the completion status of each storyline point.

#### Scenario: Status options
- **WHEN** asking for completion status
- **THEN** system offers options: "已完成", "进行中", "待开发" with "进行中" as default

#### Scenario: Batch status input
- **WHEN** user wants to quickly mark multiple items
- **THEN** system allows entering status for each item sequentially with Enter to accept default

### Requirement: Ask collaboration context
The system SHALL ask the user if there are collaboration details to add.

#### Scenario: Collaboration prompt
- **WHEN** completion status collection is done
- **THEN** system asks "今天有没有协作沟通要补充的？(回车跳过)"

#### Scenario: User provides collaboration context
- **WHEN** user inputs collaboration details (e.g., "与产品对齐了需求细节")
- **THEN** system incorporates this into the final report under the relevant storyline

#### Scenario: User skips collaboration
- **WHEN** user presses Enter without input
- **THEN** system proceeds to next question

### Requirement: Ask pending work items
The system SHALL ask if there are pending or planned work items to include.

#### Scenario: Pending work prompt
- **WHEN** collaboration context collection is done
- **THEN** system asks "有没有待开发/计划事项要补充的？(回车跳过)"

#### Scenario: User provides pending items
- **WHEN** user inputs pending work items
- **THEN** system adds these to the report with "(待开发)" status marker
