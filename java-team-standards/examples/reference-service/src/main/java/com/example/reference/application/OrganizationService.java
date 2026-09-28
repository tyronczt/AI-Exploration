package com.example.reference.application;

import com.example.reference.application.dto.CallerDTO;
import com.example.reference.application.dto.OrganizationDTO;
import com.example.reference.application.dto.OrganizationDetailQueryDTO;
import com.example.reference.application.dto.OrganizationPageDTO;
import com.example.reference.application.dto.OrganizationPageQueryDTO;
import com.example.reference.infrastructure.OrganizationRepository;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/** 组织查询业务：校验动作权限，按可信企业范围读取、排序与分页。 */
@Service
public class OrganizationService {
    /** 提供限定企业范围的组织只读数据，不接受客户端直接指定授权范围。 */
    private final OrganizationRepository repository;

    /**
     * 创建组织查询服务，所有读取通过同一仓储限定数据范围。
     *
     * @param repository 组织只读数据源
     */
    public OrganizationService(OrganizationRepository repository) {
        this.repository = repository;
    }

    /**
     * 分页查询调用方有权读取的组织，不产生业务写入。
     * 先校验读取权限，再按可信企业范围筛选；按创建时间降序、组织 ID 降序分页。
     * 总数与列表使用同一可见范围，超过末页返回空列表；排序不承诺并发写入下的快照一致性。
     *
     * @param query 非空分页条件；页码从 1 开始，每页 1～100 条，构造时已校验
     * @param caller 非空的服务端认证上下文，企业归属与权限不得取自客户端自报字段
     * @return 可见组织的当前页、可见总数及原分页参数
     * @throws AccessDeniedException 调用方缺少 organization:read 动作权限
     */
    public OrganizationPageDTO page(OrganizationPageQueryDTO query, CallerDTO caller) {
        requireRead(caller);
        // ponytail: 固定三条只读数据在内存分页；接数据库时将过滤、排序、分页下推 SQL。
        List<OrganizationDTO> visible = repository.findByEnterpriseId(caller.getEnterpriseId()).stream()
            .sorted(Comparator.comparing(OrganizationDTO::getCreatedAt).reversed()
                .thenComparing(OrganizationDTO::getId, Comparator.reverseOrder()))
            .toList();
        // 先转 long 再计算偏移，避免极大页码导致 int 溢出并读到错误页面。
        long offset = ((long) query.getPageNo() - 1) * query.getPageSize();
        List<OrganizationDTO> items = visible.stream().skip(offset).limit(query.getPageSize()).toList();
        return new OrganizationPageDTO(items, visible.size(), query.getPageNo(), query.getPageSize());
    }

    /**
     * 读取调用方所属企业内的组织详情，不产生业务写入。
     * 跨企业与不存在资源均视为不可见，由统一异常处理映射为相同的 404，避免泄漏资源存在性。
     *
     * @param query 非空详情条件，包含已校验的组织标识
     * @param caller 非空的服务端认证上下文
     * @return 当前主体有权读取的组织数据
     * @throws AccessDeniedException 缺少组织读取权限
     * @throws NoSuchElementException 组织不存在或不属于调用方企业
     */
    public OrganizationDTO detail(OrganizationDetailQueryDTO query, CallerDTO caller) {
        requireRead(caller);
        return repository.findByEnterpriseId(caller.getEnterpriseId()).stream()
            .filter(row -> row.getId().equals(query.getOrganizationId()))
            .findFirst().orElseThrow(NoSuchElementException::new);
    }

    /**
     * 校验组织读取动作权限；资源归属仍由后续企业范围查询限定，不能用动作权限替代。
     *
     * @param caller 非空且由服务端认证关系建立的调用上下文
     * @throws AccessDeniedException 权限集合不包含 organization:read
     */
    private void requireRead(CallerDTO caller) {
        if (!caller.getPermissions().contains("organization:read")) {
            throw new AccessDeniedException("Organization read permission required");
        }
    }
}
