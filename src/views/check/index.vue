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
import { sendExamSignal, stopMaster } from '@/utils/master'
import { SERVER_URL,  ACCESS_KEY_ID, SECRET_KEY } from '@/config/config'
import AWS from 'aws-sdk'
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
      imageTimer: null,
      isLoaded: false,
      resultSaving: false,
      secret_key: SECRET_KEY,
      access_key_id: ACCESS_KEY_ID,
      startTime: '',
      endTime: '',
      trial: {},
      trials: []
    }
  },
  methods: {
    async onCancel() {
      stopMaster()
      await this.$store.dispatch('user/logout')
      
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName"),
        "signalChannelName": localStorage.getItem("signalChannelName"),
        "streamARN": localStorage.getItem("streamARN"),
        "signalChannelARN": localStorage.getItem("signalChannelARN"),
        "collectionId": localStorage.getItem("collectionId"),
        "datastreamARN": localStorage.getItem("datastreamARN")
      }

      axios.post(this.server_url+'/session/'+localStorage.getItem("sessionId")+"/rekog", param).then (response => {
        if (response.status === 200) {
          if (response.data.returnData.Result === "OK") {
            localStorage.clear()
            window.location.href = "/"
          } else {
            alert("API Connection Error! Please wait and start exam again.")
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.removeProcess()
        }
      })
    },
    goDashboard() {
      localStorage.clear()
      window.location.href = "/"
    },
    onLoaded() {
      this.isLoaded = true
    },
    onEndMessage(data) {
      // this.examFinish(data.examTimes)
      this.resultSaving = true
      this.rekognitionStop(data.examTimes)
    },
    examFinish(examTimes) {
      console.log(examTimes)
    },
    shuffleImage() {
      console.log("bbb=+++++++ ");
      if (this.idx == 5 ){
        clearInterval(this.imageTimer)
      }
      sendExamSignal(this.idx , (this.idx == 5) , this.onEndMessage)
      this.idx ++

      if (this.idx != 6 ){
        var self = this;
        axios.get('https://picsum.photos/400').then (response => {
          console.log("loadedLeft ");
          self.mainImageSrcLeft = response.request.responseURL
        })
        axios.get('https://picsum.photos/400').then (response => {
          console.log("loadedRight ");
          self.mainImageSrcRight = response.request.responseURL
        })

        this.isLoaded = false
      }
    },
    rekognitionStop(examTimes) {
      this.startTime = parseInt(examTimes[0]/1000)*1000 + 1000
      this.endTime = parseInt(examTimes[5]/1000)*1000 + 1000
      console.log(this.startTime, this.endTime, "+++++++++++++++++++")
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName"),
        "StartTimestamp" : this.startTime,
        "EndTimestamp" : this.endTime,
        "sessionId": localStorage.getItem("sessionId"),
        "examId": localStorage.getItem("examId"),
        "streamName": localStorage.getItem("streamName"),
        "signalChannelName": localStorage.getItem("signalChannelName"),
        "streamARN": localStorage.getItem("streamARN"),
        "signalChannelARN": localStorage.getItem("signalChannelARN"),
        "datastreamARN": localStorage.getItem("datastreamARN")
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/rekog/stop", param).then (response => {
        if (response.status === 200) {
          if (response.data.returnData.Result === "OK") {
            var rekogData = response.data.returnData.final_data
            this.getVideoClip(this.startTime, this.endTime, rekogData, examTimes)
          } else {
            alert("API Connection Error! Please wait and start exam again.")
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.removeProcess()
        }
      })
    },
    getVideoClip(startTime, endTime, rekogData, examTimes) {
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
          if (response.data.returnData.Result === "OK") {
            localStorage.setItem("examUrl", response.data.returnData.s3_url)
            this.getData(rekogData, examTimes)
          } else {
            alert("API Connection Error! Please wait and start exam again.")
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.removeProcess()
        }
      })
    },
    getData(rekogData, examTimes) {
      for (var i = 0; i < examTimes.length - 1; i ++) {
        this.trial.trialStart = examTimes[i]
        this.trial.trialEnd = examTimes[i + 1]
        this.trials.push(this.trial)
        this.trial = {}
      }
      let param = {
        "sessionId" : localStorage.getItem("sessionId"),
        "s3_url": localStorage.getItem("examUrl"),
        "email": localStorage.getItem("email"),
        "timingData" : {
          "examStart" : parseInt(examTimes[0]/1000)*1000 + 1000,
          "examEnd" : parseInt(examTimes[5]/1000)*1000 + 1000,
          "trials" : this.trials
        }
      }
      axios.put(this.server_url+'/session/'+this.sessionId+"/exams/"+localStorage.getItem("examId"), param).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            this.makeJSONData(rekogData)
          } else {
            alert("API Connection Error! Please wait and start exam again.")
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.removeProcess()
        }
      })
    },
    makeJSONData(rekogData) {
      // var data = JSON.parse(rekogData)
      var data = rekogData
      var noFaceData = [], oneFaceData = [], moreFaceData = []
      
      for (var i = 0; i < data.length; i ++) {
        if (data[i].DetectedFaceCount === "0") {
          noFaceData.push({'tcin': this.msToHMS(data[i].SegmentStartOffsetSeconds), 'tcout': this.msToHMS(data[i].SegmentEndOffsetSeconds), 'tclevel': 1})
        } else if (data[i].DetectedFaceCount === "1") {
          oneFaceData.push({'tcin': this.msToHMS(data[i].SegmentStartOffsetSeconds), 'tcout': this.msToHMS(data[i].SegmentEndOffsetSeconds), 'tclevel': 1})
        } else {
          moreFaceData.push({'tcin': this.msToHMS(data[i].SegmentStartOffsetSeconds), 'tcout': this.msToHMS(data[i].SegmentEndOffsetSeconds), 'tclevel': 1})
        }
      }

      this.uploadNoFaceJSONData(noFaceData, oneFaceData, moreFaceData)
    },
    uploadNoFaceJSONData(noFaceData, oneFaceData, moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": []
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
        dict.localisation[0].sublocalisations.localisation.push(noFaceData[i])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1"
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      })

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + localStorage.getItem("examId") + "noFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadOneFaceJSONData(oneFaceData, moreFaceData)
        }
      })
    },
    uploadOneFaceJSONData(oneFaceData, moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": []
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
        dict.localisation[0].sublocalisations.localisation.push(oneFaceData[i])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1"
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      })

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + localStorage.getItem("examId") + "oneFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadMoreFaceJSONData(moreFaceData)
        }
      })
    },
    uploadMoreFaceJSONData(moreFaceData) {
      var dict = {
        "localisation": [
          {
            "sublocalisations": {
              "localisation": []
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
        dict.localisation[0].sublocalisations.localisation.push(moreFaceData[i])
      }

      var jsonFileContent = JSON.stringify(dict)
      var bufferObject = new Buffer.from(JSON.stringify(jsonFileContent))
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1"
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      })

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + localStorage.getItem("examId") + "moreFaceData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          self.uploadTrialJSONData()
          clearInterval(self.timer)
          self.$router.push({ path: '/finish' })
        }
      })
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
      AWS.config.region = "us-east-1"
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "eyesdemo"}
      })

      var self = this
      s3.upload({
        Key: "examclips/" + localStorage.getItem("email") + "/" + localStorage.getItem("sessionId") + "/" + localStorage.getItem("examId") + "trialData.json",
        Body: jsonFileContent,
        ACL: 'public-read'
        }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          clearInterval(self.timer)
          self.$router.push({ path: '/finish' })
        }
      })
    },
    msToHMS( ms ) {
      var str = ''
      if (ms === 0) {
        str = "00:00:00"
      } else {
        var seconds = ms / 1000
        var hours = parseInt( seconds / 3600 ) + ""
        seconds = seconds % 3600
        var minutes = parseInt( seconds / 60 ) + ""
        seconds = seconds % 60 + ""

        if (hours.length === 1) 
          hours = "0" + hours

        if (minutes.length === 1)
          minutes = "0" + minutes

        if (seconds.split(".")[0].length === 1)
          seconds = "0" + seconds.split(".")[0] + "." + seconds.split(".")[1]

        str = hours+":"+minutes+":"+seconds
      }

      return str
    },
    removeProcess() {
      let param = {}

      axios.post(this.server_url+'/deleteFailed', param, {}).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            this.removeSQSMessages()
          } else {
            console.log("Failed")
          }
        } else {
          console.log("Failed")
        }
      })
    },
    removeSQSMessages() {
      AWS.config = new AWS.Config()
      AWS.config.accessKeyId = this.access_key_id
      AWS.config.secretAccessKey = this.secret_key
      AWS.config.region = "us-east-1"

      // Create an SQS service object
      var sqs = new AWS.SQS({apiVersion: '2012-11-05'})
      var queueURL = this.sqs_url

      var params = {
        AttributeNames: [
            "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
      }

      var self = this
      sqs.receiveMessage(params, function(err, data) {
        if (err) {
          console.log("Receive Error", err)
        } else if (data.Messages) {
          for (var i = 0; i < data.Messages.length; i ++) {
            var deleteParams = {
              QueueUrl: queueURL,
              ReceiptHandle: data.Messages[i].ReceiptHandle
            }
            sqs.deleteMessage(deleteParams, function(err, data) {
              if (err) {
                console.log("Delete Error", err)
              } else {
                console.log("Message Deleted", data)
              }
            })
          }
          self.goDashboard()
        }
      })
    }
  },
  
  mounted: function () {
  },
  created()  {
    var self = this
    this.shuffleImage()
    this.imageTimer = setInterval(function(){ 
      self.shuffleImage()
    }, 4000)
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

