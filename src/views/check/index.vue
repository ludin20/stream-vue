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
      
      <el-form-item v-if="!resultSaving">
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

      <el-form-item class="result-video">
        <el-col :span="24">
          <transition name="fade">
            <video poster="../../assets/loading.gif" style="text-align: center;" v-if="resultSaving">
            </video>
          </transition>
        </el-col>
      </el-form-item>

      <el-form-item class="result-text">
        <el-col :span="24">
          <span v-if="resultSaving">Saving results...</span>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import { sendExamStartSignal, sendExamSecondSignal, sendExamThirdSignal, sendExamFourthSignal, sendExamFinishSignal, getTimeRange, sendExamFifthSignal, getStreamEndStatusValue, getStreamTimes, initialize, stopMaster } from '@/utils/master'
import { SERVER_URL,  STREAM_CONFIG_URL, SESSION_URL} from '@/config/config'
export default {
  data() {
    return {
      sessionId: localStorage.getItem("sessionId"),
      server_url: SERVER_URL,
      stream_config_url: STREAM_CONFIG_URL,
      session_url: SESSION_URL,
      form: {},
      mainImageSrcLeft: '',
      mainImageSrcRight: '',
      tempmainImageSrcLeft: '',
      tempmainImageSrcRight: '',
      idx: 0,
      timerLeft: null,
      timerRight: null,
      timer: null,
      times: [],
      trials: [],
      trial: {},
      isLoaded: false,
      resultSaving: false,
      startTime: '',
      endTime: ''
    }
  },
  methods: {
    async onCancel() {
      stopMaster()
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/"
    },
    
    getLeftImages() {
      axios.get('https://picsum.photos/400').then (response => {
        this.tempmainImageSrcLeft = response.request.responseURL
      })
    },
    getRightImages() {
      this.idx ++;
      this.isLoaded = false;
      axios.get('https://picsum.photos/400').then (response => {
        this.tempmainImageSrcRight = response.request.responseURL

        this.mainImageSrcRight = this.tempmainImageSrcRight
        this.mainImageSrcLeft = this.tempmainImageSrcLeft

        if (this.idx == 1) {
          sendExamStartSignal()
        } else if (this.idx == 2) {
          sendExamSecondSignal()
        } else if (this.idx == 3) {
          sendExamThirdSignal()
        } else if (this.idx == 4) {
          sendExamFourthSignal()
        } else if (this.idx == 5) {
          sendExamFifthSignal()
        } else if (this.idx == 6) {
          sendExamFinishSignal()

          clearInterval(this.timerLeft)
          clearInterval(this.timerRight)
          this.examFinish();
        }
      })
    },
    onLoaded() {
      this.isLoaded = true;
    },
    examFinish() {
      this.resultSaving = true;
      var self = this
      this.timer = setInterval(function(){ 
        self.checkMessage()
      }, 500);
    },
    checkMessage() {  
      var result = getStreamEndStatusValue()
      if (result) {
        clearInterval(this.timer)
        var result = getTimeRange()
        this.startTime = result.startTime
        this.endTime = result.endTime
        this.readData()
      }
    },
    getData() {
      var result = getStreamTimes()
      this.times = result
      for (var i = 0; i < this.times.length - 1; i ++) {
        this.trial.trialStart = this.times[i]
        this.trial.trialEnd = this.times[i + 1]
        this.trials.push(this.trial)
        this.trial = {}
      }
      let param = {
        "sessionId" : localStorage.getItem("sessionId"),
        "s3_url": localStorage.getItem("examUrl"),
        "email": localStorage.getItem("email"),
        "timingData" : {
          "examStart" : result[0],
          "examEnd" : result[5],
          "trials" : this.trials
        }
      }
      axios.put(this.server_url+'/session/'+this.sessionId+"/exams/"+localStorage.getItem("examId"), param).then (response => {
        if (response.status === 200 ) {
          // if (response.data.returnData.result === "ok") {
            clearInterval(this.timer)
            initialize()
            this.$router.push({ path: '/finish' })
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      });
    },
    readData() {
      axios.get(this.server_url+'/session/'+this.sessionId+"/rekog/start").then (response => {
        if (response.status === 200) {
          // if (reponse.data.returnData.result === "ok") {
          this.rekognitionStop()
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      })
    },
    rekognitionStop() {
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName")
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/rekog/stop", param).then (response => {
        if (response.status === 200) {
          // if (response.data.returnData.result === "ok") {
            this.getVideoClip(this.startTime, this.endTime)
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      })
    },
    getVideoClip(startTime, endTime) {
      let param = {
        "streamName": localStorage.getItem("streamName"),
        "streamARN": localStorage.getItem("streamARN"),
        "sessionId": localStorage.getItem("sessionId"),
        "examId": localStorage.getItem("examId"),
        "StartTimestamp" : startTime,
        "email": localStorage.getItem("email"),
        "EndTimestamp" : endTime
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/exams/"+localStorage.getItem("examId"), param).then (response => {
        if (response.status === 200 ) {
          // if (response.data.returnData.result === "ok") {
            localStorage.setItem("examUrl", response.data.returnData.s3_url)
            this.getData()
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      });
    },
    examStart() {
      var param = {
        "examCreate": "create"
      }
      axios.post(this.server_url+'/session/'+this.sessionId+"/exams", param).then (response => {
        if (response.status === 200 ) {
          // if (response.data.returnData.result === "ok") {
            localStorage.setItem("examId", response.data.returnData.examId)
            this.rekognitionStart()
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      })
    },
    rekognitionStart() {
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName")
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/rekog/start", param).then (response => {
        if (response.status === 200) {
          // if (response.data.returnData.result === "ok") {
            let self = this;
            self.timerLeft = setInterval(function(){ 
              self.getLeftImages()
            }, 4.5 * 1000);

            self.timerRight = setInterval(function(){ 
              self.getRightImages()
            }, 4.5 * 1000);
          // } else {
          //   alert("API Connection Error!")
          //   this.onCancel()
          // }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
        }
      })
    }
  },
  
  mounted: function () {
  },
  created() {
    this.examStart()
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

.result-video {
  text-align: center;
}

.result-text {
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
    opacity: 0;
}
</style>

