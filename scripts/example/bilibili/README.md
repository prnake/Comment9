# blivedm

项目地址：[blivedm](https://github.com/xfgryujk/blivedm)

python3获取bilibili直播弹幕，使用websocket协议

[协议解释](https://blog.csdn.net/xfgryujk/article/details/80306776)（有点过时了，总体是没错的）

## 使用说明

1. 使用`pip install -r requirements.txt`命令安装依赖，具体有目录下[sample.py](./sample.py)和[blivedm.py](./blivedm.py)用到的相关python依赖
2. 将[sample.py](./sample.py)文件中的 `room_id` 替换为直播间ID，将``HOST``替换为部署域名，`activity` 填写活动名，`name` 和 `token` 中填写任意一个拥有 `pushmult` 权限的密钥，可能需要自己在后台创建。
3. 部署时如果使用反向代理，可能需要额外配置 websockets，否则 Socket.IO 将回退到 HTTP 长轮询模式，并且导致 `python-socketio` 无法正常工作
