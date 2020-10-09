<template>
  <div class="app-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-col :span="24">
          <h3 class="title" style="">Real Time Video Test</h3>
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
        <el-col :span="5">.</el-col>
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
              <el-button :loading="loading" type="primary" style="margin-top: 50px" @click.native.prevent="handleStart">Start</el-button>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="2">.</el-col>
        <el-col :span="5">
          <video id="local-view" ref="localview" width="400" height="400" class="local-view" autoplay playsinline controls muted hidden/>
          <video id="remove-view" ref="remoteview" width="400" height="400" class="remote-view" autoplay playsinline controls muted/>
        </el-col>
      </el-form-item>

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
import { startMaster } from '@/utils/master'
import { startViewer } from '@/utils/viewer'
import { SERVER_URL } from '@/config/config'
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
      server_url: SERVER_URL,
      loginForm: {
        username: 'admin',
        password: '111111',
        email: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
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
    handleStart() {

      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            axios.post(this.server_url+'/session', {"email": this.loginForm.email}, {}).then (response => {
              if (response.status === 200 ) {
                localStorage.setItem("email", response.data.returnData.email)
                localStorage.setItem("sessionId", response.data.returnData.sessionId)
                this.$router.push({ path: '/check' })
              } else {
                alert(response.data.userMessage)
              }
            })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
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
      return {
        region: 'us-east-1',
        channelName: 'eriks',
        clientId: this.getRandomClientId(),
        sendVideo: true,
        sendAudio: false,
        openDataChannel: false,
        widescreen: true,
        fullscreen: false,
        useTrickleICE: true,
        natTraversalDisabled: false,
        forceTURN: false,
        accessKeyId: 'AKIAY6TQDS7NUDMVKY4L',
        endpoint: null,
        secretAccessKey: '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',
        sessionToken: null
      }
    },
    getPermissionCamera() {
      const localView = document.getElementById('local-view')
      const remoteView = document.getElementById('remote-view')
      const formValues = this.getFormValues()
      // startMaster(localView, remoteView, formValues, this.onStatsReport, event => {
      // })

      startViewer(localView, remoteView, formValues, this.onStatsReport, event => {
      })
    }
  },
  mounted: function () {
    this.getPermissionCamera()
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

</style>

