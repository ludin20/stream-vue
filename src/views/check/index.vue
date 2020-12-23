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
import { SERVER_URL,  STREAM_CONFIG_URL, SESSION_URL, ACCESS_KEY_ID, SECRET_KEY } from '@/config/config'
import AWS from 'aws-sdk'
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
      endTime: '',
      secret_key: SECRET_KEY,
      access_key_id: ACCESS_KEY_ID,
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
        this.rekognitionStop()
      }
    },
    getData(rekogData) {
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

            this.makeJSONData(rekogData)
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
    makeJSONData(rekogData) {
      console.log(rekogData)
      var data = JSON.parse(rekogData)
      var noFaceData = [], oneFaceData = [], moreFaceData = []
      var rekogData1 = data.sort((a, b) => (a.PK > b.PK) ? 1 : -1)
      
      var tcout = '', tcin = this.msToHMS(parseInt(rekogData1[0].PK) - parseInt(this.startTime))
      var flag = 1
      var tArray = [], eArray = []
      for (var i = 0; i < rekogData1.length; i ++) {
        if(rekogData1[i + 1]) {
          if (rekogData1[i].DetectedFaces === rekogData1[i + 1].DetectedFaces) {

          } else {
            flag++
            tcout = this.msToHMS(parseInt(rekogData1[i].PK) - parseInt(this.startTime))
            eArray.push({'tcin': tcin, 'tcout': tcout, "tclevel": 1})
            if(rekogData1[i].DetectedFaces === '0')
              noFaceData.push(eArray) 
            else if(rekogData1[i].DetectedFaces === '1')
              oneFaceData.push(eArray)
            else
              moreFaceData.push(eArray)
            eArray = []
            tcin = this.msToHMS(parseInt(rekogData1[i + 1].PK) - parseInt(this.startTime))
            tcout = ''
          } 
        } else {
          if(flag === 1) {
            eArray.push({'tcin': this.msToHMS(parseInt(rekogData1[0].PK) - parseInt(this.startTime)), 'tcout': this.msToHMS(parseInt(rekogData1[i].PK) - parseInt(this.startTime)), "tclevel": 1})
          } else if (flag === 2) {
            eArray.push({'tcin': tcin, 'tcout': this.msToHMS(parseInt(rekogData1[i].PK) - parseInt(this.startTime)), "tclevel": 1})
          } else {
            eArray.push({'tcin': this.msToHMS(parseInt(rekogData1[i].PK) - parseInt(this.startTime)), 'tcout': this.msToHMS(parseInt(rekogData1[i].PK) - parseInt(this.startTime)), "tclevel": 1})
          }
          if(rekogData1[i].DetectedFaces === '0')
            noFaceData.push(eArray)
          else if(rekogData1[i].DetectedFaces === '1')
            oneFaceData.push(eArray)
          else
            moreFaceData.push(eArray)
        }
      }

      console.log(noFaceData, "1111111")
      console.log(oneFaceData, "222222")
      console.log(moreFaceData, "333333")
      this.uploadNoFaceJSONData(noFaceData, oneFaceData, moreFaceData)
    },
    uploadNoFaceJSONData(noFaceData, oneFaceData, moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": [
                // {
                //   "tcin": "00:00:01.6800",
                //   "tcout": "00:00:03.3600",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:05.0400",
                //   "tcout": "00:00:06.7200",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:08.4000",
                //   "tcout": "00:00:10.0800",
                //   "tclevel": 1
                // }
              ]
            },
            "type": "segments",
            "tcin": "00:00:00.0000",
            "tcout": "00:00:15.0000",
            "tclevel": 0
          }
        ],
        "id": "noFaceData",
        "type": "segments",
        "algorithm": "demo-video-generator",
        "processor": "Ina Research Department - N. HERVE",
        "processed": 1421141589286,
        "version": 1
      }

      for (var i = 0; i < noFaceData.length; i ++) {
        dict.localisation[0].sublocalisations.localisation.push(noFaceData[i][0])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1";
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      });

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + "noFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadOneFaceJSONData(oneFaceData, moreFaceData)
        }
      });
      
    },
    uploadOneFaceJSONData(oneFaceData, moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": [
                // {
                //   "tcin": "00:00:01.6800",
                //   "tcout": "00:00:03.3600",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:05.0400",
                //   "tcout": "00:00:06.7200",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:08.4000",
                //   "tcout": "00:00:10.0800",
                //   "tclevel": 1
                // }
              ]
            },
            "type": "segments",
            "tcin": "00:00:00.0000",
            "tcout": "00:00:15.0000",
            "tclevel": 0
          }
        ],
        "id": "oneFaceData",
        "type": "segments",
        "algorithm": "demo-video-generator",
        "processor": "Ina Research Department - N. HERVE",
        "processed": 1421141589286,
        "version": 1
      }

      for (var i = 0; i < oneFaceData.length; i ++) {
        dict.localisation[0].sublocalisations.localisation.push(oneFaceData[i][0])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1";
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      });

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + "oneFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadMoreFaceJSONData(moreFaceData)
        }
      });
    },
    uploadMoreFaceJSONData(moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": [
                // {
                //   "tcin": "00:00:01.6800",
                //   "tcout": "00:00:03.3600",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:05.0400",
                //   "tcout": "00:00:06.7200",
                //   "tclevel": 1
                // },
                // {
                //   "tcin": "00:00:08.4000",
                //   "tcout": "00:00:10.0800",
                //   "tclevel": 1
                // }
              ]
            },
            "type": "segments",
            "tcin": "00:00:00.0000",
            "tcout": "00:00:15.0000",
            "tclevel": 0
          }
        ],
        "id": "moreFaceData",
        "type": "segments",
        "algorithm": "demo-video-generator",
        "processor": "Ina Research Department - N. HERVE",
        "processed": 1421141589286,
        "version": 1
      }


      for (var i = 0; i < moreFaceData.length; i ++) {
        dict.localisation[0].sublocalisations.localisation.push(moreFaceData[i][0])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1";
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      });

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + "moreFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadTrialJSONData()
          clearInterval(self.timer)
          initialize()
          self.$router.push({ path: '/finish' })
        }
      });
    },
    uploadTrialJSONData() {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": [
                {
                  "label": "trial!",
                  "tc": "00:00:04.0000",
                  "tclevel": 1
                },
                {
                  "label": "trial!",
                  "tc": "00:00:08.0000",
                  "tclevel": 1
                },
                {
                  "label": "trial!",
                  "tc": "00:00:12.0000",
                  "tclevel": 1
                },
                {
                  "label": "trial!",
                  "tc": "00:00:16.0000",
                  "tclevel": 1
                },
                {
                  "label": "trial!",
                  "tc": "00:00:20.0000",
                  "tclevel": 1
                }
              ]
            },
            "type": "fake",
            "tcin": "00:00:00.0000",
            "tcout": "00:01:00.0000",
            "tclevel": 0
          }
        ],
        "id": "trialData",
        "type": "fake",
        "algorithm": "demo-json-generator",
        "processor": "Ina Research Department - N. HERVE",
        "processed": 1418900533632,
        "version": 1
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1";
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      });

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + "trialData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          clearInterval(self.timer)
          initialize()
          self.$router.push({ path: '/finish' })
        }
      });
    },
    msToHMS( ms ) {
      var seconds = ms / 1000;
      var hours = parseInt( seconds / 3600 ) + ""; // 3,600 seconds in 1 hour
      seconds = seconds % 3600; // seconds remaining after extracting hours
      var minutes = parseInt( seconds / 60 ) + ""; // 60 seconds in 1 minute
      seconds = seconds % 60 + "";

      if (hours.length === 1) 
        hours = "0" + hours

      if (minutes.length === 1)
        minutes = "0" + minutes

      if (seconds.split(".")[0].length === 1)
        seconds = "0" + seconds.split(".")[0] + "." + seconds.split(".")[1]

      return hours+":"+minutes+":"+seconds
    },
    rekognitionStop() {
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName"),
        "StartTimestamp" : this.startTime,
        "EndTimestamp" : this.endTime
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/rekog/stop", param).then (response => {
        if (response.status === 200) {
          // if (response.data.returnData.result === "ok") {
            var rekogData = response.data.returnData
            this.getVideoClip(this.startTime, this.endTime, rekogData)
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
    getVideoClip(startTime, endTime, rekogData) {
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
            this.getData(rekogData)
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

