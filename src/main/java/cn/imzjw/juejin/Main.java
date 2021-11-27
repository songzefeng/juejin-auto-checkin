package cn.imzjw.juejin;

import cn.imzjw.juejin.entity.Cookie;
import cn.imzjw.juejin.service.JueJinService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
     * 入口函数
     *
     * @param args 入口参数
     */
    public static void main(String[] args) {
        JueJinService service = new JueJinService();
        Cookie cookie = Cookie.getInstance();
        if (args.length == 0) {
            LOGGER.warn("请在 Secrets 中填写环境变量【COOKIE】");
            return;
        }
        cookie.setCookies(args[0]);
        service.checkSignIn();
        if (2 == args.length) {
            service.sendMsg(args[1]);
        }
    }
}
