<template>
  <div class="admin-container">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>英语单词学习系统</h1>
      </div>
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
        >
          <template v-for="menu in userMenus" :key="menu.code">
            <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.code">
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
            <el-sub-menu v-else :index="menu.code">
              <template #title>
                <el-icon><component :is="menu.icon" /></el-icon>
                <span>{{ menu.name }}</span>
              </template>
              <el-menu-item v-for="subMenu in menu.children" :key="subMenu.code" :index="subMenu.code">
                <el-icon><component :is="subMenu.icon" /></el-icon>
                <span>{{ subMenu.name }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-bar">
        <div class="top-bar-left">
          <el-icon class="menu-toggle" @click="toggleSidebar"><el-icon-menu /></el-icon>
        </div>
        <div class="top-bar-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><el-icon-user /></el-icon>
              {{ currentUser.nickname || '管理员' }}
              <el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="content">
        <component :is="currentComponent" />
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { 
  Location as ElIconLocation, 
  Document as ElIconDocument, 
  Edit as ElIconEdit, 
  User as ElIconUser, 
  DataAnalysis as ElIconDataAnalysis,
  Menu as ElIconMenu,
  ArrowDown as ElIconArrowDown,
  Setting as ElIconSetting,
  UserFilled as ElIconUserSolid,
  DataLine as ElIconDataLine
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 导入页面组件
import Dashboard from './views/Dashboard.vue'
import Wordbooks from './views/Wordbooks.vue'
import Words from './views/Words.vue'
import Users from './views/Users.vue'
import Statistics from './views/Statistics.vue'
import Permissions from './views/Permissions.vue'
import Roles from './views/Roles.vue'

export default {
  name: 'App',
  components: {
    Dashboard,
    Wordbooks,
    Words,
    Users,
    Statistics,
    Permissions,
    Roles,
    ElIconLocation,
    ElIconDocument,
    ElIconEdit,
    ElIconUser,
    ElIconDataAnalysis,
    ElIconMenu,
    ElIconArrowDown,
    ElIconSetting,
    ElIconUserSolid,
    ElIconDataLine
  },
  setup() {
    // 当前激活的菜单
    const activeMenu = ref('dashboard')
    // 侧边栏是否折叠
    const isSidebarCollapsed = ref(false)
    // 当前用户信息
    const currentUser = reactive({
      id: 1,
      nickname: '管理员',
      avatarUrl: ''
    })
    // 用户权限列表
    const userPermissions = ref([])
    // 用户菜单列表
    const userMenus = ref([])

    // 图标映射表
    const iconMap = {
      'el-icon-data-analysis': ElIconLocation,
      'el-icon-document': ElIconDocument,
      'el-icon-edit': ElIconEdit,
      'el-icon-user': ElIconUser,
      'el-icon-data-line': ElIconDataAnalysis,
      'el-icon-setting': ElIconSetting,
      'el-icon-user-solid': ElIconUserSolid
    }

    // 组件映射表
    const componentMap = {
      dashboard: Dashboard,
      wordbooks: Wordbooks,
      words: Words,
      users: Users,
      statistics: Statistics,
      permissions: Permissions,
      roles: Roles
    }

    // 当前显示的组件
    const currentComponent = computed(() => {
      return componentMap[activeMenu.value] || Dashboard
    })

    // 获取用户菜单
    const getUserMenus = () => {
      // 模拟从后端获取用户菜单数据
      // 实际项目中应该调用API获取
      const mockMenus = [
        {
          id: 1,
          name: '仪表盘',
          code: 'dashboard',
          type: 1,
          path: '/dashboard',
          component: 'views/Dashboard.vue',
          icon: 'el-icon-data-analysis',
          parentId: 0,
          sort: 1
        },
        {
          id: 2,
          name: '词库管理',
          code: 'wordbooks',
          type: 1,
          path: '/wordbooks',
          component: 'views/Wordbooks.vue',
          icon: 'el-icon-document',
          parentId: 0,
          sort: 2
        },
        {
          id: 3,
          name: '单词管理',
          code: 'words',
          type: 1,
          path: '/words',
          component: 'views/Words.vue',
          icon: 'el-icon-edit',
          parentId: 0,
          sort: 3
        },
        {
          id: 4,
          name: '用户管理',
          code: 'users',
          type: 1,
          path: '/users',
          component: 'views/Users.vue',
          icon: 'el-icon-user',
          parentId: 0,
          sort: 4
        },
        {
          id: 5,
          name: '统计分析',
          code: 'statistics',
          type: 1,
          path: '/statistics',
          component: 'views/Statistics.vue',
          icon: 'el-icon-data-line',
          parentId: 0,
          sort: 5
        },
        {
          id: 6,
          name: '权限管理',
          code: 'permissions',
          type: 1,
          path: '/permissions',
          component: 'views/Permissions.vue',
          icon: 'el-icon-setting',
          parentId: 0,
          sort: 6
        },
        {
          id: 7,
          name: '角色管理',
          code: 'roles',
          type: 1,
          path: '/roles',
          component: 'views/Roles.vue',
          icon: 'el-icon-user-solid',
          parentId: 0,
          sort: 7
        }
      ]
      
      // 将菜单转换为树状结构
      userMenus.value = buildMenuTree(mockMenus, 0)
    }

    // 构建菜单树
    const buildMenuTree = (menus, parentId) => {
      return menus
        .filter(menu => menu.parentId === parentId)
        .map(menu => {
          const children = buildMenuTree(menus, menu.id)
          return {
            ...menu,
            children: children.length > 0 ? children : null,
            icon: iconMap[menu.icon] || ElIconLocation
          }
        })
        .sort((a, b) => a.sort - b.sort)
    }

    // 菜单选择事件
    const handleMenuSelect = (key, keyPath) => {
      activeMenu.value = key
    }

    // 切换侧边栏显示
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    // 退出登录
    const logout = () => {
      ElMessage.success('退出登录成功')
      // 实际项目中应该清除本地存储并跳转到登录页
    }

    // 检查用户是否有权限
    const hasPermission = (permissionCode) => {
      // 模拟权限检查，实际项目中应该根据userPermissions进行检查
      return true
    }

    // 页面加载时获取用户菜单和权限
    onMounted(() => {
      getUserMenus()
    })

    return {
      activeMenu,
      isSidebarCollapsed,
      currentUser,
      userMenus,
      currentComponent,
      handleMenuSelect,
      toggleSidebar,
      logout
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ecf0f1;
}

.top-bar {
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: #333;
}

.top-bar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

.user-info .el-icon {
  margin-right: 8px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
