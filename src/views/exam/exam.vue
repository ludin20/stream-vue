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
import { } from '@/config/config'
import axios from 'axios'

export default {
  data() {
    return {
      loading: false,
      player: null,
      form: {
        sessionId: '05ebfb99-f170-4410-9e2d-e896943b5db0',
        examId: 'cb63f32c-f678-4e18-86d8-c01f1c99face',
        timingData: {
          examStart: '1606727329040',
          examEnd: '1606727346160',
          trials: [
            {
              trialStart: '1606727329040',
              trialEnd: '1606727330800'
            },
            {
              trialStart: '1606727330800',
              trialEnd: '1606727334640'
            },
            {
              trialStart: '1606727334640',
              trialEnd: '1606727338680'
            },
            {
              trialStart: '1606727338680',
              trialEnd: '1606727342040'
            },
            {
              trialStart: '1606727342040',
              trialEnd: '1606727346160'
            }
          ]
        },
        trial: "{" + "\n" +
               "    examStart: 1606727329040" + "\n" +
               "    examEnd: 1606727346160" + "\n" + 
               "    trials: [" + "\n" +
                "     {" + "\n" +
                  "     tiralStart:" + "1606727329040" + "\n" +
                  "     trialEnd:" + "1606727330800" + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + "1606727330800" + "\n" +
                  "     trialEnd:" + "1606727334640" + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + "1606727334640" + "\n" +
                  "     trialEnd:" + "1606727338680" + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + "1606727338680" + "\n" +
                  "     trialEnd:" + "1606727342040" + "\n" +
                "     }," + "\n" + 
                "     {" + "\n" +
                  "     tiralStart:" + "1606727342040" + "\n" +
                  "     trialEnd:" + "1606727346160" + "\n" +
                "     }," + "\n" + 
              "   ]" + "\n" +
            "}"
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
    },
    // reinit() {
    //   var video = $("#player")
    //   $("source").attr('src', '/2.mp4')
    //   $("video")[0].load()
    //   video.show()
    //   var videorect = $("#videorect")

    //   videorect.append(video)  
    // }
  },
  mounted: function () {
    // this.reinit()
    var video = $("#player")
    $("source").attr('src', 'https://eyesdemo.s3.amazonaws.com/jmagnuss%40gmail.com/f822fb58-2342-4f83-b100-05caae414deb/d6a5b666-a818-434e-88ac-d450bc93678a.mp4')
    $("video")[0].load()
    video.show()
    var videorect = $("#videorect")

    videorect.append(video)
  },
  created() {
    // this.getExaminfo()
    // console.log(this.$router.history.current.params.id, "+++++++++++++")
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

