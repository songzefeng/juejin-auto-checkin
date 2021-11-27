package cn.imzjw.juejin.constant;

/**
 * 一些常量
 *
 * @author https://blog.imzjw.cn
 * @date 2021/11/5 19:37
 */
public interface CommonConst {
    /**
     * 成功
     */
    String SUCCESS = "success";
    /**
     * 0: 正常、403: 非正常
     */
    String ERR_NO = "err_no";
    /**
     * 返回信息
     */
    String ERR_MSG = "err_msg";
    /**
     * 连续签到天数
     */
    String CONT_COUNT = "cont_count";
    /**
     * 累计签到天数
     */
    String SUM_COUNT = "sum_count";
    /**
     * 返回的数据
     */
    String DATA = "data";
    /**
     * 禁止访问
     */
    int SC_FORBIDDEN = 403;
    /**
     * POST
     */
    String POST = "POST";
    /**
     * GET
     */
    String GET = "GET";
    /**
     * 掘金官网
     */
    String JUE_JIN_HOST = "https://juejin.cn";
    /**
     * 签到所获取的矿石数
     */
    String INCR_POINT = "incr_point";
    /**
     * 当前账号总矿石数
     */
    String SUM_POINT = "sum_point";
    /**
     * 免费抽奖次数
     */
    String FREE_COUNT = "free_count";
    /**
     * 奖品名称
     */
    String LOTTERY_NAME = "lottery_name";
    /**
     * 用户名
     */
    String USER_NAME = "user_name";
}
