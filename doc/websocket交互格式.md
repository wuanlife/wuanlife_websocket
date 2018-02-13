需要注意的，客户端在发送的时候，uuid以及source都是自动生成的

加入聊天室时发送的消息，客户端发送
```JSON
{
  "type": "chat-subsribe",
  "data": {
    "channel": {
       "id": 41
    }
  }
}
```
加入聊天室的成功响应，服务器端发送
```JSON
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
```

发送聊天消息时，客户端发送
```JSON
{
  "type": "chat-send",
  "data": {
    "channel": {
       "id": 41
    },
    "content": "kekekekekekekke"
  }
}
```
发送聊天消息成功时，服务器端发送消息
```JSON
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
```

客户端收到聊天消息时，收到消息的结构，服务器端发送
```JSON
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
  },
  "created_at": "2018-02-11T15:02:21.760Z"
}
```
