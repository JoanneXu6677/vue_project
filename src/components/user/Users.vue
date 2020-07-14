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
            <el-dialog title="添加用户" :visible.sync="dialogVisible" @close="addDialogClosed">
              <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="70px">
                <el-form-item label="用户名" prop="username" required>
                  <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" required>
                  <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email" required>
                  <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile" required>
                  <el-input v-model="addForm.mobile"></el-input>
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
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEdit(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-setting"
                size="mini"
                @click="setRoleFun(scope.row)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id)"
              ></el-button>
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
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="EditDialogVisible" width="50%" @close="editAddClose">
      <el-form :model="editForm" ref="editFormRef" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAdd()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRole" width="50%" @close="setRoleClose">
      <div>
        <p>当前的用户:{{userIn.username}}</p>
        <p>当前的角色:{{userIn.role_name}}</p>
        <p>分配新角色：</p>
        <el-select v-model="selectedId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRole = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo(userIn.id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rules, value, cb) => {
      const regEmail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的邮箱"));
    };
    // 验证手机号规则
    var checkMobile = (rules, value, cb) => {
      const regMobile = /^1[3456789]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的手机号"));
    };
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
      // 添加用户对话框显示隐藏
      dialogVisible: false,
      // 修改用户对话框显示隐藏
      EditDialogVisible: false,
      // 添加用户表单对象
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      editForm: {
        // 查询到的用户信息对象
      },

      // 表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", tigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3-10字符之间",
            tigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", tigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度在6-15字符之间",
            tigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", tigger: "blur" },
          { validator: checkEmail, message: "请输入合法邮箱", trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话", tigger: "blur" },
          {
            validator: checkMobile,
            message: "请输入合法手机号",
            trigger: "blur"
          }
        ]
      },
      // 分配角色对话框
      setRole: false,
      // 插槽得到的用户信息  当展示时使用的数据
      userIn: {},
      // 角色列表
      rolesList: {},
      // 已选中的id
      selectedId: ""
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
    userAdd() {
      //发送添加用户请求
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        // 通过预校验 可以发起真正的添加请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        // 关闭对话框
        this.dialogVisible = false;
        // 刷新数据
        this.getUserInfo();
        // 提示修改成功
        this.$message.success("添加成功！");
        console.log(res);
      });
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 展示编辑用户对话框
    async showEdit(id) {
      this.EditDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200)
        return this.$message.error("查询用户信息失败");
      this.editForm = res.data;
      console.log(res);
    },
    // 修改用户信息
    editAdd() {
      this.$refs.editFormRef.validate(async valid => {
        console.log("valid", valid);
        if (!valid) return;
        // 通过预校验 可以发起真正的添加请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改用户信息失败");
        console.log(res);
        // 关闭对话框
        this.EditDialogVisible = false;
        // 刷新数据
        this.getUserInfo();
        // 提示修改成功
        this.$message.success("修改成功！");
      });
    },
    // 对话框关闭事件
    editAddClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 删除用户
    async deleteUser(id) {
      const result = await this.$confirm(
        "此操作将永久删除用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("已经取消删除");
      const { data: res } = await this.$http.delete("users/" + id);

      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败！");
      this.$message.success("删除用户成功!");
      // 刷新数据
      this.getUserInfo();
    },
    // 展示分配角色对话框
    async setRoleFun(data) {
      //在展示对话框之前获取角色列表
      const { data: res } = await this.$http.get("roles");
      console.log("角色列表", res);
      if (res.meta.status !== 200)
        return this.$message.error("请求角色列表失败");
      this.rolesList = res.data;
      console.log(this.rolesList);
      this.setRole = true;
      // 当展示时使用的数据
      this.userIn = data;
      console.log(this.userIn);
    },
    // 点击按钮，分配角色
    async saveRoleInfo(id) {
      if (!this.selectedId) return this.$message.error("请选择要分配的角色");
      const { data: res } = await this.$http.put("users/" + id + "/role", {
        rid: this.selectedId
      });
      console.log("新响应", res);
      if (res.meta.status !== 200) return this.$message.error("分配角色失败");
      this.getUserInfo();
      this.setRole = false;
    },
    // 分配角色对话框关闭事件
    setRoleClose() {
      this.selectedId = "";
      this.userIn = {};
    }
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