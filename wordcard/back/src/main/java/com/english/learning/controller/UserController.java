package com.english.learning.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.learning.config.WechatConfig;
import com.english.learning.entity.User;
import com.english.learning.entity.UserLog;
import com.english.learning.service.UserLogService;
import com.english.learning.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import java.util.HashMap;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserLogService userLogService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private WechatConfig.WechatProperties wechatProperties;

    @Operation(summary = "获取所有用户", description = "获取系统中所有用户列表")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.list();
    }

    @Operation(summary = "根据ID获取用户", description = "根据用户ID获取用户详情")
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @Operation(summary = "创建用户", description = "创建新用户")
    @PostMapping
    public boolean createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @Operation(summary = "更新用户", description = "更新用户信息")
    @PutMapping("/{id}")
    public boolean updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.updateById(user);
    }

    @Operation(summary = "删除用户", description = "根据ID删除用户")
    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable Long id) {
        return userService.removeById(id);
    }
    
    @Operation(summary = "微信登录", description = "处理微信小程序登录，获取或创建用户")
    @PostMapping("/wechat/login")
    public Map<String, Object> wechatLogin(@RequestBody Map<String, String> loginData) {
        String code = loginData.get("code");
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 构建微信API请求URL
            String requestUrl = String.format("%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                    wechatProperties.getJscode2sessionUrl(),
                    wechatProperties.getAppid(),
                    wechatProperties.getAppsecret(),
                    code);
            
            System.out.println("微信登录请求URL: " + requestUrl);
            
            // 调用微信API获取openid和session_key
            Map<String, Object> wechatResponse = restTemplate.getForObject(requestUrl, Map.class);
            
            System.out.println("微信登录响应: " + wechatResponse);
            
            // 检查微信API返回是否成功
            if (wechatResponse == null) {
                throw new RuntimeException("微信登录API调用失败，返回null");
            }
            
            // 微信API错误处理
            if (wechatResponse.containsKey("errcode")) {
                Integer errcode = (Integer) wechatResponse.get("errcode");
                String errmsg = (String) wechatResponse.get("errmsg");
                throw new RuntimeException(String.format("微信登录失败: %s(%d)", errmsg, errcode));
            }
            
            // 获取openid和session_key
            String openid = (String) wechatResponse.get("openid");
            String sessionKey = (String) wechatResponse.get("session_key");
            String unionid = (String) wechatResponse.get("unionid");
            
            if (openid == null) {
                throw new RuntimeException("微信登录失败，未获取到openid");
            }
            
            // 生成token（实际项目中应该使用JWT等方式生成）
            String token = "token_" + System.currentTimeMillis() + "_" + openid;
            
            // 返回结果
            result.put("success", true);
            result.put("openid", openid);
            result.put("session_key", sessionKey);
            result.put("unionid", unionid);
            result.put("token", token);
            result.put("message", "微信登录成功");
            
        } catch (HttpClientErrorException e) {
            System.out.println("微信登录HTTP客户端错误: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "微信登录失败: " + e.getMessage());
        } catch (HttpServerErrorException e) {
            System.out.println("微信登录HTTP服务器错误: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "微信登录失败: 微信服务器暂时不可用");
        } catch (Exception e) {
            System.out.println("微信登录异常: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "微信登录失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @Operation(summary = "根据openid获取用户", description = "根据微信openid获取用户信息")
    @GetMapping("/wechat/{openid}")
    public User getUserByOpenid(@PathVariable String openid) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getOpenid, openid);
        return userService.getOne(queryWrapper);
    }
    
    @Operation(summary = "更新微信用户信息", description = "更新用户的微信信息")
    @PostMapping("/wechat/update")
    public Map<String, Object> updateWechatUserInfo(@RequestBody Map<String, Object> wechatUserInfo) {
        System.out.println("收到微信用户信息更新请求: " + wechatUserInfo);
        
        // 获取openid
        String openid = (String) wechatUserInfo.get("openid");
        System.out.println("openid: " + openid);
        
        // 创建响应对象
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (openid == null) {
                throw new IllegalArgumentException("openid is required");
            }
            
            // 根据openid查找用户
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getOpenid, openid);
            User user = userService.getOne(queryWrapper);
            System.out.println("查询到的用户: " + user);
            
            boolean isNewUser = false;
            // 如果用户不存在，创建新用户
            if (user == null) {
                user = new User();
                isNewUser = true;
                // 设置微信相关字段
                user.setOpenid(openid);
                
                // 生成唯一用户名，避免重复
                String baseUsername = "wechat_" + openid.substring(0, Math.min(15, openid.length()));
                String username = baseUsername;
                int suffix = 1;
                // 检查用户名是否存在，如果存在则添加后缀
                while (userService.count(new LambdaQueryWrapper<User>().eq(User::getUsername, username)) > 0) {
                    username = baseUsername + "_" + suffix++;
                }
                
                user.setUsername(username);
                user.setEmail(openid + "@wechat.local");
                user.setPassword("");
                user.setStatus(1);
                // 设置通用用户信息
                user.setNickname((String) wechatUserInfo.get("nickname"));
                user.setAvatarUrl((String) wechatUserInfo.get("avatarUrl"));
                // 设置微信专用信息
                user.setWechatNickname((String) wechatUserInfo.get("nickname"));
                user.setWechatAvatar((String) wechatUserInfo.get("avatarUrl"));
                user.setWechatGender((Integer) wechatUserInfo.get("gender"));
                user.setWechatCountry((String) wechatUserInfo.get("country"));
                user.setWechatProvince((String) wechatUserInfo.get("province"));
                user.setWechatCity((String) wechatUserInfo.get("city"));
                
                System.out.println("创建新用户: " + user);
                userService.save(user);
                System.out.println("新用户创建成功，ID: " + user.getId());
            } else {
                // 更新通用用户信息
                if (wechatUserInfo.get("nickname") != null) {
                    user.setNickname((String) wechatUserInfo.get("nickname"));
                }
                if (wechatUserInfo.get("avatarUrl") != null) {
                    user.setAvatarUrl((String) wechatUserInfo.get("avatarUrl"));
                }
                // 更新微信相关字段
                if (wechatUserInfo.get("nickname") != null) {
                    user.setWechatNickname((String) wechatUserInfo.get("nickname"));
                }
                if (wechatUserInfo.get("avatarUrl") != null) {
                    user.setWechatAvatar((String) wechatUserInfo.get("avatarUrl"));
                }
                if (wechatUserInfo.get("gender") != null) {
                    user.setWechatGender((Integer) wechatUserInfo.get("gender"));
                }
                if (wechatUserInfo.get("country") != null) {
                    user.setWechatCountry((String) wechatUserInfo.get("country"));
                }
                if (wechatUserInfo.get("province") != null) {
                    user.setWechatProvince((String) wechatUserInfo.get("province"));
                }
                if (wechatUserInfo.get("city") != null) {
                    user.setWechatCity((String) wechatUserInfo.get("city"));
                }
                
                // 更新最后登录时间
                user.setLastLoginAt(LocalDateTime.now());
                
                System.out.println("更新用户信息: " + user);
                userService.updateById(user);
                System.out.println("用户信息更新成功");
            }
            
            // 记录登录日志到user_logs表
            UserLog userLog = new UserLog();
            userLog.setUserId(user.getId());
            userLog.setUsername(user.getUsername());
            userLog.setLoginTime(LocalDateTime.now());
            userLog.setLoginIp("127.0.0.1");
            userLog.setLoginDevice("WeChat Mini Program");
            userLog.setLoginPlatform("wechat");
            userLog.setLoginStatus(1);
            userLog.setUserAgent("WeChat Mini Program");
            userLogService.save(userLog);
            System.out.println("登录日志记录成功，ID: " + userLog.getId());
            
            response.put("success", true);
            response.put("message", isNewUser ? "用户创建并登录成功" : "用户信息更新成功");
            response.put("userId", user.getId());
            response.put("isNewUser", isNewUser);
            
        } catch (Exception e) {
            System.out.println("更新微信用户信息异常: " + e.getMessage());
            e.printStackTrace();
            
            // 记录失败的登录日志
            UserLog failedLog = new UserLog();
            failedLog.setUsername(openid != null ? "wechat_" + openid.substring(0, Math.min(20, openid.length())) : "unknown");
            failedLog.setLoginTime(LocalDateTime.now());
            failedLog.setLoginIp("127.0.0.1");
            failedLog.setLoginDevice("WeChat Mini Program");
            failedLog.setLoginPlatform("wechat");
            failedLog.setLoginStatus(0);
            failedLog.setFailReason(e.getMessage());
            failedLog.setUserAgent("WeChat Mini Program");
            try {
                userLogService.save(failedLog);
            } catch (Exception logEx) {
                System.out.println("记录登录日志失败: " + logEx.getMessage());
                logEx.printStackTrace();
            }
            
            response.put("success", false);
            response.put("message", "操作失败: " + e.getMessage());
        }
        
        return response;
    }
}
