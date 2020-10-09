<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-col :span="24">
          <h1 class="title">Thank you!</h1>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="24">
          <h5 class="title1">That exam is done, and the results have been posted to the server</h5>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="24">
          <h5 class="title2">This is your session ID:</h5>
        </el-col>
        
      </el-form-item>
      <el-form-item>
        <el-col :span="10">.</el-col>
          <el-col :span="4">
            <el-input
              ref="sessionid"
              name="sessionid"
              type="text"
              placeholder="Session ID"
              tabindex="1"
              auto-complete="on"
              v-model="form.sessionId"
              disabled
            />
          </el-col>
        <el-col :span="10">.</el-col>
      </el-form-item>
        
      <el-form-item>
        <el-col :span="24" style="text-align: center;">
          <el-button @click="onCancel">BACK TO START</el-button> 
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        sessionId: localStorage.getItem("sessionId")
      }
    }
  },
  methods: {
    async onCancel() {
      await this.$store.dispatch('user/logout');
      this.$router.push({ path: '/login'});
    }
  }
}
</script>

<style scoped>
.logo {
  width: 50px; 
  height:50px;
}

.title {
  text-align: center; 
  margin-top: 100px; 
  font-size: 45px;
}

.title1 {
  text-align: center; 
  margin-top: 60px; 
  font-size: 20px;
}

.title2 {
  text-align: center; 
  margin-top: 60px; 
  font-size: 20px;
}
</style>

