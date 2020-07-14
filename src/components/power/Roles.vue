<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button size="mini" type="primary" @click="rolesVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="rolesVisible" @close="rolesAddClosed">
        <el-form :model="rolesAddForm" ref="rolesAddRef" :rules="addRolesRules" label-width="70px">
          <el-form-item label="角色名" prop="roleName" required label-width="100px">
            <el-input v-model="rolesAddForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc" required label-width="100px">
            <el-input v-model="rolesAddForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="rolesAdd">确 定</el-button>
        </div>
      </el-dialog>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom',index1===0?'bdtop':'']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 嵌套循环二级三级权限 -->
                <el-row
                  :class="['vcenter',index2===0?'':'bdtop']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRight(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      :class="[index3===0?'':'bdtop']"
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="deleteRight(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
 {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-setting"
              @click="showSetRight(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 修改角色对话框 -->

    <el-dialog title="修改角色" :visible.sync="EditRolesVisible" width="50%" @close="rolesEditClosed()">
      <el-form
        :model="editRolesForm"
        ref="editRolesFormRef"
        :rules="addRolesRules"
        label-width="70px"
      >
        <el-form-item label="角色名" prop="roleName" required label-width="100px">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required label-width="100px">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAdd()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightVisible" width="50%" @close="closeRigiht">
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      rolesVisible: false,
      EditRolesVisible: false,
      //   分配权限
      setRightVisible: false,
      rightsList: {},
      editRolesForm: {
        roleDesc: "",
        roleName: ""
      },
      editRolesFormRef: {},
      rolesAddForm: {
        roleDesc: "",
        roleName: ""
      },
      rolesAddRef: {},
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名", tigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名长度在3-10字符之间",
            tigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", tigger: "blur" }
        ]
      },
      //   树形控件
      treeProps: {
        label: "authName",
        children: "children"
      },
      //   默认选中的id值
      defKeys: [],
      //   即将分配权限的角色
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //   获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      console.log("角色列表", res);
      if (res.meta.status !== 200)
        return this.$message.error("请求角色列表失败");
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    // 角色添加框
    rolesAddClosed() {
      this.$refs.rolesAddRef.resetFields();
    },
    // 角色修改框
    rolesEditClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    rolesAdd() {
      //发送添加用户请求
      this.$refs.rolesAddRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        // 通过预校验 可以发起真正的添加请求
        const { data: res } = await this.$http.post("roles", this.rolesAddForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        // 关闭对话框
        this.rolesVisible = false;
        // 刷新数据
        this.getRolesList();
        // 提示修改成功
        this.$message.success("添加成功！");
        console.log(res);
      });
    },
    // 展示编辑角色对话框
    async showRoles(id) {
      this.EditRolesVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status != 200)
        return this.$message.error("查询角色信息失败");
      this.editRolesForm = res.data;
      console.log(res);
    },
    // 发送编辑角色
    editAdd() {
      this.$refs.editRolesFormRef.validate(async valid => {
        console.log("valid", valid);
        if (!valid) return;
        // 通过预校验 可以发起真正的添加请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleDesc: this.editRolesForm.roleDesc,
            roleName: this.editRolesForm.roleName
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改用户信息失败");
        console.log(res);
        // 关闭对话框
        this.EditRolesVisible = false;
        // 刷新数据
        this.getRolesList();
        // 提示修改成功
        this.$message.success("修改成功！");
      });
    },
    // 删除角色
    async deleteRoles(id) {
      const result = await this.$confirm(
        "此操作将永久删除角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("已经取消删除");
      const { data: res } = await this.$http.delete("roles/" + id);

      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除角色失败！");
      this.$message.success("删除角色成功!");
      // 刷新数据
      this.getRolesList();
    },
    // 根据id删除对应权限
    async deleteRight(data, id) {
      //   弹框提示用户是否 删除
      const result = await this.$confirm(
        "此操作将永久删除权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("已经取消删除");
      const { data: res } = await this.$http.delete(
        "roles/" + data.id + "/rights/" + id
      );

      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除权限失败！");
      this.$message.success("删除权限成功!");
      // 刷新数据
      //   this.getRolesList();
      // 为当前角色重新赋值权限就行，避免全局重新赋值
      data.children = res.data;
    },
    // 展示修改权限弹框
    async showSetRight(data) {
      // 获取所有数据并渲染
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200)
        return this.$message.error("查询权限信息失败");
      this.rightsList = res.data;
      console.log(this.rightsList);
      //   获取三级节点
      this.getLeafKeys(data, this.defKeys);
      this.setRightVisible = true;
      this.roleId = data.id;
    },
    // 递归获取三级权限id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    // 关闭分配权限对话框
    closeRigiht() {
      this.defKeys = [];
      this.setRightVisible = false;
    },
    // 点击为权限分配角色
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      console.log(idStr);
      const { data: res } = await this.$http.post(
        "roles/" + this.roleId + "/rights",
        { rids: idStr }
      );
      if (res.meta.status != 200) return this.$message.error("授权失败");
      this.$message.success("分配权限成功！");
      //   获取三级节点
      this.getRolesList();
      this.setRightVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.el-card {
  margin-top: 20px;
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
.el-table {
  margin-top: 20px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>