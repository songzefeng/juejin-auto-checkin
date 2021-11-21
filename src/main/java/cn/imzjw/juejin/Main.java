package cn.imzjw.juejin;

import cn.imzjw.juejin.constant.CommonConstants;
import cn.imzjw.juejin.entity.Cookie;
import cn.imzjw.juejin.utils.HttpUtils;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Telegram@sudojia
 * @date 2021/11/17 20:36
 */
public class Main {
    /**
     * 获取日志记录器
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);
    /**
     * 路径 Map
     */
    private static final Map<Integer, String> PATH_MAP = new HashMap<>(16);
    /**
     * 消息
     */
    private static String msg = "";

    static {
        // 检测签到状态 \ Cookie 是否失效
        PATH_MAP.put(1, "/growth_api/v1/get_today_status");
        // 签到接口
        PATH_MAP.put(2, "/growth_api/v1/check_in");
        // 统计签到次数
        PATH_MAP.put(3, "/growth_api/v1/get_counts");
        // 查询免费抽奖次数
        PATH_MAP.put(4, "/growth_api/v1/lottery_config/get");
        // 抽奖接口
        PATH_MAP.put(5, "/growth_api/v1/lottery/draw");
        // 个人主页
        PATH_MAP.put(6, "/user_api/v1/user/get");
    }

    private void checkSignIn() {
        try {
            JSONObject jsonObject = request(CommonConstants.GET, 1);
            // 返回 403, 说明 Cookie 可能失效了
            if (CommonConstants.SC_FORBIDDEN == jsonObject.getInteger(CommonConstants.ERR_NO)) {
                LOGGER.error("Cookie 可能失效了，请重新获取!!!\n");
                return;
            }
            // 如不是 403 状态则判断今日是否已经签到过了
            if (jsonObject.getBoolean(CommonConstants.DATA)) {
                // 如果为 true, 则今日已完成签到
                LOGGER.info("您今日已完成签到，请勿重复签到~\n");
                return;
            }
            // 若没有以上任何状态则开始调用签到接口 (未签到状态且 Cookie 未失效状态)
            checkIn();
        } catch (Exception e) {
            LOGGER.error("检测状态请求失败 -> {}", e.getMessage());
        }
    }

    /**
     * 签到接口
     */
    private void checkIn() {
        try {
            // 直接调用签到接口就好了，前面直接判断了今日是否已经签到
            // 所以无需再判断是否已经签到过了
            JSONObject jsonObject = request(CommonConstants.POST, 2);
            if (isNormalUsers(jsonObject)) {
                // 签到所获取的矿石数
                Integer incrPoint = jsonObject.getJSONObject(CommonConstants.DATA).getInteger(CommonConstants.INCR_POINT);
                // 当前账号总矿石数
                Integer sumPoint = jsonObject.getJSONObject(CommonConstants.DATA).getInteger(CommonConstants.SUM_POINT);
                LOGGER.info("签到成功~");
                LOGGER.info("【今日收入】" + incrPoint + "矿石数 【当前总矿石数】" + sumPoint + "矿石数");
                msg += "「掘金签到报告」\n\n【账号信息】" + getUserName() + "\n【签到状态】签到成功~\n【今日收入】" + incrPoint + "矿石数\n【总矿石数】" + sumPoint + "矿石数\n";
                getCounts();
                Thread.sleep(1500);
                // 获取免费抽奖次数
                Integer drawCount = queryFreeLuckyDrawCount();
                // 当免费抽奖次数大于 0 时才进行抽奖
                // 目前只利用签到所获取的免费抽奖次数进行抽奖，不花费 200 矿石数进行抽奖
                if (0 == drawCount || -1 == drawCount) {
                    LOGGER.info("今日免费抽奖次数已用尽！");
                    return;
                }
                // 如果抽奖免费次数大于 0 则开始抽奖, 好像免费的也就一次，不循环也可以
                for (int i = 0; i < drawCount; i++) {
                    luckyDraw();
                    Thread.sleep(1500);
                }
            }
        } catch (Exception e) {
            LOGGER.error("签到异常 - {}", e.getMessage());
        }
    }

    /**
     * 抽奖
     * 目前已知奖品
     * lottery_id: 6981716980386496552、name: 66矿石、type: 1
     * lottery_id: 6981716405976743943、name: Bug、type: 2
     * lottery_id: 7020245697131708419、name: 掘金帆布袋、type: 4
     * lottery_id: 7017679355841085472、name: 随机限量徽章、type: 4
     * lottery_id: 6997270183769276416、name: Yoyo抱枕、type: 4
     * lottery_id: 7001028932350771203、name: 掘金马克杯、type: 4
     * lottery_id: 7020306802570952718、name: 掘金棒球帽、type: 4
     * lottery_id: 6981705951946489886、name: Switch、type: 3
     */
    private void luckyDraw() {
        try {
            JSONObject jsonObject = request(CommonConstants.POST, 5);
            if (isNormalUsers(jsonObject)) {
                LOGGER.info("抽中了【" + jsonObject.getJSONObject(CommonConstants.DATA).getString(CommonConstants.LOTTERY_NAME) + "】");
                msg += "【抽奖信息】抽中了" + jsonObject.getJSONObject(CommonConstants.DATA).getString(CommonConstants.LOTTERY_NAME) + "\n";
            }
        } catch (Exception e) {
            LOGGER.error("抽奖接口请求失败 -> {}", e.getMessage());
        }
    }

    /**
     * 查询免费抽奖次数
     *
     * @return 抽奖次数
     */
    private Integer queryFreeLuckyDrawCount() {
        try {
            JSONObject jsonObject = request(CommonConstants.GET, 4);
            if (isNormalUsers(jsonObject)) {
                return jsonObject.getJSONObject(CommonConstants.DATA).getInteger(CommonConstants.FREE_COUNT);
            }
        } catch (Exception e) {
            LOGGER.error("查询免费抽奖次数接口请求失败 -> {}", e.getMessage());
        }
        return -1;
    }

    /**
     * 统计签到天数, 没什么用~
     */
    private void getCounts() {
        try {
            JSONObject jsonObject = request(CommonConstants.GET, 3);
            if (isNormalUsers(jsonObject)) {
                // 连续签到天数
                Integer contCount = jsonObject.getJSONObject(CommonConstants.DATA).getInteger(CommonConstants.CONT_COUNT);
                // 累计签到天数
                Integer sumCount = jsonObject.getJSONObject(CommonConstants.DATA).getInteger(CommonConstants.SUM_COUNT);
                LOGGER.info("连续签到" + contCount + "天");
                LOGGER.info("累计签到" + sumCount + "天");
                msg += "【签到统计】连签" + contCount + "天、累签" + sumCount + "天\n";
            }
        } catch (Exception e) {
            LOGGER.error("统计签到天数请求失败 -> {}", e.getMessage());
        }
    }

    /**
     * 推送消息
     *
     * @param token PushPlus 令牌
     */
    private void sendMsg(String token) {
        HttpUtils.msgGet("http://pushplus.hxtrip.com/send?token="
                + token + "&title=掘金签到报告 "
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                + "&content=" + msg);
    }

    /**
     * 根据响应结果判断是否正常用户 or 正常请求
     *
     * @param jsonObject json 对象
     * @return true: 正常用户、false: 非正常用户
     */
    private Boolean isNormalUsers(JSONObject jsonObject) {
        return jsonObject.getInteger(CommonConstants.ERR_NO) == 0 || CommonConstants.SUCCESS.equals(jsonObject.getString(CommonConstants.ERR_MSG));
    }

    /**
     * 获取用户名
     *
     * @return 用户名
     */
    private String getUserName() {
        return request(CommonConstants.GET, 6).getJSONObject(CommonConstants.DATA).getString(CommonConstants.USER_NAME);
    }

    /**
     * 没什么意义
     *
     * @param method 请求方法
     * @param type   路径类型
     * @return 响应数据
     */
    private JSONObject request(String method, Integer type) {
        if ("GET".equals(method)) {
            return HttpUtils.get(getPath(type));
        }
        return HttpUtils.post(getPath(type), "");
    }

    /**
     * 根据传入的 Type 获取请求路径
     *
     * @param type 类型
     * @return API 接口
     */
    private String getPath(Integer type) {
        return PATH_MAP.get(type);
    }

    /**
     * 入口函数
     *
     * @param args 入口参数
     */
    public static void main(String[] args) {
        Main main = new Main();
        Cookie cookie = Cookie.getInstance();
        if (args.length == 0) {
            LOGGER.warn("请在 Secrets 中填写环境变量【COOKIE】");
            return;
        }
        cookie.setCookies(args[0]);
        main.checkSignIn();
        if (2 == args.length && !"".equals(msg)) {
            main.sendMsg(args[1]);
        }
    }
}
