package cn.imzjw.juejin.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author https://blog.imzjw.cn
 * @date 2021/11/17 20:36
 */
@Data
@NoArgsConstructor
public class Cookie {

    private static final Cookie COOKIE = new Cookie();

    /**
     * 掘金社区 cookie
     */
    @Getter(AccessLevel.NONE)
    private String cookies;

    public static Cookie getInstance() {
        return COOKIE;
    }

    public String getCookies() {
        return "sessionid=" + cookies;
    }
}
