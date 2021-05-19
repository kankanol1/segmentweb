
<template>
  <div class="img-box">
    <div style="height:40px;border-bottom:1px solid #eee">
      <h2 style="display: inline-block;margin-right: 20px">图像处理前后对比</h2>
      <result-note style="display: inline-block"/>
      <div style="display: inline-block;float: right">
        <Button @click="$router.push({name:'home'})" type="primary" >返回</Button>
      </div>
    </div>
    <div class="all-img">
      <Row style="padding: 10px">
        <Col span="4">
        </Col>
        <Col span="12">
          <h2 style="text-align: center">编译前的图片</h2>
        </Col>
        <Col span="12">
          <h2 style="text-align: center">编译后的图片</h2>
        </Col>
      </Row>
      <Row>
        <Col span="12" class="img-boxs">
          <div><img class="img" v-if="src1" :src="src1" alt=""></div>
        </Col>
        <Col span="12" class="img-boxs label-box" style="position: relative">
          <div>
            <img class="img" v-if="src2" id="percent" :src="src2" alt="">
          </div>
          <ul draggable="true" class="percent-ul" id="percent-ul" style="position: absolute">
            <li v-for="item in nums">
                <span class="color"
                      :style="{backgroundColor:'rgba('+item[0][0]+','+item[0][1]+','+item[0][2]+',1)'}"></span>
              <span class="num">{{(item[1]/totals*100).toFixed(2)}}%</span>
              <span class="label">{{getFunctions(item)}}</span>
            </li>
          </ul>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import axios from '@/libs/api.request'
import ResultNote from '@/view/pages/result-note/content.vue'

export default {
  name: 'index',
  components: {
    ResultNote
  },
  data () {
    return {
      num: 0,
      nums: [],
      totals: 100,
      result: '',
      fileData: undefined,
      csrf_token: '',
      src1: '',
      src2: '',
      modal1: false,
      _URL: window.URL || window.webkitURL,
      sample: [
        { source: '/img/146.jpg', target: '/img/result146.png' },
        { source: '/img/116.jpg', target: '/img/result116.png' },
        { source: '/img/4.jpg', target: '/img/result4.png' },
        { source: '/img/23.jpg', target: '/img/result23.png' }
      ],
      colors: [
        { name: '蓝绿色', color: 'rgba(68,6,94,255)', rgba: 'rgba(68,6,94,255)', label: '城市用地', c: [68, 6, 94, 255] },
        { name: '黄色', color: '#f9e723', rgba: 'rgba(249,231,35,255)', label: '农业用地', c: [249, 231, 35, 255] },
        { name: '紫色', color: '#404387', rgba: 'rgba(64,67,135,255)', label: '牧场用地', c: [64, 67, 135, 255] },
        { name: '绿色', color: '#46928e', rgba: 'rgba(70,146,142,255)', label: '林地', c: [70, 146, 142, 255] },
        { name: '蓝色', color: '#61ca61', rgba: 'rgba(97,202,97,255)', label: '河流湖泊', c: [97, 202, 97, 255] },
        { name: '白色', color: '#fff', rgba: 'rgba(255,255,255,255)', label: '荒地', c: [255, 255, 255, 255] },
        { name: '黑色', color: '#000', rgba: 'rgba(0,0,0,255)', label: '未知(云、雾)', c: [0, 0, 0, 255] }
      ]
    }
  },
  mounted () {
    this.moveScroller()
    this.dragLabel()
    this.selectFileSample(0)
  },
  methods: {
    dragLabel () {
      let parent = $('.label-box')[0]
      let [linmit_w, linmit_h] = [parent.offsetWidth, parent.offsetHeight]
      let startPoint = []
      let startPointOff = []
      let [left, top] = [0, 0]
      $('#percent-ul').bind('dragstart', function (e) {
        parent = $('.label-box')[0];
        [linmit_w, linmit_h] = [parent.offsetWidth, parent.offsetHeight]
        // console.log([linmit_w, linmit_h]);
        startPointOff = [e.offsetX, e.offsetY]
        startPoint = [e.pageX, e.pageY]
        console.log(startPointOff, startPoint)
      })
        .bind('dragend', function (e) {
          left = e.pageX - startPoint[0] + left
          top = e.pageY - startPoint[1] + top
          if (left <= 0) left = 0
          if (top <= 0) top = 0
          if (left >= linmit_w - e.target.offsetWidth)left = linmit_w - e.target.offsetWidth
          if (top >= linmit_h - e.target.offsetHeight)top = linmit_h - e.target.offsetHeight
          $(this).css({ left: left + 'px', top: top + 'px' })
        })
    },
    getFunctions (params) {
      let value = 510
      let label = '城市用地'
      this.colors.forEach((i, j) => {
        const a = Math.sqrt(Math.pow(params[0][0] - i.c[0], 2) + Math.pow(params[0][1] - i.c[1], 2) + Math.pow(params[0][2] - i.c[2], 2))
        if (a < value) {
          value = a
          label = i.label
        }
      })
      return label
    },
    selectFileSample (num) {
      this.num = num
      const that = this
      const img1 = new Image()
      img1.onload = function () {
        that.src1 = this.src
      }
      img1.onerror = function (e) {
        console.log(e)
      }
      img1.src = this.sample[num].source
      this.submitFun1()
    },
    submitFun1 () {
      const that = this
      const img2 = new Image()
      img2.onload = function () {
        that.src2 = this.src
        that.percentCom()
      }
      img2.src = this.sample[this.num].target
    },
    selectFile () {
      let that = this
      $('.img-button').click().change(function (e) {
        if (this.files[0]) {
          that.fileData = this.files[0]
          let reader = new FileReader()
          reader.onload = function (e) {
            that.src1 = this.result
          }
          reader.readAsDataURL(this.files[0])
        }
      })
    },
    submitFun () {
      let that = this
      if (that.fileData) {
        let reader = new FileReader()
        reader.onload = function (e) {
          that.sendFile(this.result)
        }
        reader.readAsDataURL(that.fileData)
      } else {
        this.$Message.info('未选择图片！')
      }
    },
    sendFile (img) {
      if (!img) return
      this.modal1 = true
      let formData = new FormData()
      var file = this.dataURLtoFile(img, 'map.png')
      var blob = this.convertBase64UrlToBlob(img)
      formData.append('file', file)
      formData.append('blob', blob)
      formData.append('base64', img)
      axios.request({
        url: 'img',
        data: formData,
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          this.src1 = img
          this.src2 = res.data.base64
          // this.src2 = '/img/result8.png';
          this.percentCom()
        }
      }).finally(() => {
        this.modal1 = false
      })
    },
    dataURLtoFile (dataurl, filename) { // base64转化为FIle
      // 将base64转换为文件，dataurl为base64字符串，
      // filename为文件名（必须带后缀名，如.jpg,.png）
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    convertBase64UrlToBlob (urlData) { // base64转化为blob
      var bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte

      // 处理异常,将ascii码小于0的转换为大于0
      var ab = new ArrayBuffer(bytes.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }

      return new Blob([ab], { type: 'image/png' })
    },
    moveScrollers () {
      $('.img-box-body>div').each(function () {
        let that = this
        this.addEventListener('scroll', function (event) {
          $(that).siblings().each(function () {
            $(this).scrollTop(event.target.scrollTop)
            $(this).scrollLeft(event.target.scrollLeft)
          })
        })
      })
    },
    moveScroller () {
      $('.img-boxs').each(function () {
        $(this).children().first().scroll(function (event) {
          $(this).parent().siblings().first().children().first().scrollLeft(event.target.scrollLeft)
          $(this).parent().siblings().first().children().first().scrollTop(event.target.scrollTop)
        })
      })
    },
    percentCom () {
      const that = this
      // 通过js获取图像数据
      var canvas_obj = document.createElement('canvas') // 获取canvas标签对象
      // var img_obj = document.getElementById("uploadFile");           // 获取img标签对象
      let img_obj = new Image()

      img_obj.onload = function () {
        canvas_obj.width = img_obj.width
        canvas_obj.height = img_obj.height
        var ctx = canvas_obj.getContext('2d') // 设置在画布上绘图的环境
        ctx.drawImage(img_obj, 0, 0) // 将图片绘制到画布上
        var imgData_obj = ctx.getImageData(0, 0, canvas_obj.width, canvas_obj.height) // 获取画布上的图像像素矩阵
        var imgData = imgData_obj.data // 获取到的数据为一维数组，包含图像的RGBA四个通道数据

        // 将获取到的图像数据去除A通道
        var imgArr = []
        var nums = []
        for (var i = 0; i < imgData.length; i += 4) {
          var a = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]]
          imgArr.push(a)
          // console.log(a);[imgArr[0],1]
        }
        // console.log(imgArr);
        for (let i = 0; i < imgArr.length; i++) {
          var flag = true
          if (nums.length === 0) {
            nums.push([imgArr[0], 1])
          } else if (i % 10 === 0) {
            let a = imgArr[i]
            nums.forEach((item, k) => {
              item = item[0]
              if (item[0] === a[0] && item[1] === a[1] && item[2] === a[2] && item[3] === a[3]) {
                nums[k][1] = nums[k][1] + 1
                flag = false
              }
            })
            if (flag) nums.push([a, 1])
          }
        }
        that.totals = nums.reduce((ol, cur, k, arr) => {
          return ol + cur[1]
        }, 0)
        nums = nums.sort(function (a, b) {
          return b[1] - a[1]
        })
        that.nums = nums// .splice(0,10);
      }
      img_obj.src = this.src2
    }
  }
}
</script>
<style lang="less" scoped>
  .sample-button{
    margin-right:10px
  }
  .img-boxs {
    height: ~"calc(100vh - 150px)";
    div {
      height: 100%;
      position: relative;
      overflow-x: auto;
      text-align: center;

      img {
        height: 100%;
        width: 100%;
        /*height: 100%;*/
        display: block;
      }
    }
  }

  .img-border {
    height: 400px;
    text-align: center;
    border: 1px solid #000;
    background-color: #fff;
  }

  .img-box {
    padding: 20px;

    &-item {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }

    &-title {
      text-align: center;
      padding-bottom: 10px;
    }

    &-body {
      height: ~"calc(100vh - 150px)";

      div {
        width: 50%;
        height: 100%;
        overflow-x: auto;
        text-align: center;

        img {
          display: block;
        }
      }
    }
  }

  .no-scroll::-webkit-scrollbar {
    display: none;
  }

  .percent-ul::-webkit-scrollbar {
    display: none;
  }

  .percent-ul:first-child {
    margin-top: 4px;
  }

  .percent-ul:last-child {
    margin-bottom: 4px;
  }

  .percent-ul {
    width: 170px;
    max-height: 170px;
    cursor: move;
    overflow-y: auto;
    list-style: none;
    text-align: left;
    position: absolute;
    top: 0px;
    left: 0px;
    /*padding: 8px 0;*/
    /*box-shadow: 0 0 4px #eee;*/
    /*background-color: rgba(15, 58, 101, 0.7);*/

    li {
      padding: 0 6px;
      line-height: 1.1rem;
      font-size: 0.8rem;
      font-weight: bold;

      span.color {
        margin-left: 1px;
        vertical-align: top;
        display: inline-block;
        border: 0.05rem solid black;
        width: 2rem;
        height: 1rem;
      }

      span.num {
        color: #fff;
      }

      span.label {
        color: #fff;
      }
    }
  }

  .all-img {

    &-item {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }

    &-title {
      text-align: center;
    }

    &-body {
      height: ~"calc(100vh - 150px)";

      div {
        height: 100%;
        position: relative;
        overflow-x: auto;
        text-align: center;

        img {

          display: block;
        }
      }
    }
  }
</style>
