package com.example.reference.web;

import com.example.reference.application.OrganizationService;
import com.example.reference.application.dto.OrganizationDTO;
import com.example.reference.application.dto.OrganizationDetailQueryDTO;
import com.example.reference.application.dto.OrganizationPageDTO;
import com.example.reference.application.dto.OrganizationPageQueryDTO;
import com.example.reference.security.DemoSecurityConfiguration;
import com.example.reference.web.query.OrganizationDetailQuery;
import com.example.reference.web.query.OrganizationPageQuery;
import com.example.reference.web.vo.ApiResponseVO;
import com.example.reference.web.vo.OrganizationPageVO;
import com.example.reference.web.vo.OrganizationVO;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 组织 Web 边界：绑定校验 Query、转换 DTO/VO，业务与权限交由应用服务。 */
@RestController
@RequestMapping("/api/reference/organizations")
public class OrganizationController {
    /** 负责组织查询业务和权限判断。 */
    private final OrganizationService service;
    /** 将已认证账号映射到服务端维护的企业与权限。 */
    private final DemoSecurityConfiguration identities;

    /**
     * 注入组织用例及演示身份解析器，不在 Controller 保存请求级状态。
     *
     * @param service 组织查询及权限校验服务
     * @param identities 从已认证身份取得可信企业与动作权限的解析器
     */
    public OrganizationController(OrganizationService service, DemoSecurityConfiguration identities) {
        this.service = service;
        this.identities = identities;
    }

    /**
     * 分页查询当前认证主体可见的组织，保留已确认的 POST 契约以演示 JSON 绑定与 CSRF。
     * 当前仅有两个业务参数；新接口按参数数量选择方法，不因分页强制 POST。
     * 地址：{@code POST /api/reference/organizations/page}，JSON 请求体示例：
     * {@code {"pageNo":1,"pageSize":20}}。方法只读，不产生业务状态变化。
     * 空对象使用默认分页；缺失请求体、格式或校验错误返回 400，不支持的媒体类型返回 415。
     * 演示 HTTP Basic 保留 CSRF：先获取令牌，再携带同一会话 Cookie 和返回的令牌请求头。
     * CSRF 缺失/错误或无动作权限均返回 403；通过 CSRF 后，未认证请求返回 401。
     *
     * @param query 已绑定默认值并经 @Valid 校验的分页参数
     * @param authentication Spring Security 提供的认证身份，不从客户端 Query 中绑定
     * @return 仅包含当前主体可见组织的成功响应；失败由统一异常处理返回对应 HTTP 状态
     */
    @PostMapping("/page")
    public ApiResponseVO<OrganizationPageVO> page(
            @Valid @RequestBody OrganizationPageQuery query, Authentication authentication) {
        // 查询范围来自服务端认证关系，不接受客户端自报企业或权限。
        OrganizationPageDTO page = service.page(new OrganizationPageQueryDTO(query.getPageNo(), query.getPageSize()),
            identities.caller(authentication));
        // 仅返回 Web 约定字段，内部企业归属不随 DTO 暴露给前端。
        return ApiResponseVO.ok(new OrganizationPageVO(page.getItems().stream().map(this::toVO).toList(),
            page.getTotal(), page.getPageNo(), page.getPageSize()));
    }

    /**
     * 组织详情接口：仅转换边界对象，动作权限和资源归属交由应用服务判断。
     *
     * @param query 经 @Valid 校验的组织标识
     * @param authentication Spring Security 提供的认证身份，不从客户端 Query 中绑定
     * @return 可见组织的展示数据；不存在或不可见时由异常处理返回 404
     */
    @GetMapping("/detail")
    public ApiResponseVO<OrganizationVO> detail(
            @Valid @ModelAttribute OrganizationDetailQuery query, Authentication authentication) {
        return ApiResponseVO.ok(toVO(service.detail(new OrganizationDetailQueryDTO(query.getOrganizationId()),
            identities.caller(authentication))));
    }

    /**
     * 按 Web 契约挑选展示字段，避免将内部企业归属随 DTO 一起暴露。
     *
     * @param source 已完成资源权限校验的非空组织数据
     * @return 仅包含标识、展示名称和创建时刻的 VO
     */
    private OrganizationVO toVO(OrganizationDTO source) {
        return new OrganizationVO(source.getId(), source.getDisplayName(), source.getCreatedAt());
    }
}
