<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item>
        <img class="logo" src="../../assets/Logo.png">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-col :span="24">
          <h3 class="title">Recent Exams</h3>
        </el-col>
      </el-form-item>
      
      <el-col :span="1" class="search-container" style="margin-right: 6px">
        <el-button type="primary" @click.native.prevent="search">search</el-button>
      </el-col>
      <el-col :span="2" class="search-container">
        <el-input type="text" :span="1" placeholder="searchEmail" v-model="form.searchKey"></el-input>
      </el-col>
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        @sort-change="changeTableSort"
      >
        <el-table-column align="center" label="ID">
          <template slot-scope="scope">
            {{ scope.$index }}
          </template>
        </el-table-column>

        <el-table-column prop="Exam ID" label="Exam ID" width="500" align="center">
          <template slot-scope="scope">
            <a href="javascript:void(0)" @click="goDetail(scope.row.id)">{{ scope.row.examId }}</a>
          </template>
        </el-table-column>

        <el-table-column prop="Session Email" label="Session Email" width="500" align="center">
          <template slot-scope="scope">
            <a href="javascript:void(0)" @click="goDetail(scope.row.id)">{{ scope.row.sessionEmail }}</a>
          </template>
        </el-table-column>

        <el-table-column prop="Start Time" label="Start Time" width="500" align="center" :sortable="'custom'">
          <template slot-scope="scope">
            <a href="javascript:void(0)" @click="goDetail(scope.row.id)">{{ scope.row.startTime }}</a>
          </template>
        </el-table-column>

        <el-table-column align="center" label="Has Video" width="300">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.hasVideo" disabled/>
          </template>
        </el-table-column>

      </el-table>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import {} from '@/utils/master'
import { SERVER_URL } from '@/config/config'
import moment from 'moment'

export default {
  data() {
    return {
      server_url: SERVER_URL,
      form: {
        searchKey: ''
      },
      trial: {
        trialStart: '',
        trialEnd: ''
      },
      trials: [],
      list: [],
      listLoading: true
    }
  },
  methods: {
    async onCancel() {
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/"
    },
    goDetail(id) {
      localStorage.setItem("exam", JSON.stringify(this.list[id]))
      var id = id;
      this.$router.push({ path: '/admin/'+id })
    },
    getExams() {
      axios.get(this.server_url+"/exams").then (response => {
        this.listLoading = true
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            var data = response.data.returnData.ESresult
            data = JSON.parse(JSON.stringify(data))
            var res = JSON.parse(data).hits.hits


            console.log(res)
            for (var i = 0; i < res.length; i ++) {
              let item = {};
              item.id = i
              item.examId = res[i]._source.PK ? res[i]._source.PK.S.split("_")[1] : ""
              item.sessionEmail = res[i]._source.email ? res[i]._source.email.S : ""
              item.sessionId = res[i]._source.sessionId ? res[i]._source.sessionId.S : ""
              item.startTime = res[i]._source.createdAt ? new Date(parseInt(res[i]._source.createdAt.N)).toLocaleString() : ""
              item.hasVideo = res[i]._source.s3_url ? true : false
              item.s3_url = res[i]._source.s3_url ? res[i]._source.s3_url.S : ""
              item.timingData = {}
              item.timingData.examStart = res[i]._source.timingData.M.examStart.N
              item.timingData.examEnd = res[i]._source.timingData.M.examEnd.N

              for (var j = 0; j < res[i]._source.timingData.M.trials.L.length; j ++) {
                this.trial.trialStart = res[i]._source.timingData.M.trials.L[j].M.trialStart.N
                this.trial.trialEnd = res[i]._source.timingData.M.trials.L[j].M.trialEnd.N

                this.trials.push(this.trial)
                this.trial = {}
              }
              item.timingData.trials = this.trials
              this.trials = []

              this.list.push(item)
            }
          } else {
            alert("API Connection Error!")
            this.onCancel()
            this.removeProcess()
          }
        } else {
          alert(response.data.userMessage)
          this.onCancel()
          this.removeProcess()
        }
        this.listLoading = false
      });
    },
    changeTableSort(column) {
      var fieldName = column.prop
      var sortingType = column.order

      if (fieldName === "Start Time") {
        this.list.map(item => {
          item.startTime = moment(item.startTime).valueOf()
        })
      }

      if (sortingType === "descending") {
        this.list = this.list.sort((a, b) => b[fieldName] - a[fieldName])
      } else {
        this.list = this.list.sort((a, b) => a[fieldName] - b[fieldName])
      }

      if (fieldName === "Start Time") {
        this.list.map(item => {
          item.startTime = moment(item.startTime).format("YYYY-MM-DD HH:mm:ss")
        })
      }
    },
    search(e) {
      
    },
    removeProcess() {
      let param = {}

      axios.post(this.server_url+'/deleteFailed', param, {}).then (response => {
        if (response.status === 200 ) {
          if (response.data.returnData.Result === "OK") {
            console.log("Success")
          } else {
            console.log("Failed")
          }
        } else {
          console.log("Failed")
        }
      })
    }
  },
  
  mounted: function () {
  },
  created() {
    this.getExams()
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  opacity: 0;
}

.search-container {
  float: right;
}
</style>

