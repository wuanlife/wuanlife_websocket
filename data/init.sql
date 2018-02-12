-- 用户基础表
-- 储存登陆用的基本信息，日后可扩展一张详细信息表
CREATE TABLE IF NOT EXISTS users_base
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '用户id',
  mail VARCHAR(30) COLLATE utf8_bin NOT NULL COMMENT '用户邮箱',
  name CHAR(20) COLLATE utf8_bin NOT NULL COMMENT '用户名',
  password CHAR(32) COLLATE utf8_bin NOT NULL COMMENT '用户密码',
  create_at TIMESTAMP NOT NULL COMMENT '注册时间',
  PRIMARY KEY (id),
  KEY login_index(mail,password)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户基础信息表';

-- 聊天记录表
-- 储存聊天室部分的历史记录
CREATE TABLE IF NOT EXISTS chat_history
(
  id VARCHAR(30) NOT NULL COMMENT '消息id(uuid)',
  sender_id INT UNSIGNED NOT NULL COMMENT '发送者用户id',
  channel_id VARCHAR(30) COLLATE utf8_bin NOT NULL COMMENT '频道id(uuid)',
  content VARCHAR(300) COLLATE utf8_bin NOT NULL COMMENT '发送内容',
  create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '消息生成时间',
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='聊天记录表';
