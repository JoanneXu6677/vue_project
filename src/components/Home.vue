<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header class="home_header">
      <div>Leave管理系统</div>
      <el-button size="mini" type="danger" @click="logout">退出</el-button>
    </el-header>
    <!-- 主题部分 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <el-menu
          background-color="#F9F9F9"
          text-color="#A9A9A9"
          active-text-color="#DC143C"
          unique-opened
          router
          :default-active="activePath"
        >
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span class="span_left">{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/'+twoItem.path+''"
              v-for="twoItem in item.children"
              :key="twoItem.id"
              @click="saveNavState('/'+twoItem.path+'')"
            >
              <i class="el-icon-menu"></i>
              <span>{{twoItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
          <!-- 二级菜单 -->
        </el-menu>
      </el-aside>
      <!-- 右边主题部分 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      activePath: "",
      iconObj: {
        "125": "el-icon-user-solid",
        "103": "el-icon-s-help",
        "101": "el-icon-s-goods",
        "102": "el-icon-tickets",
        "145": "el-icon-data-line"
      }
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    //   退出
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      // 获取菜单
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    // 保存激活状态（高亮）
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
};
</script> 

<style lang="less" scoped>
.el-header {
  background: #f9f9f9;
}
.el-aside {
  background: #f9f9f9;
  .el-menu {
    border-right: none;
  }
}
.home_container {
  height: 100%;
}
.home_header {
  display: flex;
  justify-content: space-between;
  box-shadow: 2px 5px 5px #eeeeee;
  div {
    color: #dc143c;
    font-size: 20px;
    font-weight: bolder;
    line-height: 60px;
  }
}
.span_left {
  margin-left: 10px;
}
.el-button {
}
</style>
