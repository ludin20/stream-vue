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
import { startMaster, getStreamStatusValue } from '@/utils/master'
import { SERVER_URL, STREAM_CONFIG_URL, ACCESS_KEY_ID, SECRET_KEY } from '@/config/config'
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

                const localView = document.getElementById('local-view')
                const remoteView = document.getElementById('remote-view')
                const formValues = this.getFormValues()
                startMaster(localView, remoteView, formValues, this.onStatsReport, event => {
                })

                localStorage.setItem("cameraStatus", "on");
                this.createSession()
              } else {
                alert(response.data.userMessage)
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
      }
      
      axios.post(this.server_url+'/session', param, {}).then (response => {
        if (response.status === 200 ) {
          localStorage.setItem("email", response.data.returnData.email)
          localStorage.setItem("sessionId", response.data.returnData.sessionId)

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
  },
  mounted: function () {
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

