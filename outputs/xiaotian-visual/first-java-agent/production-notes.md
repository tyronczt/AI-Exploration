# 《用 Java 做第一个 Agent》白板海报制作记录

- 来源：`C:\Users\xiaotian\Documents\github\hello-ai\agent\zero-to-one\02-first-java-agent.md`，读取于 2026-09-27。此文件位于另一个项目，仅用于提炼样图内容，未修改原文。
- 范围：文章第 0 节列出的阶段 0～3，以及开头对规则、资料和工具回填的总结。海报是四阶段复习图，不覆盖全文代码、HTTP 接口及验证细节。
- 结构：16:9 横版；四列按阶段顺序排列；底部总结沿用原文主旨。
- 工具：内置 `image_gen`；原始生成文件为 `C:\Users\xiaotian\.codex\generated_images\01a0e268-6efe-7d03-81b0-5f588a1d6bf5\exec-c9100986-49e6-4df7-ba04-ba171d424058.png`。
- 参考图：`xiaotian-visual/assets/character-style-reference.png` 用于小天身份；`xiaotian-visual/assets/article-style-reference.png` 仅用于背景、配色和手绘感。
- 输出：`first-java-agent-whiteboard.png`，1672 × 941 PNG。

## 画面文案与原文依据

| 画面 | 文案 | 原文位置 |
|---|---|---|
| 标题 | 用 Java 做第一个 Agent | 文件标题 |
| 副标题 | 同一分页问题，对比四个阶段的输入与行动 | 开头第 5 行及第 0 节四阶段表，压缩表述 |
| 阶段 0 | 只有问题；用户给出目标；没有项目资料；观察回答是否在猜 | 第 0 节四阶段表 |
| 阶段 1 | 加入回答规则；依据文档回答；未知就说明未知；规则不能代替资料 | 第 0 节四阶段表及随后比较段 |
| 阶段 2 | 直接给资料；两份正文进上下文；从正文寻找依据；资料越多 Token 消耗越多 | 第 0 节四阶段表及随后比较段 |
| 阶段 3 | 按需调用工具；searchDocs 找文档；readDoc 读正文；结果回填后继续；观察工具请求与执行 | 第 0 节四阶段表及随后比较段 |
| 总结 | 规则不能代替资料；工具结果必须交回模型。 | 开头第 5 行，压缩表述 |

## 实际发送的生成提示词

```text
Use case: infographic-diagram.
Asset type: final 16:9 horizontal Chinese hand-drawn whiteboard infographic poster, one image.
Primary request: Visualize the four teaching stages explicitly described in the supplied Java Agent article. A polished, clear product-presentation slide blended with sketch notes. Image 1 is the approved identity reference for 小天: use ONE small guide character with the same brown hair, dark cat ears, round black glasses, navy hoodie with beige cup-and-gear badge, dark trousers; do not copy the nine-cell layout. Image 2 is ONLY a reference for warm off-white paper, gentle colors and hand-drawn presentation feel; do not copy its text, topic or older character. Put the one 小天 character in spare space near the title or summary, without covering words.
Composition: Strict wide 16:9. Top title/subtitle about 15%; main row of FOUR equally wide rounded cards about 70%; bottom single wide rounded summary card about 15%. Reading direction left to right. Card order and pastel tints: light green, light blue, light purple, light orange. Each card: small colored rounded stage tab, one simple line doodle relevant to its stage, bold short heading, two or three short lines, bottom pale rounded observation box. Clean whitespace, irregular thin marker borders, dark navy handwritten-feeling title. The cards depict a sequence, so preserve stage numbers 0 to 3. A small lightbulb icon in the bottom summary and a subtle yellow marker underline under the key phrase. No photographs, no 3D, no complex gradients, no watermarks or extra lettering.
Render the following Chinese and Latin text EXACTLY, legibly, with no added or duplicated text:
Top title: 用 Java 做第一个 Agent
Top subtitle: 同一分页问题，对比四个阶段的输入与行动
Card 1 stage tab: 阶段 0
Card 1 heading: 只有问题
Card 1 lines: 用户给出目标 / 没有项目资料
Card 1 bottom: 观察：回答是否在猜
Card 2 stage tab: 阶段 1
Card 2 heading: 加入回答规则
Card 2 lines: 依据文档回答 / 未知就说明未知
Card 2 bottom: 规则不能代替资料
Card 3 stage tab: 阶段 2
Card 3 heading: 直接给资料
Card 3 lines: 两份正文进上下文 / 从正文寻找依据
Card 3 bottom: 资料越多，Token 消耗越多
Card 4 stage tab: 阶段 3
Card 4 heading: 按需调用工具
Card 4 lines: searchDocs 找文档 / readDoc 读正文 / 结果回填后继续
Card 4 bottom: 观察工具请求与执行
Bottom summary: 规则不能代替资料；工具结果必须交回模型。
Technical and editorial constraints: Text must be exactly as written, no typos, mojibake or fake characters. Preserve the stage meaning. No invented metrics, code, logos or decorative text.
```

## 验收

- 目视核对：四阶段顺序、卡片配色、标题、中文、英文工具名、底部结论及小天身份；未见明显错字或遮挡。
- 图片尺寸为 1672 × 941，接近 16:9（像素取整造成约 0.053% 的比例偏差）。
- 文章全文范围外的技术细节未进入图片；本图只用于阶段对照复习。
