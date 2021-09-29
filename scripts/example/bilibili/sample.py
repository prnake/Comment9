# -*- coding: utf-8 -*-

import json
import asyncio
import blivedm
import socketio
import requests

face = {}

# https://live.bilibili.com/22637261
room_id = 22637261

# Change to your deploy url
HOST = "https://comment.pka.moe"

# 在 "demo" 活动中创建名称和值均为 "bilibili" 的密钥
activity = "demo"
name = "bilibili"
token = "bilibili2333"

sio = socketio.Client()
sio.connect(
    HOST, auth={"activity": activity, "tokenName": name,"token":token}, namespaces=["/danmaku"])

@sio.event(namespace='/danmaku')
def message(data):
    print(data)

class MyBLiveClient(blivedm.BLiveClient):
    # 演示如何自定义handler
    # _COMMAND_HANDLERS = blivedm.BLiveClient._COMMAND_HANDLERS.copy()

    # async def __on_vip_enter(self, command):
    #     print(command)
    # _COMMAND_HANDLERS['WELCOME'] = __on_vip_enter  # 老爷入场

    # async def _on_receive_popularity(self, popularity: int):
    #     print(f'当前人气值：{popularity}')

    async def _on_receive_danmaku(self, danmaku: blivedm.DanmakuMessage):
        print(f'{danmaku.uname}：{danmaku.msg}')
        if not danmaku.uid in face:
            try:
                data = json.loads(requests.get(
                    f'https://api.bilibili.com/x/space/acc/info?mid={danmaku.uid}').content)
                face[danmaku.uid] = data["data"]["face"]
            except:
                face[danmaku.uid] = "//static.hdslb.com/images/member/noface.gif"
        push_danmaku = {
            "mode": danmaku.mode,
            "text": danmaku.msg,
            "stime": 0,
            "size": danmaku.font_size,
            "color": danmaku.color,
            "username": danmaku.uname,
            "userid": "bilibili:"+danmaku.uname,
            "userimg": face[danmaku.uid]
        }
        sio.emit("push", push_danmaku, namespace='/danmaku')

    # async def _on_receive_gift(self, gift: blivedm.GiftMessage):
    #     print(f'{gift.uname} 赠送{gift.gift_name}x{gift.num} （{gift.coin_type}币x{gift.total_coin}）')

    # async def _on_buy_guard(self, message: blivedm.GuardBuyMessage):
    #     print(f'{message.username} 购买{message.gift_name}')

    # async def _on_super_chat(self, message: blivedm.SuperChatMessage):
    #     print(f'醒目留言 ¥{message.price} {message.uname}：{message.message}')


async def main():
    # 参数1是直播间ID
    # 如果SSL验证失败就把ssl设为False
    client = MyBLiveClient(room_id, ssl=True)
    future = client.start()
    try:
        # 5秒后停止，测试用
        # await asyncio.sleep(5)
        # future = client.stop()
        # 或者
        # future.cancel()

        await future
    finally:
        await client.close()


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
