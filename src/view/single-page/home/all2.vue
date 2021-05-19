<style lang="less" scoped>
  #map {
    width: 100%;
    height: calc(100vh);
  }
  .imgs{
    height:100%;
    .ivu-col.ivu-col-span-12{
      height:100%;
      padding: 20px;
      text-align: center;
      color:#2d8cf0;
      overflow: hidden;

      .div{
        overflow: auto;
        text-align: center;
        padding: 10px;
        width: 100%;
      }
    }

  }

</style>
<template>
<div>
  <div id="map" class="map">
    <div style="position:fixed;left:45%;z-index:10;text-align: center">
      <button @click="initMap()">初始化选区</button>
      <button @click="save()" >全图编译</button>
      <button @click="selectA()" >选区编译</button>
      <button @click="showPix" >像素</button>
    </div>
  </div>
  <Modal
    v-model="modal1"
    fullscreen
    title="图像处理前后对比"
    footer-hide
  >
    <Row class="imgs">
      <Col span="12">
        <h4>编译前的图片</h4>
        <div>
          <img :src="src1" alt="">
        </div>
      </Col>
      <Col span="12">
        <h4>编译后的图片</h4>
        <div>
          <img :src="src2" alt="">

        </div>
      </Col>
    </Row>
  </Modal>
</div>

</template>
<script>
import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import * as olExtent from 'ol/extent'
import $ from 'jquery'

import MousePosition from 'ol/control/MousePosition'
import { createStringXY } from 'ol/coordinate'
import { platformModifierKeyOnly } from 'ol/events/condition'
import Feature from 'ol/Feature'
import { Polygon, Point, Circle } from 'ol/geom'

import { mapActions } from 'vuex'
import { defaults as defaultControls } from 'ol/control'
import { Fill, Stroke, Style } from 'ol/style'
import Modify from 'ol/interaction/Modify'
import Draw, { createBox } from 'ol/interaction/Draw'
import { fromLonLat, toLonLat } from 'ol/proj'
import OSMSource from 'ol/source/OSM'
import axios from '@/libs/api.request'
import {
  Select,
  Translate,
  defaults as defaultInteractions
} from 'ol/interaction'

export default {
  name: 'home',
  components: {},
  data () {
    return {
      modal1: false,
      src1: undefined,
      src2: undefined,

      map: undefined,
      source: undefined,
      layer: undefined,
      modify: undefined,
      view: undefined,
      draw: undefined,
      translate: undefined,
      selected: undefined,
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
      })
    }
  },
  watch: {},
  mounted () {
    /* var select = new Select({
        style:new Style({
          fill: new Fill({
            color: 'rgba(0,255,0,0)',
          }),
          stroke: new Stroke({
            color: 'rgba(255,0,255,1)',
            lineCap:"square",// butt round square
            lineJoin:"bevel",//bevel，round或miter
            width:2,
          })
        })
      }); */

    this.select.on('select', (e) => {
      this.selected = e.selected[0]
    })
    var translate = new Translate({
      features: this.select.getFeatures()
    })

    translate.on('translatestart', (e) => {
      // 拖动开始的监听函数
      console.log('拖动开始的监听函数', e)
    })
    translate.on('translateend', (e) => {
      // 拖到结束监听函数
      console.log('拖到结束监听函数')
    })
    this.map = new Map({
      interactions: defaultInteractions().extend([this.select, translate]),
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSMSource({
            crossOrigin: 'anonymous'
          })
        })
      ],
      view: new View({// fromLonLat toLonlat
        center: [12954117.957530862, 4852701.975139299],
        zoom: 6
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

    /* var extent = [];
      var canvas;
      var imageData;
      var coordinate = geometry.getCoordinates();
      this.map.once("postrender", function (e) {
        extent[0] = e.target.getPixelFromCoordinate(coordinate[0][0]);//转画布坐标
        extent[1] = e.target.getPixelFromCoordinate(coordinate[0][1]);
        extent[2] = e.target.getPixelFromCoordinate(coordinate[0][2]);
        extent[3] = e.target.getPixelFromCoordinate(coordinate[0][3]);
        var x_dx = getXDis(extent, 0);
        var y_dy = getXDis(extent, 1);
        map.once("postcompose", function (event) {
          canvas = event.context.canvas;
          var ctx2 = canvas.getContext("2d");
          imageData = ctx2.getImageData(x_dx[0], y_dy[0], x_dx[1], y_dy[1]);
          var c = document.getElementById("map");
          c.style.width = imageData.width + 'px';
          c.style.height = imageData.height + 'px';
          map.updateSize();//容器改变重新加载地图
        })
        map.once('rendercomplete', function () {//渲染完成
          canvas.toBlob(function (blob) {
            saveAs(blob, 'map.png');
            $('#map').css({
              width: "100%",
              height: "100%"
            })
            map.updateSize();//容器改变重新加载地图
          });
        });
      });
      function getXDis(e, number) {
        var min = undefined;
        var max = undefined;
        e.forEach(element => {
          if (min === undefined || element[number] < min) {
            min = element[number];
          }
          if (max === undefined || element[number] > max) {
            max = element[number];
          }
        });
        return [min + 2, max - min - 4];
      } */
  },
  methods: {
    ...mapActions([
      'segmentImg'
    ]),
    showPix () {
      this.map && console.log(JSON.stringify(this.map.getPixelFromCoordinate(this.map.getView().getCenter())))
    },
    initMap () {
      this.source && this.source.clear()
      // https://openlayers.org/en/latest/examples/geojson.html

      // console.log(geojsonObjects);
      // var center = this.map.get
      var a = this.map.getView().getCenter()// 地图中心点
      this.map.getView().setZoom(6)// 地图中心点
      var dis1 = 1e5 * 0.618
      var dis2 = 1e5
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
      /*  this.select = new Select();
          // console.log(this.select,this.select.getFeatures());
          this.translate = Translate({//拖拽移动interaction
            features:  this.select.getFeatures()//拖拽的为选择的要素
          }); */
      // 这样是动态给map插入这个属性，这个研究了好久，非常实用。
      // 如果不是动态插入的直接在map里面添加： map = new ol.Map({interactions: ol.interaction.defaults().extend([iTranslate])}
      /* this.translate.on('translatestart',(e)=>{
           //拖动开始的监听函数
         })
         this.translate.on('translateend',(e)=>{
           //拖到结束监听函数
         }) */
      this.modify = new Modify({ source: this.source })
      this.view = new View({ center: fromLonLat([110.90649323723949, 36.76492663092782]), zoom: 6 })
      this.draw = new Draw({ type: 'Circle', source: this.source, geometryFunction: createBox() })

      // this.map.setTarget('map');
      // this.map.setView(this.view);
      this.map.addLayer(this.layer)
      // this.map.addLayer(pointLayer);
      // this.map.addInteraction(this.draw);
      this.map.addInteraction(this.modify)
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
      this.map.addControl(mousePositionControl)
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
        // map.getView().setZoom(12);
        var centerone = olExtent.getCenter(ext)
        map.getView().setCenter(centerone)
        var canvas
        var imageData
        var coordinate = feature.getGeometry().getCoordinates()[0][0]
        var extents = coordinate.map(i => {
          return this.map.getPixelFromCoordinate(i)
        })
        map.once('postrender', function (e) {
          // console.log(coordinate[0]);
          // extents[0] = e.target.getPixelFromCoordinate(coordinate[0]);//转画布坐标
          // extents[1] = e.target.getPixelFromCoordinate(coordinate[1]);
          var extents = that.selected.getGeometry().getCoordinates()[0][0].map(i => {
            return e.target.getPixelFromCoordinate(i)
          })
          console.log(extents)
          // extents[2] = e.target.getPixelFromCoordinate(coordinate[0]);
          // extents[3] = e.target.getPixelFromCoordinate(coordinate[0][3]);
          // extents[4] = e.target.getPixelFromCoordinate(coordinate[0][4]);
          var start = extents[2]
          var end = extents[4]

          map.once('postcompose', function (event) {
            var mapCanvas = document.createElement('canvas')
            var size = map.getSize()
            // console.log(size,x_dx,y_dy );

            // mapCanvas.width = 300;
            // mapCanvas.height =   500;
            // mapCanvas.width = Math.abs(x_dx[1]-y_dy[1]);
            // mapCanvas.height =  Math.abs(x_dx[0]-y_dy[0]);
            // console.log(size,Math.abs(x_dx[0]-x_dx[1]), Math.abs(y_dy[0]-y_dy[1]));
            var mapContext = mapCanvas.getContext('2d')
            var aa = document.querySelectorAll('.ol-layer canvas')[0]
            // console.log(x_dx[0], y_dy[0], x_dx[1], y_dy[1]);
            // console.log(start[0], start[1], end[0]-start[0],end[1]-start[1]);
            mapCanvas.width = Math.abs(end[0] - start[0])
            mapCanvas.height = Math.abs(end[1] - start[1])
            console.log(Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
            // 489.875 0 386.25 625
            // mapContext.drawImage(aa,start[0], start[1],  Math.abs(end[0]-start[0]), Math.abs(end[1]-start[1]));
            // mapCanvas.width = 60;
            // mapCanvas.height = 60;
            mapContext.drawImage(aa, start[0], start[1], Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]), 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
            that.src1 = mapCanvas.toDataURL()
            that.sendFile(mapCanvas.toDataURL())
            // canvas = document.querySelectorAll('.ol-layer canvas')[0];
            // canvas = event.context.canvas;
            // console.log(canvas);
            // var ctx2 = canvas.getContext("2d");
            // imageData = mapContext.getImageData(x_dx[0], y_dy[0], x_dx[1], y_dy[1]);
            // console.log(imageData);
            // var c = document.getElementById("map");
            // c.style.width = imageData.width + 'px';
            // c.style.height = imageData.height + 'px';

            map.updateSize()// 容器改变重新加载地图
          })
          /* map.once('rendercomplete', function () {//渲染完成
              canvas.toBlob(function (blob) {
                // saveAs(blob, 'map.png');
                console.log(blob);
                $('#map').css({
                  width: "100%",
                  height: " calc(100vh)"
                })
                map.updateSize();//容器改变重新加载地图
              });
            }); */
        })
      } else {
        this.initMap()
        this.$Message.info('请点击框选图层!')
      }
    },
    save () {
      this.source && this.source.clear()
      var that = this
      var map = this.map
      map.once('rendercomplete', function (e) {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        var aa = document.querySelectorAll('.ol-layer canvas')[0]
        mapContext.drawImage(aa, 0, 0)
        that.src1 = mapCanvas.toDataURL()
        that.sendFile(mapCanvas.toDataURL())
      })
      map.renderSync()
    },
    sendFile (img) {
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
        }
      })
    },
    saves () {
      var that = this
      var map = this.map
      map.on('rendercomplete', function (e) {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              var opacity = canvas.parentNode.style.opacity
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
              var transform = canvas.style.transform
              // Get the transform parameters from the style's transform matrix
              var matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number)
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              )
              mapContext.drawImage(canvas, 0, 0)
            }
          }
        )
        var aa = document.querySelectorAll('.ol-layer canvas')[0]
        // aa.drawImage(canvas, 0, 0);
        var img = document.createElement('img').setAttribute('src', mapCanvas.toDataURL())

        /* that.segmentImg({img}).then(res => {

            }); */
      })
      map.renderSync()
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
    getXDis (e, number) {
      var min = undefined
      var max = undefined
      e.forEach(element => {
        if (min === undefined || element[number] < min) {
          min = element[number]
        }
        if (max === undefined || element[number] > max) {
          max = element[number]
        }
      })
      return [min + 2, max - min - 4]
    }
  }
}
</script>
<style>

  .custom-mouse-position {
    position: relative;
    top: calc(100% - 22px);
    border-radius: 4px;
    padding: 2px 10px;
    color: #000;
    width: 140px;
    background-color: #fff;
  }
</style>
