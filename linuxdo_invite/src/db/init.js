const mysql = require('mysql2/promise');
require('dotenv').config();

const referenceArticles = [
  {
    title: '游戏开发者申请参考',
    category: '游戏开发',
    content: '我是一个游戏开发者，已经在游戏行业工作了十几年了，最近几年才开始做独立游戏，C系列比较熟悉，钟爱C#。UE，Unity和Godot都用过几年，我对AI编程这块比较感兴趣。我之前已经申请加入过一次Linux DO，过年回家了十几天没上网，来了之后发现账户登录不上了，找回密码，也没有邮件发送到邮箱，所以猜想是不是账户被剔除了。由于平常开发游戏比较忙，所以较少逛论坛，只是偶尔会上Linux DO搜搜AI最新信息，由于以前也没有回帖的习惯，所以猜想是否是因为账户不活跃而被清除了。用过一段时间的LinuxDO，感觉LinuxDO是一个非常不错的社区平台，我希望管理员能通过一下，这次我逛贴时尽量养成活跃回帖的习惯，尽量让自己的账户更活跃一些，谢谢！'
  },
  {
    title: '在职程序员申请参考',
    category: '在职程序员',
    content: '亲爱的站长或者管理员你好，我是一名在职的程序员，这也是我第二次申请L站的账号。在本次申请账号之前，我详细阅读了L站的FQA，了解了加入L站需要遵守的必要准则，若能成为L站的一员，我也将遵守站内规则。诚然，我加入L站最大的目的是因为站内有很多福利羊毛，但是在这些福利羊毛中，也未必不能学习到一些新的知识。比如一个新的福利项目，它的技术原理，部署方案，可能都是我需要学习的东西。当然，若我能有幸知晓一些其他的福利羊毛，我也会不吝啬地分享在站内。最后还是恳求一下，希望站长或者管理员能通过吧。'
  },
  {
    title: '多端开发者申请参考',
    category: '全栈开发',
    content: '我是一名计算机行业多年的程序员，做过小程序、App、Web，也做过内容分享。最近在AI辅助下开发应用，在折腾Claude Code和OpenCode时发现很多问题在L站有新的方案或信息，所以想加入一些讨论话题，也分享一些我踩过的坑。我很认同L站关于去四化、建立纯净理想社区的理念，就像程序员们一直支持的博客园一样。谢谢！'
  },
  {
    title: '高级开发申请参考',
    category: '高级开发',
    content: '目前是一名高级开发，就职于互联网行业。AI发展太快，有点跟不上脚步了，朋友说这里对AI的相关讨论会比隔壁V站更有氛围感。隔着窗户也能看到L站的部分内容，但是没办法发帖咨询，希望真的可以加入L站，欣赏一下站内大佬的风采。不奢求我有限的能力能给L站带来什么，但我肯定能遵守L站的准则，合法合规。'
  },
  {
    title: '大学生申请参考',
    category: '学生',
    content: '大一学生，来自某大学计科专业，对服务器部署及大模型很感兴趣，也有一定技术经验，比如IP伪装、框架搭建，在GitHub也有参与项目搭建。在网上搜索相关消息时，看到L站的佬友无私提供Azure服务器相关经验，让我萌生加入此站之情思。希望能分享自己的技术经历，为L站建设贡献力量。'
  },
  {
    title: 'Linux 运维开发申请参考',
    category: '运维开发',
    content: '腾讯运开两年，喜欢跟Linux内核参数打交道。上周发现IPv6的DAD探针在某些云主机上会阻塞端口释放，直接通过sysctl调低dad_transmits解决了代理重启后的bind延迟。Cgroups也折腾过，给签到脚本单独划了cpu.shares，防止抢资源。认同L站技术至上、不灌水的氛围，希望能加进来，贡献一些四层网络优化的实战经验，遵守规矩，长期更新。'
  },
  {
    title: '跨行业转开发申请参考',
    category: '转行开发',
    content: '我的经历有点曲折。我是中文系毕业，曾经做过语文教师，但一直对电脑和网络感兴趣，所以持续学习。十几年前学会SEO，做过旅游网站。后来继续学习AI相关知识，现在也实现了自己的码农编程梦，可以开发各种工具和软件。最近听说LinuxDo论坛是AI的乐园、程序员的圣地，就想加入进来成为一员。我会积极回帖，分享自己学习AI的心得体会，遵守论坛的各种规定。'
  },
  {
    title: 'AI 开发者申请参考',
    category: 'AI 开发',
    content: '10年Java开发，3年AI开发，做得比较多的是ComfyUI工作流搭建，也做过语音克隆。擅长利用前沿开源模型进行工作流搭建及效率效果优化，进行过高帧率视频降显存优化方案。喜欢在博客上分享踩坑点，目前最高踩坑贴浏览量有20w。最近因为技术问题了解到了L站，想进入L站与大佬进行技术交流，也想把自己踩坑过往和工作流优化技术分享给大家，一起交流共同进步。我会严格遵守站规，积极分享。'
  },
  {
    title: '应届生申请参考',
    category: '应届生',
    content: '我已经关注L站很长一段时间了，本人带着极大的敬重与向往想入驻L站，与各位佬们分享与交流。之前已经申请过几次，而且都是受邀注册的。我是大四应届生，计算机专业，L站是我获取信息的重要渠道，同时我也有很多想分享的资料和看法想与站内大佬交流。我深知本站社区友善、专业、真实且信息源广，真的是我梦寐以求的社区。希望这次能给我通过。'
  },
  {
    title: 'Java 后端申请参考',
    category: 'Java 后端',
    content: '我是一个Java开发程序员，主要负责后端开发和一些项目的技术负责人。最近基于LangChain4j、Spring Boot和Node.js开发公司的OA智能办公平台，负责智能流程审批、智能体编排、知识库文档处理、合同校验等开发工作，所以对AI技术非常感兴趣。平时用OpenCode、Trae、Cursor、Claude这类编程工具辅助开发。之前通过Google搜索解决AI编程问题时，意外在L站发现了解决方案，非常感谢分享技术的大佬。我也想加入L站一起讨论和分享开发过程中踩过的坑和技术技巧。'
  }
];

async function initDatabase() {
  // 先连接不带数据库，创建数据库
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  console.log('✅ 数据库连接成功');

  // 创建数据库
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ 数据库 ${process.env.DB_NAME} 已创建或已存在`);

  // 使用该数据库
  await connection.query(`USE \`${process.env.DB_NAME}\``);

  // 创建申请记录表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wechat_name VARCHAR(100) NOT NULL COMMENT '申请人微信名',
      status ENUM('not_qualified', 'in_queue', 'sent') DEFAULT 'in_queue' COMMENT '状态：不符合条件/申请队列中/已发送',
      apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
      invite_date DATE NULL COMMENT '邀请日期（管理员发送日期）',
      invite_code VARCHAR(50) NULL COMMENT '邀请码',
      expected_date DATE NULL COMMENT '预计邀请日期',
      remark TEXT NULL COMMENT '备注',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='申请记录表'
  `);
  console.log('✅ 申请记录表 applications 已创建');

  // 如果 invite_code 字段不存在，则添加
  try {
    await connection.query(`ALTER TABLE applications ADD COLUMN invite_code VARCHAR(50) NULL COMMENT '邀请码' AFTER invite_date`);
    console.log('✅ 已添加 invite_code 字段');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ invite_code 字段已存在或添加失败:', err.message);
    }
  }

  // 如果 expected_date 字段不存在，则添加
  try {
    await connection.query(`ALTER TABLE applications ADD COLUMN expected_date DATE NULL COMMENT '预计邀请日期' AFTER invite_code`);
    console.log('✅ 已添加 expected_date 字段');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ expected_date 字段已存在或添加失败:', err.message);
    }
  }

  // 创建参考小作文表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reference_articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(120) NOT NULL COMMENT '标题',
      category VARCHAR(50) NULL COMMENT '分类',
      content TEXT NOT NULL COMMENT '参考内容',
      sort_order INT DEFAULT 0 COMMENT '排序',
      is_active TINYINT(1) DEFAULT 1 COMMENT '是否展示',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='参考小作文表'
  `);
  console.log('✅ 参考小作文表 reference_articles 已创建');

  const [[{ total: referenceTotal }]] = await connection.query('SELECT COUNT(*) as total FROM reference_articles');
  if (referenceTotal === 0) {
    for (const [index, item] of referenceArticles.entries()) {
      await connection.query(
        'INSERT INTO reference_articles (title, category, content, sort_order, is_active) VALUES (?, ?, ?, ?, 1)',
        [item.title, item.category, item.content, index + 1]
      );
    }
    console.log(`✅ 已导入 ${referenceArticles.length} 条参考小作文`);
  }

  await connection.end();
  console.log('\n🎉 数据库初始化完成！');
}

initDatabase().catch(err => {
  console.error('❌ 数据库初始化失败:', err.message);
  process.exit(1);
});
