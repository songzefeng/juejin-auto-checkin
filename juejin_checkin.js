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
const $ = new Env('掘金自动签到&抽奖');
const notify = require('./sendNotify');
let jueJinCookie = $.isNode() ? (process.env.JUEJIN_COOKIE ? process.env.JUEJIN_COOKIE : '') : ($.getdata('JUEJIN_COOKIE') ? $.getdata('JUEJIN_COOKIE') : ''),
    cookiesArr = [], message = '';

const JJ_API = 'https://api.juejin.cn';

if (jueJinCookie.indexOf('&') > -1) {
    cookiesArr = jueJinCookie.split('&');
} else {
    cookiesArr = [jueJinCookie];
}

!(async () => {
    if (!jueJinCookie) {
        console.log('请设置环境变量 JUEJIN_COOKIE')
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        $.cookie = cookiesArr[i];
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

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
