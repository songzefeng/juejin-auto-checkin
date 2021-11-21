package cn.imzjw.juejin.utils;

import cn.imzjw.juejin.constant.CommonConstants;
import cn.imzjw.juejin.entity.Cookie;
import com.alibaba.fastjson.JSONObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * http 请求工具类
 *
 * @author https://blog.imzjw.cn
 * @date 2021/11/17 20:35
 */
public class HttpUtils {
    /**
     * 获取 Cookie 对象
     */
    private static final Cookie COOKIE = Cookie.getInstance();
    /**
     * API 接口
     */
    private static final String JJ_API = "https://api.juejin.cn";
    /**
     * USER AGENT
     */
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36";
    /**
     * 手动初始化 WebClient
     */
    private static WebClient client = WebClient
            .builder()
            .baseUrl(JJ_API)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.ALL_VALUE)
            .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
            .defaultHeader(HttpHeaders.REFERER, CommonConstants.JUE_JIN_HOST)
            .defaultHeader(HttpHeaders.COOKIE, COOKIE.getCookies())
            .build();

    /**
     * 发送 GET 请求
     *
     * @param path 请求路径
     * @return 响应结果
     */
    public static JSONObject get(String path) {
        WebClient.ResponseSpec responseSpec = client
                // GET 请求
                .get()
                // 请求路径
                .uri(path)
                // 获取响应体
                .retrieve();
        return responseSpec.bodyToMono(JSONObject.class).block();
    }

    /**
     * 发送 POST 请求、JSON
     *
     * @param path 请求路径
     * @param json JSON 数据
     * @return 响应结果
     */
    public static JSONObject post(String path, String json) {
        // 发送请求
        Mono<JSONObject> mono = client
                // POST 请求
                .post()
                // 请求路径
                .uri(path)
                // JSON 字符串数据
                .body(BodyInserters.fromValue(json))
                // 获取响应体
                .retrieve()
                // 响应数据类型转换
                .bodyToMono(JSONObject.class);
        // 返回响应结果
        return mono.block();
    }

    public static void msgGet(String path) {
        WebClient.ResponseSpec responseSpec = client
                // GET 请求
                .get()
                // 请求路径
                .uri(path)
                // 获取响应体
                .retrieve();
        responseSpec.bodyToMono(String.class).block();
    }
}
