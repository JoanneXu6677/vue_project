<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="danger" class="treetable" size="mini" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
      >
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:green"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
            <el-button
              type="danger"
              icon="el-icon-setting"
              size="mini"
              @click="cateDelete(scope.row.cat_id)"
            >删除</el-button>
          </el-tooltip>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="addCateClosed()">
      <el-form
        :model="addCateForm"
        ref="addCateFormRef"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- options用来指定数据源 -->
          <el-cascader
            v-model=" selectedKeys"
            :options="parentCateList"
            :props="cateprops"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          //   当前这一列使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          //   当前这一列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          //   当前这一列使用的模板名称
          template: "opt"
        }
      ],
      //   添加分类对话框
      addCateVisible: false,
      //   添加分类的表单数据对象
      addCateForm: {
        cat_name: "",
        // 分类的父id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      //   添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", tigger: "blur" }
        ]
      },
      //   父级分类列表
      parentCateList: [],
      //   cateprops指定配置对象
      cateprops: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true
      },
      //   选中父级分类id
      selectedKeys: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res.data);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 显示对话框
    showAddCate() {
      this.addCateVisible = true;
      this.getParentCate();
    },
    // 对话框里得到父级分类
    async getParentCate() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类父级失败");
      }
      console.log(res.data);
      this.parentCateList = res.data;
    },
    // 选择项发送变化
    handleChange() {
      console.log(this.selectedKeys);
      //   判断selectedKeys的length查看是否选择父级
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 发送分类添加请求
    addCate() {
      console.log(this.addCateForm);
      //  1. 先判断数据是否按照格式
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        // 2.再发送请求修改
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("请求添加分类失败");
        }
        // 3.刷新
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateVisible = false;
      });
    },
    // 关闭对话框清空数据
    addCateClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 删除分类
    async cateDelete(id) {
      const result = await this.$confirm(
        "此操作将永久删除分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("已经取消删除");
      const { data: res } = await this.$http.delete("categories/" + id);

      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除分类失败！");
      this.$message.success("删除分类成功!");
      // 刷新数据
      this.getCateList();
    }
  }
};
</script>
<style lang="less" scoped>
.treetable {
  margin: 15px;
}
.el-cascader {
  width: 100%;
}
</style>