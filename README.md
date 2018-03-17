e-civ 电子文明 RESTful API
=============================

**项目使用Mongodb，请先确保你安装好了相关环境。**


开发使用说明
------------

```Shell
// 开启mysql后

npm run start
```

Websocket消息结构
```JSON
{
  "uuid": "uasd-qwor",
  "source": "system",
  "type": "letter",
  "data": {

  },
  "created_at": "2018-02-11T15:02:21.760Z"
}

```
`uuid` 唯一标识，可能会有用

`source` 来源，各个channel或者'system'

`type` 消息类型

`data` 消息数据，自定义

`created_at` 消息创建时间


```

需要注意的，客户端在发送的时候，uuid以及source都是自动生成的

加入聊天室时发送的消息，客户端发送
{
  "type": "chat-subsribe",
  "data": {
    "channel": {
       "id": 41
    }
  }
}
加入聊天室的成功响应，服务器端发送
{
  "uuid": "uasd-qwor",
  "source": "wuanlife_websocket",
  "type": "chat-subsribe-ok",
  "data": {
    "channel": {
       "id": 41
    }
  }
}

发送聊天消息时，客户端发送
{
  "type": "chat-send",
  "data": {
    "channel": {
       "id": 41
    },
    "content": "kekekekekekekke"
  }
}
发送聊天消息成功时，服务器端发送消息
{
  "uuid": "uasd-qwor",
  "source": "wuanlife_websocket",
  "type": "chat-send-ok",
  "data": {
    "channel": {
       "id": 41
    },
    "content": "kekekekekekekke"
  }
}

客户端收到聊天消息时，收到消息的结构，服务器端发送
{
  "uuid": "uasd-qwor",
  "source": "wuanlife_websocket",
  "type": "chat-receive",
  "data": {
    "channel": {
       "id": 41
    },
    "type": "message", // 不同type的data结构不一样，方便后面扩展用的字段
    "sender": {
      "id": 123,
      "name": "梁王"
    },
    "content": "玩蛇"
  }
  "created_at": "2018-02-11T15:02:21.760Z"
}

```
