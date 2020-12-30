<template>
  <div class="app-container">
    <el-form class="login-form" auto-complete="on" label-position="left">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-col :span="24">
          <h3 class="title" style="">Eyes on Patient</h3>
        </el-col>
      </el-form-item>

      <el-form-item prop="email" style="margin-top: 100px">
        <el-col :span="5">.</el-col>
        <el-col :span="5">
          <el-form-item>
            <span class="sub-title">That exam is done, and the results have</span>
          </el-form-item>
          <el-form-item style="text-align: center">
            <span class="sub-title1"> been posted to the server.</span>
          </el-form-item>
          <el-form-item>
            <el-col :span="2">.</el-col>
            <el-col :span="20">
              <el-input
                ref="examid"
                v-model="examid"
                placeholder="Exam ID"
                name="examid"
                type="text"
                tabindex="1"
                auto-complete="on"
                disabled
              />
            </el-col>
          </el-form-item>

          <el-form-item style="margin-top: 80px">
            <span class="sub-title">Press START to begin the exam</span>
          </el-form-item>
          <el-form-item>
            <el-col :span="7">.</el-col>
            <el-col :span="2">
              <el-button :loading="loading" type="primary" style="margin-top: 50px" @click.native.prevent="handleStart">Start</el-button>
            </el-col>
          </el-form-item>
        </el-col>
        
        <el-col :span="2">.</el-col>
        <el-col :span="5">
          <video id="local-view" ref="localview" width="400" height="400" class="local-view" autoplay playsinline controls muted/>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { validUsername } from '@/utils/validate'
import { stopMaster, getStreamStatusValue, getStream } from '@/utils/master'
import { SERVER_URL, SQS_MESSAGE_URL } from '@/config/config'
import axios from 'axios'
import AWS from 'aws-sdk'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (value.length <= 0) {
        callback(new Error('Please enter your email'))
      } else {
        callback()
      }
    }
    return {
      sqs_url: SQS_MESSAGE_URL,
      server_url: SERVER_URL,
      loading: false,
      channelName: 'eriks',
      passwordType: 'password',
      redirect: undefined,
      sqsMessage: false,
      timer: null,
      masterVal: null,
      examid: localStorage.getItem("examId"),
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    async onCancel() {
      if (localStorage.getItem("cameraStatus") === "on")
        stopMaster()
      
      await this.$store.dispatch('user/logout')
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName"),
        "signalChannelName": localStorage.getItem("signalChannelName"),
        "streamARN": localStorage.getItem("streamARN"),
        "signalChannelARN": localStorage.getItem("signalChannelARN"),
        "collectionId": localStorage.getItem("collectionId")
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
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleStart() {
      var param = {
        email: localStorage.getItem("email"),
        sessionId: localStorage.getItem("sessionId"),
        streamName: localStorage.getItem("streamName"),
        signalChannelName: localStorage.getItem("signalChannelName"),
      }
      this.loading = true
      axios.post(this.server_url+'/session/'+localStorage.getItem("sessionId"), param).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            var self = this
            this.timer = setInterval(function(){ 
              self.checkMessage()
            }, 500)
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
    checkMessage() {
      var status = getStreamStatusValue()
      if (status) {
        clearInterval(this.timer)
        this.examCreate()        
      }
    },
    examCreate() {
      var param = {
        "examCreate": "create"
      }
      axios.post(this.server_url+'/session/'+this.sessionId+"/exams", param).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            localStorage.setItem("examId", response.data.returnData.examId)
            this.rekognitionStart()
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
    rekognitionStart() {
      var param = {
        "streamProcessorName": localStorage.getItem("streamProcessorName")
      }

      axios.post(this.server_url+'/session/'+this.sessionId+"/rekog/start", param).then (response => {
        if (response.status === 200) {
          if (response.data.returnData.Result === "OK") {
            this.$router.push({ path: '/check' })  
          } else {
            alert("API Connection Error! Please wait and start exam again.")
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.removeProcess()
        }
      })
      this.loading = false
    },
    onStatsReport(report) {
      // TODO: Publish stats
    },
    toggleDataChannelElements() {
      if (this.getFormValues().openDataChannel) {
        $('.datachannel').removeClass('d-none')
      } else {
        $('.datachannel').addClass('d-none')
      }
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
          self.onCancel()
        }
      })
    }
  },
  mounted: function () {
    const localView = document.getElementById('local-view')
    localView.srcObject = getStream()
  },
  created() {
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

.sub-title {
  font-weight: bold;
  font-size: 20px;
}

.sub-title1 {
  font-weight: bold;
  font-size: 20px;
}
</style>

