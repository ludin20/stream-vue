<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item>
        <img src="../../assets/404_images/404.png" style="width: 50px; height:50px; border: 1px solid black">
        <el-button @click="onCancel" style="float: right;">Quit</el-button>
        <el-button @click="onFinish" style="float: right;">Finish</el-button>
        <el-col :span="24">
          <h3 class="title" style="text-align: center; margin-top: 100px; font-size: 26px">Focus On The Picture You Prefer</h3>
        </el-col>
      </el-form-item>
        
      <el-form-item>
        <el-col :span="11">
          <img :src="mainImageSrc" style="width: 300px; height: 300px; float: right">
        </el-col>
        <el-col :span="2" class="line">.</el-col>
        <el-col :span="11">
          <img :src="mainImageSrcRight" style="width: 300px; height: 300px; float: left">
        </el-col>
      </el-form-item>
    </el-form>
  </div>
  
</template>

<script>
export default {
  data() {
    return {
      form: {},
      images: [],
      mainImageSrc: null,
      timestamp: 0,
      mainImageSrc: '',
      mainImageSrcRight: ''
    }
  },
  methods: {
    async onCancel() {
      await this.$store.dispatch('user/logout');
      this.$router.push({ path: '/login' });
    },
    onFinish() {
      this.$router.push({ path: '/finish' });
    },
    getCurrentTimeStamp() {
      this.timestamp = Date.now();
    }
  },
  created() {
    let self = this;
    this.imagesLeft = [
       {
          id: '23',
          image: 'https://images.pexels.com/photos/4173624/pexels-photo-4173624.jpeg'
       },
       {
          id: '32',
          image: 'https://i.pinimg.com/originals/79/27/f9/7927f976b17065d627f94c0e125ac79c.jpg'
       },
       {
          id: '45',
          image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg'
       },
       {
          id: '45',
          image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/beach-zoom-virtual-background-video-design-template-0dc8d8ff1dfc705b84f910b558e397a3.jpg?ts=1586775331'
       },
       {
          id: '45',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQknTS_-o6Y9GdhV1vYnP5ek-KeGu_FHw7BLQ&usqp=CAU'
       },
       {
          id: '45',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT6V7gjpJV8o6t_SIkwARG3pZP3bxO5Z56Emg&usqp=CAU'
       },
       {
          id: '45',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTyMKDV55uOs5ctSRnLjOA5kwwu-k4zTdS6KQ&usqp=CAU'
       },
    ]

    this.imagesRight = [
       {
          id: '23',
          image: 'https://venngage-wordpress.s3.amazonaws.com/uploads/2018/09/Perfect-Sunset-Nature-Background-Image.jpeg'
       },
       {
          id: '32',
          image: 'https://viewfinder.expedia.com/wp-content/uploads/2020/05/Zoom_Bali_Indonesia.jpg'
       },
       {
          id: '45',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSRcBFvwWwx5kb2YQ3-hgYq_LuBMzL_mcm6Ww&usqp=CAU'
       },
       {
          id: '45',
          image: 'https://www.exploregeorgia.org/sites/default/files/minnehaha-falls-rabun-county-ga-logo-benjamingalland.jpg'
       },
       {
          id: '45',
          image: 'https://cdn.pixabay.com/photo/2016/02/19/10/35/nature-1209302__340.jpg'
       },
       {
          id: '45',
          image: 'https://lh3.googleusercontent.com/proxy/p4eiYAo7_yz0vZC8hdYBP57OhWtFlqNl9Pu_0qZMVjbQb450i9OoOuLZSezXnpEyoN4ZYb9X2iCMdrNOpdUnZzt41QB95TGfedNXjxNhPsZvxdf2hlkXK64dSH-61w7Ml5zZUJHz3LTv3t4VblRB5A'
       },
       {
          id: '45',
          image: 'https://i.pinimg.com/originals/9a/59/89/9a5989f59e205b78c4b8fc5a82b3ec7a.jpg'
       },
       {
          id: '45',
          image: 'https://eskipaper.com/images/yosemite-pictures-3.jpg'
       },
    ]

    setInterval(function(){ 
        self.mainImageSrc = self.imagesLeft[Math.floor(Math.random()*self.imagesLeft.length)].image;
        self.getCurrentTimeStamp();
    }, 4000);

    setInterval(function(){ 
        self.mainImageSrcRight = self.imagesRight[Math.floor(Math.random()*self.imagesRight.length)].image;
    }, 4000);
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

