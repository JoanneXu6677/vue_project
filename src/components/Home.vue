<template>
  <div>
    <el-button type="info" @click="logout"></el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    //   退出
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script> 

<style lang="less" scoped>
</style>
