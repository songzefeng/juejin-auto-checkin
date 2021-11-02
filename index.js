/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2021/11/01 22:15
 * @description 掘金自动签到&抽奖
 */
/**
 * 矿石也就是稀土掘金内通用积分，用户可通过完成各种任务获得。（矿石可用于梭哈、兑换实物）
 * 获得的矿石有效期为自获得当月起 12 个自然月，稀土掘金将定期对过期的矿石进行作废处理，即有效期限内未使用的矿石到期将自动作废。
 */
const $ = new require('./env').Env('掘金自动签到&抽奖');
const notify = $.isNode() ? require('./sendNotify') : '';
let cookies = process.env.JUEJIN_COOKIE, cookieArr = [], message = '', JJ_API = 'https://api.juejin.cn';

if (cookies.indexOf('&') > -1) {
    cookieArr = cookies.split('&');
} else {
    cookieArr = [cookies];
}

!(async () => {
    if (!cookies) {
        console.log('请设置环境变量 JUEJIN_COOKIE')
        return;
    }
    for (let i = 0; i < cookieArr.length; i++) {
        if (cookieArr[i]) {
            $.cookie = cookieArr[i];
            $.isLogin = true;
            $.index = i + 1;
            await checkSignIn();
            console.log(`=============账号${$.index}=============\n`);
            if (!$.isLogin) {
                await notify.sendNotify(`${$.name}`, `掘金账号${$.index} cookie可能失效了~\n请重新登录获取cookie`);
                continue;
            }
            await sudojia();
        }
    }
    await sendMsg();
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function sudojia() {
    // 如为 false 表示未签到，则进行签到，加个取非！
    if (!$.isSignIn) {
        // 签到
        await signIn();
    }
    // 统计签到次数
    await getCounts();
    // 查询免费抽奖次数
    await queryFreeLuckyDrawCount();
    if ($.freeCount > 0) {
        message += `【连续签到】${$.contCount} 天\n【累计签到】${$.sumCount} 天\n`;
        // 不花费 200 矿石数进行抽奖，只进行签到所获取到的免费次数进行抽奖！
        for (let i = 0; i < $.freeCount; i++) {
            await freeLuckyDraw();
        }
    }
    // TODO 一键梭哈

}

/**
 * 检测 API、检测今日是否签到或 cookie 是否失效！
 *
 * @returns {*}
 */
function checkSignIn() {
    return new Promise((resolve) => {
        $.get(myRequest('GET', 'growth_api/v1/get_today_status'), (err, response, data) => {
            try {
                if (err) {
                    console.log(`检测 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (data.err_no === 0) {
                        // Success Resp Info: { err_no: 0, err_msg: 'success', data: false }
                        // Error Resp Info: {"err_no":403,"err_msg":"must login","data":null}
                        // data 为 false 说明今日未签到
                        $.isSignIn = data.data;
                    } else {
                        // cookie 可能失效了~
                        $.isLogin = false;
                    }
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        });
    })
}

/**
 * 签到 API
 *
 * @returns {*}
 */
function signIn() {
    return new Promise((resolve) => {
        $.post(myRequest('POST', 'growth_api/v1/check_in', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`签到 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(data.err_no === 0 ? `签到成功~\n【今日收入】${data.data.incr_point} 矿石数\n【当前总矿石数】${data.data.sum_point}\n` : data.err_msg, "\n");
                    message += `\n📣=============账号${$.index}=============📣\n签到成功~\n【今日收入】${data.data.incr_point} 矿石数\n【当前总矿石数】${data.data.sum_point}\n`;
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 统计 API
 *
 * @returns {*}
 */
function getCounts() {
    return new Promise((resolve) => {
        $.get(myRequest('GET', 'growth_api/v1/get_counts'), (err, response, data) => {
            try {
                if (err) {
                    console.log(`统计 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (data.err_no === 0) {
                        // 连续签到天数
                        $.contCount = data.data.cont_count;
                        // 累计签到天数
                        $.sumCount = data.data.sum_count;
                    }
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 查询免费抽奖次数
 *
 * @returns {*}
 */
function queryFreeLuckyDrawCount() {
    return new Promise((resolve) => {
        $.get(myRequest('GET', 'growth_api/v1/lottery_config/get'), (err, response, data) => {
            try {
                if (err) {
                    console.log(`查询免费抽奖次数 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    // console.log(data.data.free_count === 0 ? "今日免费抽奖次数已用尽~\n" : "开始进行免费抽奖！\n");
                    $.freeCount = data.data.free_count;
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 免费抽奖
 *
 * @returns {*}
 */
function freeLuckyDraw() {
    return new Promise((resolve) => {
        $.post(myRequest('POST', 'growth_api/v1/lottery/draw', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`免费抽奖 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(`抽中了【${data.data.lottery_name}】\n`);
                    message += `\n抽中了【${data.data.lottery_name}】`
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 消息推送
 *
 * @returns {*}
 */
function sendMsg() {
    return new Promise(async resolve => {
        if (message) {
            await notify.sendNotify(`${$.name}`, `${message}`);
            resolve();
            return;
        }
        resolve()
    })
}

function myRequest(method, path, body = {}) {
    const url = `${JJ_API}/${path}`;
    const headers = {
        'content-type': 'application/json',
        'accept': '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        'accept-encoding': 'gzip, deflate, br',
        'referer': 'https://juejin.cn/',
        'cookie': $.cookie
    }
    if (method === 'GET') {
        return {
            url: url,
            headers: headers
        };
    } else {
        return {
            url: url,
            body: body,
            headers: headers
        };
    }
}
