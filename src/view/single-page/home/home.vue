<style lang="less">
  .map-box {
    position: relative;
    background-color: #000;
    width: 100%;
    height: 80%;

    .ivu-divider-small {
      margin: 4px 0;
    }

    &-user {
      position: absolute;
      z-index: 10;
      top: 10px;
      right: 10px;
    }

    &-user:hover {
      .map-box-con {
        display: block;
      }
    }

    &-con {
      position: absolute;
      display: none;
      right: 20px;
      top: 0;
      width: 120px;
      padding-right: 20px;

      .box {
        width: 100%;
        font-size: 14px;
        background-color: #0f3a65;
        color: #eee;
        border-radius: 4px;
        padding: 10px;
      }

      .logout {
        cursor: pointer;
        color: #2d8cf0;
        display: inline-block;
        width: 100%;
        text-align: center;
        border: 1px solid rgba(45, 140, 240, 0);
        margin-top: 10px;
      }

      .logout:hover {
        border: 1px solid #2d8cf0;
      }
    }
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
    display: inline-block !important;
    /*background-color: rgba(15, 58, 101, 0);*/
    width: 170px;
    max-height: 170px;
    overflow-y: auto;
    cursor: move;
    float: left;
    list-style: none;
    text-align: left;
    position: absolute;
    top: 6px;
    left: 2px;
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
</style>

<template>
  <div class="all">
    <div id="map" class="map">
      <div style="top:100px;display:inline-block;position:fixed;right:0;z-index:10;text-align: center">
        <Button style="width: 100px" @click="$router.push({name: 'tests'})">测试样本</Button>
        <br>
        <Button style="width: 100px" @click="initMap">初始化选区</Button>
        <br>
        <Button style="width: 100px" @click="save" :loading="loadingQ">{{loadingQ?'编译中...':'全图编译'}}</Button>
        <br>
        <Button style="width: 100px" @click="selectAB" :loading="loadingX">{{loadingX?'编译中...':'选区编译'}}</Button>
        <br>
        <Button style="width: 100px" @click="modal2 = true">图片编译</Button>
        <br>
        <Button style="width: 100px" @click="selfArea(drawflag)">{{drawflag?'自定义选区':'取消自定义'}}</Button>
      </div>
    </div>
    <Modal
      v-model="modal1"
      fullscreen
      footer-hide
    >
      <div slot="header">
        <result-note/>
      </div>
      <div class="all-img">
        <div class="all-img-item all-img-title">
          <div><h2>编译前的图片</h2></div>
          <div><h2 style="text-align: center">编译后的图片</h2></div>
        </div>
        <Row>
          <Col span="12" class="img-boxs">
            <div><img class="img" v-if="src1" :src="src1" alt=""></div>
          </Col>
          <Col span="12" class="img-boxs label-box" style="position: relative">
            <div>
              <!--              <img class="img" id="percent" src="/img/result8.png" alt="">-->
              <img class="img" v-if="src2" id="percent" :src="src2" alt="">
            </div>
            <ul draggable="true" class="percent-ul" id="percent-ul" style="position: absolute;right:0 !important;">
              <li v-for="item in nums">
                <span class="color"
                      :style="{backgroundColor:'rgba('+item[0][0]+','+item[0][1]+','+item[0][2]+',1)'}"></span>
                <span class="num"> {{(item[1]/totals*100).toFixed(2)}}%</span>
                <span class="label">{{getFunctions(item)}}</span>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    </Modal>
    <Modal v-model="modal2" fullscreen footer-hide>
      <div slot="header">
        <result-note/>
      </div>
      <upload-file/>
    </Modal>
    <user-setting/>
    <ul id="box">
      <li @click='deleteF'>删除</li>
      <li @click="selectF">选择</li>
      <li @click="removeF">取消选择</li>
    </ul>
  </div>

</template>
<script>

import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import { Source, OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import * as olExtent from 'ol/extent'

import $ from 'jquery'
import MousePosition from 'ol/control/MousePosition'
import { createStringXY } from 'ol/coordinate'
import Feature from 'ol/Feature'

import { mapActions } from 'vuex'
import { Fill, Stroke, Style } from 'ol/style'
import Modify from 'ol/interaction/Modify'
import Draw, { createBox } from 'ol/interaction/Draw'
import { fromLonLat, toLonLat } from 'ol/proj'
import axios from '@/libs/api.request'
import {
  Select,
  Translate,
  defaults as defaultInteractions
} from 'ol/interaction'

import UploadFile from '@/view/pages/upload-file/index.vue'
import UserSetting from '@/view/pages/user-setting/index.vue'
import ResultNote from '@/view/pages/result-note/index.vue'

export default {
  name: 'home',
  components: { UploadFile, UserSetting, ResultNote },
  data () {
    return {
      drawflag: true,
      modal1: false,
      modal2: false,
      loadingX: false,
      loadingQ: false,
      src1: undefined,
      src2: undefined,
      nums: [],
      totals: 100,

      colors: [
        { name: '蓝绿色', color: 'rgba(68,6,94,255)', rgba: 'rgba(68,6,94,255)', label: '城市用地', c: [68, 6, 94, 255] },
        { name: '黄色', color: '#f9e723', rgba: 'rgba(249,231,35,255)', label: '农业用地', c: [249, 231, 35, 255] },
        { name: '紫色', color: '#404387', rgba: 'rgba(64,67,135,255)', label: '牧场用地', c: [64, 67, 135, 255] },
        { name: '绿色', color: '#46928e', rgba: 'rgba(70,146,142,255)', label: '林地', c: [70, 146, 142, 255] },
        { name: '蓝色', color: '#61ca61', rgba: 'rgba(97,202,97,255)', label: '河流湖泊', c: [97, 202, 97, 255] },
        { name: '白色', color: '#fff', rgba: 'rgba(255,255,255,255)', label: '荒地', c: [255, 255, 255, 255] },
        { name: '黑色', color: '#000', rgba: 'rgba(0,0,0,255)', label: '未知(云、雾)', c: [0, 0, 0, 255] }
      ],

      map: undefined,
      source: undefined,
      layer: undefined,
      modify: undefined,
      view: undefined,
      draw: undefined,
      translate: undefined,
      selected: undefined,
      selectedC: undefined,
      select: new Select({
        style: new Style({
          fill: new Fill({
            color: 'rgba(0,255,0,0)'
          }),
          stroke: new Stroke({
            color: 'rgba(255,0,255,1)',
            lineCap: 'square', // butt round square
            lineJoin: 'bevel', // bevel，round或miter
            width: 2
          })
        })
      }),
      mapUrl: {
        /****
           * 高德地图
           * lang可以通过zh_cn设置中文，en设置英文，size基本无作用，scl设置标注还是底图，scl=1代表注记，
           * scl=2代表底图（矢量或者影像），style设置影像和路网，style=6为影像图，
           * vec——街道底图
           * img——影像底图
           * roadLabel---路网+标注
           */
        'aMap-img': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        'aMap-vec': 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        'aMap-roadLabel': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
        /***
           * 天地图 要key的
           * vec——街道底图
           * img——影像底图
           * ter——地形底图
           * cva——中文注记
           * cta/cia——道路+中文注记 ---roadLabel
           */
        'tian-img': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-roadLabel': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-label': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-vec': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-ter': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        /***
           *geoq地图
           * http://cache1.arcgisonline.cn
           * http://map.geoq.cn
           * vec：标准彩色地图
           * gray、blue、warm
           * line 中国轮廓图
           * china 中国轮廓图+标注
           * Hydro 水系
           * green 植被
           */
        'geoq-vec': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
        'geoq-gray': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
        'geoq-blue': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
        'geoq-warm': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',
        'geoq-line': 'http://cache1.arcgisonline.cn/arcgis/rest/services/SimpleFeature/ChinaBoundaryLine/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-china': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-Hydro': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-green': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/vegetation/MapServer/tile/{z}/{y}/{x}', // 不稳定
        /***
           * Google
           * m 街道
           * s 影像
           */
        'google-vec': 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
        'google-img': 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'

      }
    }
  },
  watch: {},
  mounted () {
    const that = this
    this.select.on('select', function (e) {
      console.log(e)
      that.selected = e.selected[0]

      if (e.selected.length >= 1) {
        let arr = []
        if (e.selected[0].getGeometry().getCoordinates().length !== 5) {
          arr = e.selected[0].getGeometry().getCoordinates()[0]
        } else {
          arr = e.selected[0].getGeometry().getCoordinates()
        }
        var geojson = {
          'type': 'Feature',
          'geometry': {
            'type': 'MultiPolygon',
            'coordinates': [[[arr]]]
            // "coordinates": geojsonObjects.geometry.coordinates,
          }
        }
        // that.source = new VectorSource({
        //   features: new GeoJSON().readFeatures(geojson)
        // });
      }
    })
    var translate = new Translate({
      features: this.select.getFeatures()
    })

    translate.on('translatestart', (e) => {
      // 拖动开始的监听函数
      // console.log("拖动开始的监听函数", e);
    })
    translate.on('translateend', (e) => {
      // 拖到结束监听函数
      // console.log("拖到结束监听函数");
    })

    this.map = new Map({
      interactions: defaultInteractions().extend([this.select, translate]),
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            crossOrigin: 'anonymous',
            // url: this.mapUrl["tian-img"],//这里是引用的本地
            // url: this.mapUrl["geoq-img"],//这里是引用的本地
            // url: this.mapUrl["google-img"],//这里是引用的本地
            // url: this.mapUrl["tian-img"],//这里是引用的本地
            // url: this.mapUrl["aMap-roadLabel"],//这里是引用的本地
            // url: this.mapUrl["aMap-vec"],//这里是引用的本地
            url: this.mapUrl['aMap-img'], // 这里是引用的本地
            wrapX: true
          })
        })
      ],
      view: new View({
        center: [12954117.957530862, 4852701.975139299],
        zoom: 13
      })
    })
    this.initMap()
    this.map.on('movestart', e => {
      // console.log(this.map.getView().getCenter());
    })
    this.map.on('click', e => {

      // console.log(e.coordinate);
      // console.log(this.select.getFeatures());
      // this.source && console.log(this.source.getFeatures()[this.source.getFeatures().length - 1].getGeometry());
    })

    this.dragLabel()
    this.selfMenu()
  },
  methods: {
    ...mapActions([
      'segmentImg'
    ]),
    // 删除图层
    deleteF () { // 删除图层
      // console.log(this.selected);
      /* this.selected.map(i=>{
           var polygon = i.getGeometry().getCoordinates()
           console.log(polygon);
           // this.source.removeFeature(i);
         }); */
      var sourceF = this.source.getFeatures()
      var flag = -1

      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          flag = j
        }
      })

      flag >= 0 && this.source.removeFeature(sourceF[flag])
    },
    // 监测点击最上层图层
    checkAll () {
      var flag = false
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          flag = true
        }
      })
      return flag
    },
    // 移除图层
    removeF () {
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          // this.select.removeFeature(i);
          console.log(this.select)
        }
      })
    },
    // 选择图层
    selectF () {
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          console.log(this.select)
          // this.select.addFeature_(i)
        }
      })
    },

    // 监听自定义编译按钮
    selfMenu () { // 自定义右键菜单
      document.oncontextmenu = function () {
        return false
      } // 禁止鼠标右键菜单显示

      var res = document.getElementById('box') // 找到id为box的div
      document.body.onmouseup = (e) => { // 在body里点击触发事件
        if (e.button === 2 && this.checkAll()) { // 如果button=1（鼠标左键），button=2（鼠标右键），button=0（鼠标中间键）
          res.style.top = e.offsetY + 'px' // 鼠标点击时给div定位Y轴
          res.style.left = e.offsetX + 'px' // 鼠标点击时给div定位X轴
          res.style.display = 'block' // 显示div盒子
        } else {
          res.style.display = 'none' // 否则不显示div盒子
        }
      }
    },
    // 监听自定义按钮
    selfArea (draw) {
      if (draw) {
        this.map.addInteraction(this.draw)
        this.source && this.source.clear()
        this.drawflag = false
      } else {
        this.map.removeInteraction(this.draw)
        this.drawflag = true
      }
    },

    // 计算像素百分比
    percentCom (data) {
      const that = this
      // 通过js获取图像数据
      var canvas_obj = document.createElement('canvas') // 获取canvas标签对象
      // var img_obj = document.getElementById("percent");           // 获取img标签对象
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
        }

        for (let i = 0; i < imgArr.length; i++) {
          var flag = true
          if (nums.length === 0) {
            nums.push([imgArr[0], 1])
          } else if (i % 100 === 0) {
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
        // console.log(nums);
        that.nums = nums// .splice(0, 10);
      }
      img_obj.onerror = function (e) {
        console.log('图片路径加载出错')
      }

      img_obj.src = data
      $('#percent').attr('src')
    },

    // srcoller同步
    moveScroller () {
      $('.img-boxs').each(function () {
        $(this).children().first().scroll(function (event) {
          $(this).parent().siblings().first().children().first().scrollLeft(event.target.scrollLeft)
          $(this).parent().siblings().first().children().first().scrollTop(event.target.scrollTop)
        })
      })
    },
    // 拖动标签
    dragLabel () {
      let parent = $('.label-box')[0]
      let [linmit_w, linmit_h] = [parent.offsetWidth, parent.offsetHeight]
      let startPoint = []
      let [left, top] = [0, 0]
      $('#percent-ul').bind('dragstart', function (e) {
        parent = $('.label-box')[0];
        [linmit_w, linmit_h] = [parent.offsetWidth, parent.offsetHeight]
        startPoint = [e.pageX, e.pageY]
      }).bind('dragend', function (e) {
        left = e.pageX - startPoint[0] + left
        top = e.pageY - startPoint[1] + top
        if (left <= 0) left = 0
        if (top <= 0) top = 0
        if (left >= linmit_w - e.target.offsetWidth) left = linmit_w - e.target.offsetWidth
        if (top >= linmit_h - e.target.offsetHeight) top = linmit_h - e.target.offsetHeight
        $(this).css({ left: left + 'px', top: top + 'px' })
      })
    },
    // 判断颜色类型
    getFunctions (params) {
      let value = 511// 最长欧氏距离
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

    // 地图初始化
    initMap () {
      this.source && this.source.clear()
      this.draw && this.map.removeInteraction(this.draw)
      // this.draw && this.draw.clear();
      // https://openlayers.org/en/latest/examples/geojson.html

      // console.log(geojsonObjects);
      // var center = this.map.get
      var a = this.map.getView().getCenter()// 地图中心点
      this.map.getView().setZoom(13)// 地图中心点
      var dis1 = 1e4 / 2// * 0.618;黄金分割比
      var dis2 = 1e4 / 2
      var a1 = [a[0] - dis1, a[1] - dis2]
      var a2 = [a[0] - dis1, a[1] + dis2]
      var a3 = [a[0] + dis1, a[1] + dis2]
      var a4 = [a[0] + dis1, a[1] - dis2]
      var geojson = {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [[[a4, a3, a2, a1, a4]]]
          // "coordinates": geojsonObjects.geometry.coordinates,
        }
      }

      this.source = new VectorSource({
        features: new GeoJSON().readFeatures(geojson)
      })

      const that = this
      this.layer = new VectorLayer({
        source: this.source,
        style: function () {
          return new Style({
            fill: new Fill({
              color: 'rgba(0,255,0,0)'
            }),
            stroke: new Stroke({
              color: 'rgba(255,0,0,1)'
            })
          })
        }
      })
      this.modify = new Modify({ source: this.source })
      this.view = new View({ center: fromLonLat([110.90649323723949, 36.76492663092782]), zoom: 13 })

      /* draw */
      var draw = new Draw({ type: 'Circle', source: this.source, geometryFunction: createBox() })
      draw.on('drawstart', function (e) {
        // that.source && that.source.clear();
      })
      draw.on('drawend', function (e) {
        /*          if (that.drawflag) {
                      that.map.addInteraction(that.draw);
                      that.source && that.source.clear();
                      that.drawflag = false;
                    } else {
                      that.map.removeInteraction(that.draw);
                      that.drawflag = true;
                    } */

        that.selfArea(that.drawflag)
      })

      this.draw = draw
      // this.map.setTarget('map');
      // this.map.setView(this.view);
      this.map.addLayer(this.layer)
      // this.map.addLayer(pointLayer);
      // this.map.addInteraction(this.draw);
      // this.map.addInteraction(this.modify);
      // this.map.addInteraction(this.select);
      // this.map.addInteraction(this.translate);

      // 添加控制器
      var mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-mouse-position',
        target: document.getElementById('mousePosition'),
        undefinedHTML: '&nbsp;'
      })
      // this.map.addControl(mousePositionControl);
    },

    // 选取编译
    selectAC () {
      var map = this.map
      var that = this
      this.$Message.destroy()
      if (this.selected) {
        var feature = this.selected
        this.loadingX = true
        var geometry = feature.getGeometry()
        var ext = geometry.getExtent()
        var r = map.getView().getResolutionForExtent(ext, map.getSize())// 根据范围获取分辨率
        map.getView().setResolution(r)
        var centerone = olExtent.getCenter(ext)
        map.getView().setCenter(centerone)

        map.once('postrender', function (e) {
          var extents = that.selected.getGeometry().getCoordinates()[0][0].map(i => {
            return e.target.getPixelFromCoordinate(i)
          })
          var start = extents[2]
          var end = extents[4]
          map.once('postcompose', function (event) {
            var mapCanvas = document.createElement('canvas')
            var mapContext = mapCanvas.getContext('2d')
            var aa = document.querySelectorAll('.ol-layer canvas')[0]
            mapCanvas.width = Math.abs(end[0] - start[0])
            mapCanvas.height = Math.abs(end[1] - start[1])
            console.log('loadingX')
            setTimeout(() => { // 防止网络阻塞
              mapContext.drawImage(aa, start[0], start[1], Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]), 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
              that.src1 = mapCanvas.toDataURL()
              this.sendFile(this.src1, 'loadingX')
            }, 2000)
            map.updateSize()// 容器改变重新加载地图
          })
        })
      } else {
        this.initMap()
        this.$Message.info('请点击框选图层!')
      }
    },
    sendFileA (img) {
      var formData = new FormData()
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
          this.modal1 = true
          this.moveScroller()
        }
      })
    },
    selectA () {
      var map = this.map
      var that = this
      this.$Message.destroy()
      if (this.selected) {
        var feature = this.selected
        var geometry = feature.getGeometry()
        var ext = geometry.getExtent()
        var r = map.getView().getResolutionForExtent(ext, map.getSize())// 根据范围获取分辨率
        map.getView().setResolution(r)
        var centerone = olExtent.getCenter(ext)
        map.getView().setCenter(centerone)

        map.once('postrender', function (e) {
          var extents = that.selected.getGeometry().getCoordinates()[0][0].map(i => {
            return e.target.getPixelFromCoordinate(i)
          })
          var start = extents[2]
          var end = extents[4]
          map.once('postcompose', function (event) {
            var mapCanvas = document.createElement('canvas')
            var mapContext = mapCanvas.getContext('2d')
            var aa = document.querySelectorAll('.ol-layer canvas')[0]
            mapCanvas.width = Math.abs(end[0] - start[0])
            mapCanvas.height = Math.abs(end[1] - start[1])
            setTimeout(() => { // 防止网络阻塞
              mapContext.drawImage(aa, start[0], start[1], Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]), 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
              that.src1 = mapCanvas.toDataURL()
              that.sendFileA(mapCanvas.toDataURL())
            }, 2000)
            map.updateSize()// 容器改变重新加载地图
          })
        })
      } else {
        this.initMap()
        this.$Message.info('请点击框选图层!')
      }
    },
    selectAB () {
      var map = this.map
      const that = this
      this.$Message.destroy()

      if (this.selectedC && JSON.stringify(this.selectedC.getGeometry().getCoordinates()) === JSON.stringify(this.selected.getGeometry().getCoordinates())) {
        console.log('前后编译相同', JSON.stringify(this.selectedC.getGeometry().getCoordinates()) === JSON.stringify(this.selected.getGeometry().getCoordinates()))
        this.loadingX = true

        this.sendFile(this.src1, 'loadingX')
        return
      }
      if (this.selected) {
        this.selectedC = this.selected
        this.loadingX = true
        var feature = this.selected
        var geometry = feature.getGeometry()
        var ext = geometry.getExtent()
        var r = map.getView().getResolutionForExtent(ext, map.getSize())// 根据范围获取分辨率
        map.getView().setResolution(r)
        var centerone = olExtent.getCenter(ext)
        map.getView().setCenter(centerone)
        var extents = []
        var start = 0
        var end = 0
        if (that.selected.getGeometry().getCoordinates()[0].length !== 5) {
          console.log('定义', geometry.getCoordinates()[0][0])
          extents = geometry.getCoordinates()[0][0].map(i => {
            return map.getPixelFromCoordinate(i)
          })
          start = extents[2]
          end = extents[4]
        } else {
          extents = geometry.getCoordinates()[0].map(i => {
            return map.getPixelFromCoordinate(i)
          })
          start = extents[3]
          end = extents[1]
        }
        map.once('rendercomplete', function (event) {
          var mapCanvas = document.createElement('canvas')
          var mapContext = mapCanvas.getContext('2d')
          var aa = document.querySelectorAll('.ol-layer canvas')[0]
          mapCanvas.width = Math.abs(end[0] - start[0]) - 6
          mapCanvas.height = Math.abs(end[1] - start[1]) - 6
          setTimeout(() => { // 防止地图瓦片刷新
            mapContext.drawImage(aa, start[0] + 2, start[1] + 2, Math.abs(end[0] - start[0]) - 4, Math.abs(end[1] - start[1]) - 4, 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
            that.src1 = mapCanvas.toDataURL()
            that.sendFile(mapCanvas.toDataURL(), 'loadingX')
          }, 2000)
          map.updateSize()// 容器改变重新加载地图
        })

        /* map.once("postrender", function (e) {
            var extents = that.selected.getGeometry().getCoordinates()[0][0].map(i => {
              return e.target.getPixelFromCoordinate(i);
            });
            var start = extents[2];
            var end = extents[4];
            map.once("postcompose", function (event) {
              var mapCanvas = document.createElement('canvas');
              var mapContext = mapCanvas.getContext('2d');
              var aa = document.querySelectorAll('.ol-layer canvas')[0];
              mapCanvas.width = Math.abs(end[0] - start[0]);
              mapCanvas.height = Math.abs(end[1] - start[1]);
              setTimeout(() => {//防止网络阻塞
                mapContext.drawImage(aa, start[0], start[1], Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]), 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]));
                that.src1 = mapCanvas.toDataURL();
                this.sendFile( mapCanvas.toDataURL(), 'loadingX');
              }, 2000)
              map.updateSize();//容器改变重新加载地图
            })
          }); */
      } else {
        this.$Message.info('请初始化选区并框选图层!')
      }
    },
    // 全图编译
    save () {
      this.source && this.source.clear()
      var that = this
      var map = this.map

      this.loadingQ = true
      map.once('rendercomplete', function (e) {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        var aa = document.querySelectorAll('.ol-layer canvas')[0]
        mapContext.drawImage(aa, 0, 0)
        that.src1 = mapCanvas.toDataURL()
        that.sendFile(mapCanvas.toDataURL(), 'loadingQ')
      })
      map.renderSync()
    },
    // 发送图片
    sendFile (img, loadingName) {
      var formData = new FormData()
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
          this.modal1 = true
          this.percentCom(res.data.base64)
        }
      }).finally(() => this[loadingName] = false)
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
    }

  }
}
</script>
<style lang="less" scoped>
  #map {
    width: 100%;
    height: calc(100vh);
  }

  .img-boxs:nth-child(1) > div {
    border-right: 2px solid #fff;
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

  .all {
    position: relative;

    .all-box {
      overflow: auto;
      height: 100%;
    }
  }
</style>
<style lang="less">

  .ol-zoom.ol-unselectable.ol-control {
    margin-top: 100px;
  }

  /*  .custom-mouse-position {
      position: relative;
      top: calc(100% - 22px);
      border-radius: 4px;
      padding: 2px 10px;
      color: #000;
      width: 140px;
      background-color: #fff;
    }*/
</style>
