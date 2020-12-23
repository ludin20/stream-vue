<template>
  <div class="app-container">
    <el-form class="login-form" auto-complete="on" label-position="left">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-col :span="24">
          <h3 class="title" style="">Exam</h3>
        </el-col>
      </el-form-item>

      <el-form-item>
        <el-col :span="4">.</el-col>
        <el-col :span="6">
          <el-form-item label="Session">
            <el-input v-model="form.sessionId" disabled/>
          </el-form-item>

          <el-form-item label="Exam">
            <el-input v-model="form.examId" disabled/>
          </el-form-item>

          <el-form-item label="Trials">
            <el-input v-model="form.trial" type="textarea" rows="26" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="4">.</el-col>
        <el-col :span="10">
          <div id="myplayer-timeline-container">
            <div style="height: 350px;">
              <div id="myplayer-timeline"></div>
            </div>
            <div id="myplayer-timeline-timeline" style="height: 265px;"></div>
            <div style="clear: both;"></div>
          </div>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { } from '@/utils/validate'
import { } from '@/utils/master'
import { SERVER_URL } from '@/config/config'
import axios from 'axios'

export default {
  data() {
    return {
      server_url: SERVER_URL,
      player: null,
      form: {
        sessionId: '',
        examId: '',
        s3_url: '',
        trial: '',
        sessionEmail: ''
      }
    }
  },
  watch: {
  },
  methods: {
    async onCancel() {
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/"
    }
  },
  mounted: function () {
    document.getElementsByClassName("el-form-item__content")[1].style.lineHeight = "unset"

    $("#myplayer-timeline").mediaPlayer({
      autoplay: false,
      src: this.form.s3_url,
      plugins: {
        dataServices: [
          'https://eyesdemo.s3.amazonaws.com/' + 'examclips/' + this.form.sessionEmail + '/' + this.form.sessionId + '/' + 'trialData.json',
          'https://eyesdemo.s3.amazonaws.com/' + 'examclips/' + this.form.sessionEmail + '/' + this.form.sessionId + '/' + 'noFaceData.json',
          'https://eyesdemo.s3.amazonaws.com/' + 'examclips/' + this.form.sessionEmail + '/' + this.form.sessionId + '/' + 'oneFaceData.json',
          'https://eyesdemo.s3.amazonaws.com/' + 'examclips/' + this.form.sessionEmail + '/' + this.form.sessionId + '/' + 'moreFaceData.json',
        ],
        list: [{
          'className': 'fr.ina.amalia.player.plugins.TimelinePlugin',
          'container': '#myplayer-timeline-timeline',
          'parameters': {
              listOfLines: [
              {
                title: 'Events',
                type: 'cuepoint',
                metadataId: 'trialData',
                color: 'yellow',
                pointNav: true
              }, 
              {
                title: 'noFaceEvents',
                type: 'segment',
                metadataId: 'noFaceData',
                color: 'red'
              }, 
              {
                title: 'oneFaceEvents',
                type: 'segment',
                metadataId: 'oneFaceData',
                color: 'green'
              }, 
              {
                title: 'moreFaceEvents',
                type: 'segment',
                metadataId: 'moreFaceData',
                color: 'blue'
              }, 
            ]
          }
        }]
      }
    });
  },
  created() {
    var obj = JSON.parse(localStorage.getItem("exam"))

    this.form.sessionEmail = obj.sessionEmail
    this.form.sessionId = obj.sessionId
    this.form.examId = obj.examId
    this.form.s3_url = obj.s3_url
    this.form.trial = "{" + "\n" +
               "    examStart: " + new Date(parseInt(obj.timingData.examStart)).toLocaleString() + "\n" +
               "    examEnd: " + new Date(parseInt(obj.timingData.examEnd)).toLocaleString() + "\n" + 
               "    trials: [" + "\n" +
                "     {" + "\n" +
                  "     tiralStart:" + new Date(parseInt(obj.timingData.trials[0].trialStart)).toLocaleString() + "\n" +
                  "     trialEnd:" + new Date(parseInt(obj.timingData.trials[0].trialEnd)).toLocaleString() + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + new Date(parseInt(obj.timingData.trials[1].trialStart)).toLocaleString() + "\n" +
                  "     trialEnd:" + new Date(parseInt(obj.timingData.trials[1].trialEnd)).toLocaleString() + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + new Date(parseInt(obj.timingData.trials[2].trialStart)).toLocaleString() + "\n" +
                  "     trialEnd:" + new Date(parseInt(obj.timingData.trials[2].trialEnd)).toLocaleString() + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + new Date(parseInt(obj.timingData.trials[3].trialStart)).toLocaleString() + "\n" +
                  "     trialEnd:" + new Date(parseInt(obj.timingData.trials[3].trialEnd)).toLocaleString() + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + new Date(parseInt(obj.timingData.trials[4].trialStart)).toLocaleString() + "\n" +
                  "     trialEnd:" + new Date(parseInt(obj.timingData.trials[4].trialEnd)).toLocaleString() + "\n" +
                "     }," + "\n" + 
              "   ]" + "\n" +
            "}"
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
</style>

