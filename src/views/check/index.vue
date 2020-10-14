<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-col :span="24">
          <h3 class="title">Focus On The Picture You Prefer</h3>
        </el-col>
      </el-form-item>
        
      <el-form-item>
        <el-col :span="11">
          <transition name="fade">
            <img :src="mainImageSrcLeft" class="leftimage" v-on:load="onLoaded" v-show="mainImageSrcLeft != '' && isLoaded">
          </transition>
          <video poster="../../assets/loading.gif" class="leftvideo" v-if="mainImageSrcLeft==''"></video>
        </el-col>
        <el-col :span="2" class="line">.</el-col>
        <el-col :span="11">
          <video poster="../../assets/loading.gif" class="rightvideo" v-show="mainImageSrcRight==''"></video>
          <transition name="fade">
            <img :src="mainImageSrcRight" class="rightimage"  v-on:load="onLoaded" v-show="mainImageSrcRight != '' && isLoaded">
          </transition>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
  
</template>

<script>
import axios from 'axios'
import { stopMaster } from '@/utils/master'
import { SERVER_URL } from '@/config/config'
export default {
  data() {
    return {
      sessionId: localStorage.getItem("sessionId"),
      server_url: SERVER_URL,
      form: {},
      mainImageSrcLeft: '',
      mainImageSrcRight: '',
      tempmainImageSrcLeft: '',
      tempmainImageSrcRight: '',
      idx: 0,
      timerLeft: null,
      timerRight: null,
      examStart: 0,
      examEnd: 0,
      times: [],
      trials: [],
      trial: {},
      isLoaded: false,
    }
  },
  methods: {
    async onCancel() {
      stopMaster()
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      this.$router.push({ path: '/login' })
    },
    getLeftImages() {
      this.times.push(Date.now())
      axios.get('https://picsum.photos/400').then (response => {
        this.tempmainImageSrcLeft = response.request.responseURL
      })
    },
    getRightImages() {
      this.isLoaded = false;
      axios.get('https://picsum.photos/400').then (response => {
        this.tempmainImageSrcRight = response.request.responseURL

        this.mainImageSrcRight = this.tempmainImageSrcRight
        this.mainImageSrcLeft = this.tempmainImageSrcLeft
      })
    },
    onLoaded() {
      this.isLoaded = true;
    },
    getCurrentTimeStamp() {
      this.idx ++;
      if (this.idx == 6) {
        this.examEnd = Date.now()
        clearInterval(this.timerLeft)
        clearInterval(this.timerRight)
        this.getData();
      }
    },
    getData() {
      var i = 0;
      for (i = 0; i < this.times.length - 1; i ++) {
        this.trial.trialStart = this.times[i]
        this.trial.trialEnd = this.times[i + 1]
        this.trials.push(this.trial)
        this.trial = {}
      }
      let param = {
        "sessionId" : localStorage.getItem("sessionId"),
        "timingData" : {
          "examStart" : this.examStart,
          "examEnd" : this.examEnd,
          "trials" : this.trials
        }
      }

      axios.put(this.server_url+'/session/'+this.sessionId, param).then (response => {
        if (response.status === 200 ) {
          this.$router.push({ path: '/finish' })
        } else {
          alert(response.data.userMessage)
        }
      });
    }
  },
  mounted: function () {
    
  },
  created() {
    let self = this;
    this.examStart = Date.now()
    let trial = localStorage.getItem("trial")
    self.timerLeft = setInterval(function(){ 
      self.getLeftImages()
      self.getCurrentTimeStamp()
    }, trial * 1000);

    self.timerRight = setInterval(function(){ 
      self.getRightImages()
    }, trial * 1000);
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
  font-size: 26px;
}

.leftimage {
  width: 300px; 
  height: 300px; 
  float: right;
}

.rightimage {
  width: 300px; 
  height: 300px; 
  float: left;
}

.leftvideo {
  width: 50px; 
  height: 50px; 
  margin-top: 125px; 
  margin-right: 125px; 
  float: right;
}

.rightvideo {
  width: 50px; 
  height: 50px; 
  margin-top: 125px; 
  margin-left: 125px; 
  float: left;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
    opacity: 0;
}
</style>

