<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录 -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user-solid"
            placeholder="请输入用户名"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            show-password
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button type="success" @click="login">登录</el-button>
          <el-button @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      //表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    //重置按钮
    resetLoginForm() {
      //   console.log(this);
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      //表单预验证
      this.$refs.loginFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        console.log(this.loginForm);
        const { data: result } = await this.$http.post("login", this.loginForm);
        console.log(result);
        if (result.meta.status !== 200) {
          this.$message.error("用户或者密码错了哦");
        } else {
          this.$message({
            message: "登录成功",
            type: "success"
          });
          window.sessionStorage.setItem("token", result.data.token);
          this.$router.push("/home");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.login_container {
  background: rgb(112, 199, 151);
  background-image: linear-gradient(
    to right,
    rgba(112, 199, 151, 0.5),
    skyblue
  );
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #ddd;
  .avatar_box {
    height: 130px;
    width: 130px;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btn {
  display: flex;
  justify-content: space-around;
  width: 100%;
}
.login_form {
  position: absolute;
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
  top: 20%;
}
</style>