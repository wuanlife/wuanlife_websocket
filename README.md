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

