<h1 align="center">开发</h1>

<p align="center">
中文
|
<a href="https://github.com/prnake/Comment9/blob/master/docs/develop.en.md" target="_blank" rel="noopener noreferrer">English</a>
</p>

## 项目结构

本项目的 `src` 文件夹为前端 `Vue.js` 源码，其他大部分文件夹为后端 `Express` 源码。

## 创建弹幕发送器

弹幕发送器 `sender` 的目录位于 [routes/sender](routes/sender)，可参考 [routes/sender/danmaku.js](routes/sender/danmaku.js)。

```js
module.exports = { router, socket, info, init, pushDanmaku };
```

解释如下

- `router`：用于创建 `Express Router`
- `socket`：用于绑定 `Socket.IO`
- `info`：用于生成后台面板渲染数据
- `init`：用于插件启用时的初始化，例如创建 `Token`
- `pushDanmaku`：文件自行实现的接口

这些部分按需取用，例如 [routes/sender/develop.js](routes/sender/develop.js) 中只实现了 `info` 部分。

鉴权函数在 [utils/auth.js](utils/auth.js)。请求鉴权分为三种情况：
- `Vue` 后台鉴权：`auth.routerSessionAuth`
- `Express Router` 使用 Token 鉴权：`auth.routerActivityByToken`
- `Socket.IO` 使用 Token 鉴权：`auth.socketActivityByToken`

具体用法请参考源码。

## 创建弹幕过滤器

弹幕过滤器 `filter` 的目录位于 [utils/filter](utils/filter)，`info` 用于创建额外配置，`filter` 应该被实现为一个中间件，在 [utils/audit.js](utils/audit.js) 中被使用。可参考 [utils/filter/default.js](utils/filter/default.js)。

## 管理 Web 后台面板

Web 后台面板的数据由后端生成、前端渲染，因此只需要修改后端 `sender` 即可。可参考 [routes/sender/danmaku.js](routes/sender/danmaku.js) 中定义 `info` 的部分。我们规定每个 `sender` 至多拥有一个显示面板，也可在 `filter` 中添加额外配置。 

如果当前的渲染器无法满足要求，也可以在原有基础上改进前端，增加新的渲染功能。

## 多语言支持

向主仓库提交代码时，应该保证前端新增的显示文本支持 [src/langs](src/langs) 下的所有语言，例如如下字段：
- `sender:弹幕发送器名`
- `filter:弹幕过滤器名`
- 后端面板中新增的描述

整体而言，后台管理面板能看到的文本应该全部本地化。


