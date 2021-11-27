package cn.imzjw.juejin.service;

import cn.imzjw.juejin.constant.CommonConst;
import cn.imzjw.juejin.utils.HttpUtils;
import com.alibaba.fastjson.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * @author https://blog.imzjw.cn
 * @date 2021/11/27 10:12
 */
public class CommUtils {

    /**
     * 路径 Map
     */
    private static final Map<Integer, String> PATH_MAP = new HashMap<>(16);

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

    /**
     * 根据响应结果判断是否正常用户 or 正常请求
     *
     * @param jsonObject json 对象
     * @return true: 正常用户、false: 非正常用户
     */
    public static Boolean isNormalUsers(JSONObject jsonObject) {
        return jsonObject.getInteger(CommonConst.ERR_NO) == 0 || CommonConst.SUCCESS.equals(jsonObject.getString(CommonConst.ERR_MSG));
    }

    /**
     * 获取用户名
     *
     * @return 用户名
     */
    public static String getUserName() {
        return request(CommonConst.GET, 6).getJSONObject(CommonConst.DATA).getString(CommonConst.USER_NAME);
    }

    /**
     * 没什么意义
     *
     * @param method 请求方法
     * @param type   路径类型
     * @return 响应数据
     */
    public static JSONObject request(String method, Integer type) {
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
    public static String getPath(Integer type) {
        return PATH_MAP.get(type);
    }
}
