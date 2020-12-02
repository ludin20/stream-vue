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
      
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column align="center" label="ID">
          <template slot-scope="scope">
            {{ scope.$index }}
          </template>
        </el-table-column>

        <el-table-column label="Exam ID" width="500" align="center">
          <template slot-scope="scope">
            <a href="#" @click="goDetail(scope.row.id)">{{ scope.row.examId }}</a>
          </template>
        </el-table-column>

        <el-table-column label="Session Email" width="500" align="center">
          <template slot-scope="scope">
            <a href="#" @click="goDetail(scope.row.id)">{{ scope.row.sessionEmail }}</a>
          </template>
        </el-table-column>

        <el-table-column label="Start Time" width="500" align="center">
          <template slot-scope="scope">
            <a href="#" @click="goDetail(scope.row.id)">{{ scope.row.startTime }}</a>
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
import {} from '@/config/config'
export default {
  data() {
    return {
      form: {},
      list: [
        {
          id: 1,
          examId: 'cb63f32c-f678-4e18-86d8-c01f1c99face',
          sessionEmail: 'admin@gmail.com',
          startTime: '2020-11-08 08:10:33',
          hasVideo: true
        },
        {
          id: 2,
          examId: '1e9758d3-62d6-43ba-98ef-d5dbd0fae742',
          sessionEmail: 'admin@gmail.com',
          startTime: '2020-11-09 08:10:33',
          hasVideo: false
        },
        {
          id: 3,
          examId: 'd6a5b666-a818-434e-88ac-d450bc93678a',
          sessionEmail: 'jmagnuss@gmail.com',
          startTime: '2020-11-08 08:11:33',
          hasVideo: true
        },
        {
          id: 4,
          examId: '957d1d43-75c0-4ad2-9d16-6c33714b0f60',
          sessionEmail: 'Paul425@protonmail.com',
          startTime: '2020-11-08 08:12:33',
          hasVideo: false
        },
        {
          id: 5,
          examId: '90c556c2-5a57-4532-8e55-d24a7d0442b4',
          sessionEmail: 'Paul425@protonmail.com',
          startTime: '2020-11-08 08:13:33',
          hasVideo: true
        },
      ],
      listLoading: false
    }
  },
  methods: {
    async onCancel() {
      localStorage.clear()
      await this.$store.dispatch('user/logout')
      window.location.href = "/login"
    },
    goDetail(id) {
      var id = id;
      this.$router.push({ path: '/admin/'+id })
    },
    getExams() {

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
</style>

