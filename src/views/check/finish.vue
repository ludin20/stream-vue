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
        <el-col :span="24">
          <h5 class="title2">Below is your exam result link:</h5>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="8">.</el-col>
          <el-col :span="9">
            <el-input
              ref="examUrl"
              name="examUrl"
              type="text"
              placeholder="ExamUrl"
              tabindex="1"
              auto-complete="on"
              v-model="form.examUrl"
            />
          </el-col>
        <el-col :span="10">.</el-col>
      </el-form-item>
        
      <el-form-item>
        <el-col :span="24" style="text-align: center;">
          <el-button :loading="loading" @click="onCancel">BACK TO START</el-button> 
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { stopMaster } from '@/utils/master'
import { SERVER_URL } from '@/config/config'
import axios from 'axios';
export default {
  data() {
    return {
      loading: false,
      form: {
        sessionId: localStorage.getItem("sessionId"),
        examUrl: localStorage.getItem("examUrl")
      }
    }
  },
  methods: {
    async onCancel() {
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      this.$router.push({ path: '/login'})
    }
  },

  created() {
    stopMaster()
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

