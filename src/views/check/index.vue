<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item>
        <img src="../../assets/Logo.png" style="width: 50px; height:50px;">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-col :span="24">
          <h3 class="title" style="text-align: center; margin-top: 100px; font-size: 26px">Focus On The Picture You Prefer</h3>
        </el-col>
      </el-form-item>
        
      <el-form-item>
        <el-col :span="11">
          <img :src="mainImageSrcLeft" style="width: 300px; height: 300px; float: right">
        </el-col>
        <el-col :span="2" class="line">.</el-col>
        <el-col :span="11">
          <img :src="mainImageSrcRight" style="width: 300px; height: 300px; float: left">
        </el-col>
      </el-form-item>
    </el-form>
  </div>
  
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      form: {},
      timestamp: 0,
      mainImageSrcLeft: '',
      mainImageSrcRight: '',
      idx: 0,
      timerLeft: null,
      timerRight: null
    }
  },
  methods: {
    async onCancel() {
      await this.$store.dispatch('user/logout');
      this.$router.push({ path: '/login' });
    },
    getCurrentTimeStamp() {
      this.timestamp = Date.now();
      this.idx ++;
      if (this.idx == 6) {
        clearInterval(this.timerLeft);
        clearInterval(this.timerRight);
        this.$router.push({ path: '/finish' });
      }
    },
    getLeftImages() {
      axios.get('https://picsum.photos/400').then (
        response => (
            this.mainImageSrcLeft = response.request.responseURL
          )
        )
    },
    getRightImages() {
      axios.get('https://picsum.photos/400').then (
        response => (
            this.mainImageSrcRight = response.request.responseURL
          )
        )
    }
  },
  mounted: function () {
    let self = this;

    self.timerLeft = setInterval(function(){ 
      self.getCurrentTimeStamp();
      self.getLeftImages();
    }, 4000);

    self.timerRight = setInterval(function(){ 
      self.getRightImages();
    }, 4000);
  },
  created() {
    // let self = this;

    // self.timer1 = setInterval(function(){ 
    //   self.getCurrentTimeStamp();
    //   self.getLeftImages();
    // }, 4000);

    // self.timer2 = setInterval(function(){ 
    //   self.getRightImages();
    // }, 4000);
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

