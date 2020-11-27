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
          <video id="remote-view" ref="remoteview" width="400" height="400" class="remote-view" autoplay playsinline controls muted hidden />
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { validUsername } from '@/utils/validate'
import { stopMaster, startMaster, getStreamStatusValue } from '@/utils/master'
import { SERVER_URL, STREAM_CONFIG_URL, SECRET_KEY, ACCESS_KEY_ID } from '@/config/config'
import axios from 'axios';

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
      secret_key: SECRET_KEY,
      access_key_id: ACCESS_KEY_ID,
      server_url: SERVER_URL,
      stream_config_url: STREAM_CONFIG_URL,
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
      if (localStorage.getItem("cameraStatus") == "on")
        stopMaster()
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      this.$router.push({ path: '/login' })
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
          const localView = document.getElementById('local-view')
          const remoteView = document.getElementById('remote-view')
          const formValues = this.getFormValues()
          
          startMaster(localView, remoteView, formValues, this.onStatsReport, event => {
          })

          var self = this
          this.timer = setInterval(function(){ 
            self.checkMessage()
          }, 500);
        } else {
          alert(response.data.userMessage)
        }
      })
    },
    checkMessage() {
      var status = getStreamStatusValue()
      if (status) {
        clearInterval(this.timer)
        this.loading = false 
        this.$router.push({ path: '/check' })  
      }
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
    getRandomClientId() {
      return Math.random()
        .toString(36)
        .substring(2)
        .toUpperCase()
    },
    getFormValues() {
      var channelName = localStorage.getItem("signalChannelName")
      return {
        region: 'us-east-1',
        channelName: channelName,
        clientId: this.getRandomClientId(),
        sendVideo: true,
        sendAudio: false,
        openDataChannel: false,
        widescreen: true,
        fullscreen: false,
        useTrickleICE: true,
        natTraversalDisabled: false,
        forceTURN: false,
        accessKeyId: this.access_key_id,
        endpoint: null,
        secretAccessKey: this.secret_key,
        sessionToken: null
      }
    },
  },
  mounted: function () {
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

