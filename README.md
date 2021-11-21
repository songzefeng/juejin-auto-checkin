<p align="center">
    <h1 align="center">掘金每日自动签到与抽奖</h1>
</p>

<p align="center">
    每天定时自动签到获得矿石数
    <br />
    <br />
    <a href="https://github.com/sudojia/juejin-auto-sign/issues/new">上报Bug</a>
  </p>

- [✏️写在前面](#%EF%B8%8F写在前面)
- [💍介绍](#介绍)
- [😍特点](#特点)
- [🔑*Env*](#env)
- [⚠️特别声明](#特别声明)
- [🔛使用](#使用)
- [🎯TODO](#todo)
- [🕛历程](#历程)

## ✏️写在前面

很久没逛掘金了，昨晚逛的时候偶然发现了一个签到的功能，所以就学习了一下，就有了这个项目~😁

原本是用 JavaScript 写的，但是 Actions 一直有问题，跑不起来，后面改用 JAVA 了，没办法

## 💍介绍

每天定时自动签到 [掘金社区](https://juejin.cn/) 从而获得矿石数，矿石数可进行**抽奖**、**实物兑换**，签到完成后支持 PushPlus 服务推送。

项目会在每天早上的北京时间八点三十五分运行，Actions 会有延迟的，几分钟甚至半小时！

## 😍特点

- ~~💰~~ 免费（项目运行在 GitHub Actions 上）
- ...

## 🔑*Env*

### 主变量（必须）

`Settings - Secrets - New repository secret`

|      Name       |     Value     |                             说明                             | 属性                           |
| :-------------: | :-----------: | :----------------------------------------------------------: | ------------------------------ |
| `JUEJIN_COOKIE` | 掘金的 Cookie | 打开[掘金](https://juejin.cn/)，F12 - Application - Cookies<br>下方有说明 | <font color="red">*</font>必须 |

不需要复制全部 Cookie，只需要  `sessionid=后面的值`  即可

例如：`410b2axxxxxxxxxxxx`

![getCookie](https://cdn.jsdelivr.net/gh/sudojia/sspanel_checkin/img/cookie.jpg)

### 消息推送变量（可选）

|     Name     |   归属   |  属性  |                           说明                            |
| :----------: | :------: | :----: | :-------------------------------------------------------: |
| `PUSH_TOKEN` | 微信推送 | 非必须 | PushPlus 微信通知[官方文档](https://pushplus.hxtrip.com/) |

## ⚠️特别声明

- 该项目仅用于我学习 JavaScript 以及接口调用，禁止用于商业用途，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断。
- 该项目内所有资源文件，禁止任何公众号、自媒体进行任何形式的转载、发布。
- sudojia 对除该项目问题概不负责，包括但不限于由该项目错误导致的任何损失或损害。
- 使用该项目的任何用户，包括但不限于在某些行为违反国家/地区法律或相关法规的情况下进行传播，sudojia 对于由此引起的任何隐私泄漏或其他后果概不负责。
- 请勿将该项目的任何内容用于商业或非法目的，否则后果自负。
- 如果任何单位或个人认为该项目可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我将在收到认证文件后删除该项目。
- 任何以任何方式查看此项目的人或直接或间接使用该项目的使用者都应仔细阅读此声明。sudojia 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或该项目的规则，则视为您已接受此免责声明！

**您必须在下载后的24小时内从计算机或手机中完全删除以上内容。**

**您使用或者复制了本仓库且本人制作的任何脚本，则视为`已接受`此声明，请仔细阅读。**

## 🔛使用

1. 右上角 Fork 该项目

2. 在 Fork 后的仓库中  `Settings - Secrets - New repository secret`  添加变量，变量说明请看  [🔑Env](#env)

3. 点击仓库中的 Actions，如图所示

   ![image](https://cdn.jsdelivr.net/gh/sudojia/sspanel_checkin/img/20210927171440.jpg)

4. 看图

   ![image](https://cdn.jsdelivr.net/gh/sudojia/sspanel_checkin/img/20210927171527.jpg)

5. 继续看图

   ![image](https://cdn.jsdelivr.net/gh/sudojia/sspanel_checkin/img/20210927171547.jpg)

6. 稍等片刻就执行好了，如果报错，不妨可以提个 [issues](https://github.com/sudojia/sspanel_checkin/issues/new)，不要害羞！

## 🎯TODO

- [ ] 一键梭哈
- [ ] 多账号（可能）
- [ ] ...

## 🕛历程

- 2021-11-21 22:39 - 弃用 JavaScript、原因 Actions 不知道是什么问题，改用 Java

- 2021-11-01 22:35 - 已完成自动签到、抽奖以及多个掘金账号！
