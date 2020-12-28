<template>
  <div class="app-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-button @click="handleAdmin" style="float: right;">Admin</el-button>
        <el-col :span="24">
          <h3 class="title" style="">Eyes on Patient</h3>
        </el-col>
      </el-form-item>

      <!-- <div class="title-container">
        <h3 class="title">Real Time Video Test</h3>
      </div> -->

      <!-- <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item> -->

      <el-form-item prop="email" style="margin-top: 100px">
        <el-col :span="10">.</el-col>
        <el-col :span="5" style="margin-top: 150px">
          <el-form-item>
            <el-input
              ref="email"
              v-model="loginForm.email"
              placeholder="Email address field"
              name="email"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item>
            <el-col :span="10">.</el-col>
            <el-col :span="2">
              <el-button :loading="loading" type="primary" style="margin-top: 50px" @click.native.prevent="handleLogin">Login</el-button>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="2">.</el-col>
      </el-form-item>
      <video id="local-view" ref="localview" width="400" height="400" class="local-view" autoplay playsinline controls muted hidden/>
      <video id="remote-view" ref="remoteview" width="400" height="400" class="remote-view" autoplay playsinline controls muted hidden />
      <!-- <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item> -->
      <!-- <el-form-item>
        <el-col :span="7">.</el-col>
        <el-col :span="2">
          <el-button :loading="loading" type="primary" @click.native.prevent="handleStart">Start</el-button>
        </el-col>
      </el-form-item> -->
    </el-form>
  </div>
</template>
<script>
import { validUsername } from '@/utils/validate'
import { startMaster, stopMaster, getStreamStatusValue } from '@/utils/master'
import { SERVER_URL, STREAM_CONFIG_URL, ACCESS_KEY_ID, SECRET_KEY } from '@/config/config'
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
      loginForm: {
        username: 'admin',
        password: '111111',
        email: '',
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }]
      },
      server_url: SERVER_URL,
      stream_config_url: STREAM_CONFIG_URL,
      channelName: 'eriks',
      secret_key: SECRET_KEY,
      access_key_id: ACCESS_KEY_ID,
      loading: false,
      passwordType: 'password',
      redirect: undefined,
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
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/"
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
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          localStorage.setItem("email", this.loginForm.email)
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.loading = true
            axios.get(this.stream_config_url+'/streamConfig').then (response => {
              if (response.status === 200 ) {
                if (response.data.returnData.Result === "OK") {
                  var streamARN = response.data.returnData.streamARN
                  var streamBuf = streamARN.split("/")[1]
                  var kvsName = streamBuf.split("/")[0]

                  var signalChannelARN = response.data.returnData.signalChannelARN
                  var signalBuf = signalChannelARN.split("/")[1]
                  var signalName = signalBuf.split("/")[0]

                  this.channelName = signalName

                  localStorage.setItem("streamName", kvsName)
                  localStorage.setItem("signalChannelName", signalName)
                  localStorage.setItem("streamARN", streamARN)
                  localStorage.setItem("signalChannelARN", signalChannelARN)

                  const localView = document.getElementById('local-view')
                  const remoteView = document.getElementById('remote-view')
                  const formValues = this.getFormValues()
                  startMaster(localView, remoteView, formValues, this.onStatsReport, event => {
                  })

                  localStorage.setItem("cameraStatus", "on")
                  this.createSession()
                } else {
                  alert("API Connection Error!")
                  this.onCancel()
                }
              } else {
                alert(response.data.userMessage)
                this.onCancel()
              }
            })
          }).catch(() => {
          });
        } else {
          return false
        }
      })
    },
    handleAdmin() {
      this.$store.dispatch('user/login', this.loginForm).then(() => {
        this.$router.push({ path: '/admin' }) 
      }).catch(() => {
      });
    },
    createSession() {
      let param = {
        "email" : localStorage.getItem("email"),
        "streamName": localStorage.getItem("streamName"),
        "signalChannelName": localStorage.getItem("signalChannelName"),
        "streamARN": localStorage.getItem("streamARN")
      }
      
      axios.post(this.server_url+'/session', param, {}).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            localStorage.setItem("email", response.data.returnData.email)
            localStorage.setItem("sessionId", response.data.returnData.sessionId)
            localStorage.setItem("streamProcessorName", response.data.returnData.streamProcessorName)
            var self = this
            this.timer = setInterval(function(){ 
              self.checkMessage()
            }, 500);
          } else {
            alert("API Connection Error!")
          }
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
        this.$router.push({ path: '/camera' }) 
      }
    },
    getRandomClientId() {
      return Math.random()
        .toString(36)
        .substring(2)
        .toUpperCase()
    },
    getFormValues() {
      return {
        region: 'us-east-1',
        channelName: this.channelName,
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
    makeJSONData() {
      var noFaceData = [], oneFaceData = [], moreFaceData = []
      var startTime = "1608732788440"

      var result = [ 
        {PK: "1608732795952", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732798955", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732794955", FrameOffsetInSeconds: "0", DetectedFaces: "0"},
        {PK: "1608732799959", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732807947", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732797949", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732805950", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732809953", FrameOffsetInSeconds: "1", DetectedFaces: "0"},
        {PK: "1608732791946", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732801953", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732792956", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732793939", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732789948", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732808951", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732790942", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732800951", FrameOffsetInSeconds: "0", DetectedFaces: "0"},
        {PK: "1608732803952", FrameOffsetInSeconds: "0", DetectedFaces: "0"},
        {PK: "1608732796950", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732806951", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732804942", FrameOffsetInSeconds: "0", DetectedFaces: "1"},
        {PK: "1608732802945", FrameOffsetInSeconds: "0", DetectedFaces: "1"}
      ]

      result.sort((a, b) => (a.PK > b.PK) ? 1 : -1)
      
      var tcout = '', tcin = result[0].PK
      var flag = 1
      var tArray = [], eArray = []
      for (var i = 0; i < result.length; i ++) {
        if(result[i + 1]) {
          if (result[i].DetectedFaces === result[i + 1].DetectedFaces) {

          } else {
            flag++
            tcout = result[i].PK
            eArray.push({'tcin': tcin, 'tcout': tcout, "tclevel": 1})
            if(result[i].DetectedFaces === '0')
              noFaceData.push(eArray) 
            else if(result[i].DetectedFaces === '1')
              oneFaceData.push(eArray)
            else
              moreFaceData.push(eArray)
            eArray = []
            tcin = result[i + 1].PK
            tcout = ''
          } 
        } else {
          if(flag === 1) {
            eArray.push({'tcin': result[0].PK, 'tcout': result[i].PK, "tclevel": 1})
          } else if (flag === 2) {
            eArray.push({'tcin': tcin, 'tcout': result[i].PK, "tclevel": 1})
          } else {
            eArray.push({'tcin': result[i].PK, 'tcout': result[i].PK, "tclevel": 1})
          }
          if(result[i].DetectedFaces === '0')
            noFaceData.push(eArray)
          else if(result[i].DetectedFaces === '1')
            oneFaceData.push(eArray)
          else
            moreFaceData.push(eArray)
        }
      }

      console.log(result)
      console.log(noFaceData)
      console.log(oneFaceData)
      console.log(moreFaceData)
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
    }
  },
  mounted: function () {
    // this.makeJSONData()
  },
  created() {}
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

</style>

