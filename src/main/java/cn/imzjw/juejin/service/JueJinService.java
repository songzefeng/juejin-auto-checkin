package cn.imzjw.juejin.service;

import cn.imzjw.juejin.constant.CommonConst;
import cn.imzjw.juejin.utils.HttpUtils;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 掘金 service
 *
 * @author https://blog.imzjw.cn
 * @date 2021/11/27 10:07
 */
public class JueJinService {

    /**
     * 获取日志记录器
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(JueJinService.class);
    /**
     * 消息
     */
    private static String msg = "";

    /**
     * 检测
     */
    public void checkSignIn() {
        try {
            JSONObject jsonObject = CommUtils.request(CommonConst.GET, 1);
            // 返回 403, 说明 Cookie 可能失效了
            if (CommonConst.SC_FORBIDDEN == jsonObject.getInteger(CommonConst.ERR_NO)) {
                LOGGER.error("Cookie 可能失效了，请重新获取!!!\n");
                return;
            }
            // 如不是 403 状态则判断今日是否已经签到过了
            if (jsonObject.getBoolean(CommonConst.DATA)) {
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
            JSONObject jsonObject = CommUtils.request(CommonConst.POST, 2);
            if (CommUtils.isNormalUsers(jsonObject)) {
                // 签到所获取的矿石数
                Integer incrPoint = jsonObject.getJSONObject(CommonConst.DATA).getInteger(CommonConst.INCR_POINT);
                // 当前账号总矿石数
                Integer sumPoint = jsonObject.getJSONObject(CommonConst.DATA).getInteger(CommonConst.SUM_POINT);
                msg += "「掘金签到报告」\n\n【账号信息】" + CommUtils.getUserName() + "\n【签到状态】签到成功~\n【今日收入】" + incrPoint + "矿石数\n【总矿石数】" + sumPoint + "矿石数\n";
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
            JSONObject jsonObject = CommUtils.request(CommonConst.POST, 5);
            if (CommUtils.isNormalUsers(jsonObject)) {
                msg += "【抽奖信息】抽中了" + jsonObject.getJSONObject(CommonConst.DATA).getString(CommonConst.LOTTERY_NAME) + "\n";
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
            JSONObject jsonObject = CommUtils.request(CommonConst.GET, 4);
            if (CommUtils.isNormalUsers(jsonObject)) {
                return jsonObject.getJSONObject(CommonConst.DATA).getInteger(CommonConst.FREE_COUNT);
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
            JSONObject jsonObject = CommUtils.request(CommonConst.GET, 3);
            if (CommUtils.isNormalUsers(jsonObject)) {
                // 连续签到天数
                Integer contCount = jsonObject.getJSONObject(CommonConst.DATA).getInteger(CommonConst.CONT_COUNT);
                // 累计签到天数
                Integer sumCount = jsonObject.getJSONObject(CommonConst.DATA).getInteger(CommonConst.SUM_COUNT);
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
    public void sendMsg(String token) {
        HttpUtils.msgGet("http://pushplus.hxtrip.com/send?token="
                + token + "&title=掘金签到报告 "
                + "&content=" + msg);
    }
}
