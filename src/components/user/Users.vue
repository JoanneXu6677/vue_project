<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <div class="grid-content bg-purple">
            <div style="margin-top: 15px;">
              <!-- 搜索功能，先双向绑定，再按钮请求 -->
              <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="requery">
                <el-button slot="append" icon="el-icon-search" @click="getUserInfo()"></el-button>
              </el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button class="userAdd" type="primary" @click="dialogVisible=true">添加用户</el-button>
            <!-- 添加用户对话框 -->
            <el-dialog title="添加用户" :visible.sync="dialogVisible">
              <el-form>
                <el-form-item label="用户名称">
                  <el-input></el-input>
                </el-form-item>
              </el-form>
              <!-- 对话框底部 -->
              <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="userAdd">确 定</el-button>
              </div>
            </el-dialog>
          </div>
        </el-col>
      </el-row>
      <!-- 表格部分 -->
      <el-table :data="userInfo" style="width:100%" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              active-color="#dc143c"
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userInfo: [],
      total: 0,
      dialogVisible: false
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
      const { data: result } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (result.meta.status !== 200) return this.$message.error("获取失败");
      console.log(result);
      this.userInfo = result.data.users;
      this.total = result.data.total;
    },
    //监听pageSize改变
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserInfo();
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserInfo();
    },
    //监听swich状态变化
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
    },
    //清空搜索框后重新查询
    requery() {
      this.getUserInfo();
    },
    //添加用户
    userAdd() {}
  }
};
</script>
<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.userAdd {
  margin-top: 15px;
}
.el-table {
  margin: 15px;
}
.el-button--primary {
  color: #fff;
  background-color: #dc143c;
  border-color: #dc143c;
}
.el-button--primary:hover {
  color: #fff;
  background-color: #d13756;
  border-color: #dc143c;
}
</style>
<style >
.el-pager li.active {
  color: #dc143c !important;
  cursor: default;
}
.el-pager li:hover {
  color: #dc143c !important;
  cursor: default;
}
</style>>