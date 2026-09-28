package com.example.reference.infrastructure;

import com.example.reference.application.dto.OrganizationDTO;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Repository;

/** 固定、只读教学数据源。未使用 ORM，返回不可变投影，无数据库事务能力。 */
@Repository
public class OrganizationRepository {
    /** 三条不可变教学记录，用于验证同企业读取和跨企业隔离。 */
    private static final List<OrganizationDTO> ROWS = List.of(
        new OrganizationDTO("org-a1", "Alpha", "enterprise-a", Instant.parse("2026-01-01T00:00:00Z")),
        new OrganizationDTO("org-a2", "Beta", "enterprise-a", Instant.parse("2026-01-01T00:00:00Z")),
        new OrganizationDTO("org-b1", "Gamma", "enterprise-b", Instant.parse("2026-01-02T00:00:00Z"))
    );

    /**
     * 从固定只读数据集中筛选指定企业的组织；本方法不负责动作权限检查，也不执行分页。
     *
     * @param enterpriseId 由可信认证上下文取得的企业标识
     * @return 该企业的不可变组织列表，无匹配时为空列表
     */
    public List<OrganizationDTO> findByEnterpriseId(String enterpriseId) {
        return ROWS.stream().filter(row -> row.getEnterpriseId().equals(enterpriseId)).toList();
    }
}
