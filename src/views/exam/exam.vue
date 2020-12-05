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
        <el-col :span="10" id="videorect">
          
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
        trial: ''
      }
    }
  },
  watch: {
  },
  methods: {
    async onCancel() {
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/login"
    }
  },
  mounted: function () {
    var video = $("#myplayer-timeline-container")
    
    $("source").attr('src', this.form.s3_url)
    $("video")[0].load()
    video.show()
    var videorect = $("#videorect")

    videorect.append(video)
  },
  created() {
    var obj = JSON.parse(localStorage.getItem("exam"))
    this.form.sessionId = obj.sessionId
    this.form.examId = obj.examId
    this.form.s3_url = obj.s3_url
    this.form.trial = "{" + "\n" +
               "    examStart: " + obj.timingData.examStart + "\n" +
               "    examEnd: " + obj.timingData.examEnd + "\n" + 
               "    trials: [" + "\n" +
                "     {" + "\n" +
                  "     tiralStart:" + obj.timingData.trials[0].trialStart + "\n" +
                  "     trialEnd:" + obj.timingData.trials[0].trialEnd + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + obj.timingData.trials[1].trialStart + "\n" +
                  "     trialEnd:" + obj.timingData.trials[1].trialEnd + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + obj.timingData.trials[2].trialStart + "\n" +
                  "     trialEnd:" + obj.timingData.trials[2].trialEnd + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + obj.timingData.trials[3].trialStart + "\n" +
                  "     trialEnd:" + obj.timingData.trials[3].trialEnd + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + obj.timingData.trials[4].trialStart + "\n" +
                  "     trialEnd:" + obj.timingData.trials[4].trialEnd + "\n" +
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

