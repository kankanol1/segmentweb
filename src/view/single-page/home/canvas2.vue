<style>
  .map {
    width: 100%;
    height: 400px;
  }
  #cut_container{
    z-index: 10;
  }
  #box{
    width:200px;
    height:300px;
    opacity: 1;
    position:absolute;  /* 对元素进行定位*/
    border: 1px solid #f00;
    background-color: rgba(45, 140, 240, 0.3);
    display: none;
    left:calc(50vw - 50px);
    top:calc(50vh - 50px);
  }
</style>
<template>
  <div>
    <div id="map" class="map"></div>
    <Button @click="startEdit">绘图</Button>
    <Button @click="cancelEdit">取消</Button>
    <div id="box"></div>
  </div>

</template>
<script>
import 'ol/ol.css'
import $ from 'jquery'
// import
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import Translate from 'ol/interaction/Translate'

import layer from 'layer'
import { mapActions } from 'vuex'
import axios from '@/libs/api.request'

export default {
  name: 'home',
  components: {},
  data () {
    return {
      map: undefined,
      myCanvas: undefined,
      ctx: undefined,
      translate: undefined
    }
  },
  watch: {},
  beforeMount () {

  },
  mounted () {
    document.oncontextmenu = function () {
      return false
    }
    this.translate = new Translate({
      hitTolerance: 5,
      layers: [layer]
    })
    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    })

    map.on('movestart', e => {
      //

    })
    map.on('moveend', e => {
      var zoom = map.getView().getZoom()
      // console.log(zoom);
      document.getElementById('box').style.transform = 'scale(' + (zoom / 5) + ')'
    })

    // moveend (module:ol/MapEvent~MapEvent) - Triggered after the map is moved.
    // movestart

    // 选取框
    class Cut {
      constructor (img_src) {
        // 容器对象
        this.container = new CutContainer(this)
        // 属性对象
        this.property = new CutProperty(this)

        // 鼠标点击事件
        this.container.cut.onmousedown = event => this.onMouseDown(event)
        // 鼠标移动
        this.container.cut.onmousemove = event => this.onMouseMove(event)
        // 鼠标up事件
        this.container.cut.onmouseup = event => this.onMouseUp(event)
        // 移除区域
        this.container.cut.onmouseout = event => this.onMouseOut(event)
        // 剪切图片
        this.container.cut.onkeydown = event => this.onKeyDown(event)

        // 图片
        this.img = document.createElement('img')
        this.img.src = img_src
        // 图片加载完成
        this.img.onload = function () {
          if (this.property.background === null) {
            this.init()
          } else {
            this.reloadImg(this.property.background)
          }
          this.container.createLvCanvas(this.img)
          // 保存初始化图形
          this.property.oldImg = this.container.cutCtx.getImageData(0, 0, this.container.cut.width, this.container.cut.height)
        }.bind(this)
      }

      // 初始化
      init () {
        this.container.createContainer().createCut().createPreview().createOperate()
        this.property.background = this.container.cutCtx.getImageData(0, 0, this.container.cut.width, this.container.cut.height)
      }

      // 重新选择图片
      reloadImg (background) {
        this.property = new CutProperty(this)
        this.property.background = background
      }

      // 用户操作===========================================
      // 用户选择剪切图片
      fileChange (id) {
        let pro = this.property
        if (!window.FileReader) {
          alert('浏览器不支持')
          return
        }
        let reader = new FileReader(),
          file = document.getElementById(id).files[0],
          imgType = /^image\//
        if (!imgType.test(file.type)) {
          layer.msg('请选择图片')
          return
        }
        reader.onload = function (e) {
          this.img.src = e.target.result
        }.bind(this)
        reader.readAsDataURL(file)
      }

      // 预览剪裁图片
      previewCutImg () {
        let pro = this.property,
          container = this.container
        if (pro.startX === pro.validEX || pro.startY === pro.validEY) {
          layer.msg('无剪裁图片')
          return
        }
        // 原图
        let cvs = document.createElement('canvas')
        cvs.width = this.img.width
        cvs.height = this.img.height
        let ctx = cvs.getContext('2d')
        ctx.drawImage(this.img, 0, 0)
        let imgData = ctx.getImageData(
          pro.realStartX < pro.realEndX ? pro.realStartX : pro.realEndX,
          pro.realStartY < pro.realEndY ? pro.realStartY : pro.realEndY,
          parseInt(Math.abs(pro.realStartX - pro.realEndX)),
          parseInt(Math.abs(pro.realStartY - pro.realEndY))
        )
        // 原图剪切
        let t = document.createElement('canvas')
        t.width = imgData.width
        t.height = imgData.height
        t.getContext('2d').putImageData(imgData, 0, 0)
        // 创建图片
        let ti = document.createElement('img')
        ti.src = t.toDataURL()
        layer.open({
          type: 1,
          title: '剪裁预览',
          skin: 'layui-layer-rim',
          area: ['100%', '100%'],
          content: $('<span/>').append($(ti)).html()
        })
      }

      // 保存下载图片
      downloadCutImg () {
        let pro = this.property,
          container = this.container
        if (pro.startX === pro.validEX || pro.startY === pro.validEY) {
          layer.msg('无剪裁图片')
          return
        }
        let cvs = document.createElement('canvas')
        cvs.width = this.img.width
        cvs.height = this.img.height
        let ctx = cvs.getContext('2d')
        ctx.drawImage(this.img, 0, 0)
        let imgData = ctx.getImageData(
          pro.realStartX < pro.realEndX ? pro.realStartX : pro.realEndX,
          pro.realStartY < pro.realEndY ? pro.realStartY : pro.realEndY,
          parseInt(Math.abs(pro.realStartX - pro.realEndX)),
          parseInt(Math.abs(pro.realStartY - pro.realEndY))
        )
        // 原图剪切
        let t = document.createElement('canvas')
        t.width = imgData.width
        t.height = imgData.height
        t.getContext('2d').putImageData(imgData, 0, 0)
        let src = t.toDataURL('image/octet-stream')
        let old = document.getElementById('download_img')
        if (old) {
          old.remove()
        }
        let save = document.createElement('a')
        save.style.marginTop = '5%'
        save.className = 'btn btn-danger col-sm-12'
        save.href = src
        save.download = 'cut.png'
        save.innerHTML = '下载'
        save.id = 'download_img'
        /*        save.addEventListener('click', function () { let win = window.open();
                      let src2 = t.toDataURL("image/png");
                      win.document.body.innerHTML = `<img src="${src2}" name='tes.png' />`;
                  }); */
        container.operate.appendChild(save)
      }

      // 鼠标四中状态================================================
      // 鼠标点下未松开
      onMouseDown (e) {
        let pro = this.property,
          container = this.container
        container.cutCtx.beginPath()
        // 重调大小，以当前鼠标所在点的对角点作为剪切起始坐标
        if (pro.readyResize === true) {
          pro.hasCut = false
          // 开始调整
          // 获取对角坐标，以对角坐标为起点
          let t = pro.cuteLength / 2
          if (Math.abs(pro.resizeX - pro.startX) <= t) {
            if (Math.abs(pro.resizeY - pro.startY) <= t) {
              pro.startX = pro.validEX
              pro.startY = pro.validEY
            } else {
              pro.startX = pro.validEX
            }
          } else {
            if (Math.abs(pro.resizeY - pro.validEY) <= t) {
              // 远点为起点
            } else {
              pro.startY = pro.validEY
            }
          }
          pro.readyResize = false
          pro.startResize = true// 开始剪裁
        } else if (pro.readyMove === true) {
          // 准备移动
          let dot = this.getMouseCoord(e)
          pro.moveX = dot.x
          pro.moveY = dot.y
          pro.startMove = true
          pro.readyMove = false
        } else {
          // 清楚存在可剪切区域
          pro.hasCut = false

          // 获取开始坐标点
          let t = this.getMouseCoord(e)
          pro.startX = pro.endX = t.x
          pro.startY = pro.endY = t.y

          // 外层
          // 判断鼠标是否在可剪切区域
          if (pro.startX >= container.offsetX + 20 &&
              pro.startX <= container.cut.width - container.offsetX - 20 &&
              pro.startY >= container.offsetY + 20 &&
              pro.startY <= container.cut.height - container.offsetY - 20) {
            container.cutCtx.save()
            container.cutCtx.clearRect(0, 0, container.cut.width, container.cut.height)
            container.cutCtx.putImageData(pro.oldImg, 0, 0)
            container.cutCtx.fillStyle = 'rgba(0,0,0,0.6)'
            container.cutCtx.fillRect(0, 0, container.cut.width, container.cut.height)
            pro.oldImg2 = container.cutCtx.getImageData(0, 0, container.cut.width, container.cut.height)
            // 设置可以剪切状态
            pro.isCutting = true

            container.cutCtx.restore()
          }
        }
      }

      // 鼠标移动
      onMouseMove (e) {
        let pro = this.property,
          container = this.container
        if (pro.startMove === true) {
          pro.startMove = false
          pro.isMoving = true
        }

        if (pro.startResize === true) {
          pro.startResize = false
          pro.isResizing = true
        }

        // 存在可剪切区域，开始调整大小
        if (pro.hasCut === true) {
          let r = pro.cuteLength,
            half_r = r / 2,
            t = this.getMouseCoord(e),
            x = t.x,
            y = t.y
          container.cutCtx.beginPath()
          container.cutCtx.rect(pro.startX - half_r, pro.startY - half_r, r, r)
          container.cutCtx.rect(pro.startX - half_r, pro.validEY - half_r, r, r)
          container.cutCtx.rect(pro.validEX - half_r, pro.startY - half_r, r, r)
          container.cutCtx.rect(pro.validEX - half_r, pro.validEY - half_r, r, r)

          // 判断鼠标是否在可剪切区域的四个顶点周围，以便进行重新调整大小
          if (container.cutCtx.isPointInPath(x, y)) {
            container.cutCtx.beginPath()

            // 准备对可剪切区域重新调整大小
            pro.readyResize = true
            pro.resizeX = x
            pro.resizeY = y
            container.cut.style.cursor = 'crosshair'
          } else {
            pro.readyResize = false
            container.cut.style.cursor = 'default'
            container.cutCtx.beginPath()

            // 判断鼠标是否在可建起区域内，以便进行移动图形
            let x1, y1, w, h
            if (pro.startX < pro.validEX && pro.startY < pro.validEY) {
              x1 = pro.startX + 10
              y1 = pro.startY + 10
              w = pro.validEX - pro.startX - 20
              h = pro.validEY - pro.startY - 20
            } else if (pro.startX < pro.validEX && pro.startY > pro.validEY) {
              x1 = pro.startX + 10
              y1 = pro.startY - 10
              w = pro.validEX - pro.startX - 20
              h = pro.validEY - pro.startY + 20
            } else if (pro.startX > pro.validEX && pro.startY > pro.validEY) {
              x1 = pro.validEX + 10
              y1 = pro.validEY + 10
              w = pro.startX - pro.validEX - 20
              h = pro.startY - pro.validEY - 20
            } else {
              x1 = pro.validEX + 10
              y1 = pro.startY + 10
              w = pro.startX - pro.validEX - 20
              h = pro.validEY - pro.startY - 20
            }

            container.cutCtx.rect(x1, y1, w, h)
            if (container.cutCtx.isPointInPath(x, y)) {
              // 准备好可移动剪切区域
              pro.readyMove = true
              container.cut.style.cursor = 'move'
            } else {
              pro.readyMove = false
              container.cut.style.cursor = 'default'
            }
          }
        }
        // 正在剪切或者重新调整大小状态
        if (pro.isCutting === true || pro.isResizing === true) {
          // 开始剪辑
          let t = this.getMouseCoord(e)
          pro.endX = t.x
          pro.endY = t.y

          // 是否存在可剪切区域
          if ((pro.startX !== pro.endX) || (pro.startY !== pro.endY)) {
            // 计算有效的可剪切终点坐标
            pro.validEX = pro.endX
            pro.validEY = pro.endY

            if (pro.endX > container.cut.width - container.offsetX - 20) {
              pro.validEX = container.cut.width - container.offsetX - 20
            } else {
              if (pro.endX < container.offsetX + 20) {
                pro.validEX = container.offsetX + 20
              }
            }
            if (pro.endY > container.cut.height - container.offsetY - 20) {
              pro.validEY = container.cut.height - container.offsetY - 20
            } else {
              if (pro.endY < container.offsetY + 20) {
                pro.validEY = container.offsetY + 20
              }
            }
            // 向外层canvas绘制剪切区域
            this.drawCutArea(pro.startX, pro.startY, pro.validEX, pro.validEY)
          }
        } else if (pro.isMoving === true) {
          // 移动图像
          let dot = this.getMouseCoord(e),
            offsetX = Math.abs(dot.x - pro.moveX), // 移动x距离
            offsetY = Math.abs(dot.y - pro.moveY),
            x, y, ex, ey// 移动y距离

            // 判断x轴移动方向
          if (dot.x > pro.moveX) {
            // 右移动
            if (offsetX <= pro.moveOffsetRigth) {
              x = pro.startX + offsetX
              ex = pro.validEX + offsetX
            } else {
              x = pro.startX + pro.moveOffsetRigth
              ex = pro.validEX + pro.moveOffsetRigth
            }
          } else if (dot.x < pro.moveX) {
            if (offsetX <= pro.moveOffsetLeft) {
              x = pro.startX - offsetX
              ex = pro.validEX - offsetX
            } else {
              x = pro.startX - pro.moveOffsetLeft
              ex = pro.validEX - pro.moveOffsetLeft
            }
          }
          // 判断y轴移动方向
          if (dot.y > pro.moveY) {
            // i下移动
            if (offsetY <= pro.moveOffsetBottom) {
              y = pro.startY + offsetY
              ey = pro.validEY + offsetY
            } else {
              y = pro.startY + pro.moveOffsetBottom
              ey = pro.validEY + pro.moveOffsetBottom
            }
          } else if (dot.y < pro.moveY) {
            // 上移动
            if (offsetY <= pro.moveOffsetTop) {
              y = pro.startY - offsetY
              ey = pro.validEY - offsetY
            } else {
              y = pro.startY - pro.moveOffsetTop
              ey = pro.validEY - pro.moveOffsetTop
            }
          }
          pro.moveStartX = x
          pro.moveStartY = y
          pro.moveEndX = ex
          pro.moveEndY = ey
          this.drawCutArea(x, y, ex, ey)
        }
      }

      // 鼠标抬起
      onMouseUp (e) {
        let pro = this.property,
          container = this.container
          // 关闭剪切
        pro.isCutting = false
        // 关闭正在重调大小
        pro.readyResize = false
        pro.isResizing = false
        // 调整剪裁区域大小
        if (pro.isResizing || pro.startResize) {
          pro.isResizing = pro.startResize = false
          pro.readyResize = true
        }
        // 移动剪裁区域
        if (pro.isMoving || pro.startMove) {
          if (pro.isMoving) {
            pro.startX = pro.moveStartX
            pro.startY = pro.moveStartY
            pro.validEX = pro.moveEndX
            pro.validEY = pro.moveEndY
          }
          // 关闭移动
          pro.isMoving = pro.startMove = false
          pro.readyMove = true
        }
        // 是否存在可剪辑区域
        pro.hasCut = (pro.startX !== pro.endX) || (pro.startY !== pro.endY)
        // 存在可剪切区域
        if (!pro.hasCut) {
          // 还原
          container.cutCtx.putImageData(pro.oldImg, 0, 0)
        } else {
          // 剪切区域距离画布四边的offset移动剪切区域需要
          if (pro.startX < pro.validEX) {
            pro.moveOffsetLeft = pro.startX - container.offsetX - 20
            pro.moveOffsetRigth = container.cut.width - container.offsetX - 20 - pro.validEX
          } else {
            pro.moveOffsetLeft = pro.validEX - container.offsetX - 20
            pro.moveOffsetRigth = container.cut.width - pro.startX - container.offsetX - 20
          }
          if (pro.startY < pro.validEY) {
            pro.moveOffsetTop = pro.startY - container.offsetY - 20
            pro.moveOffsetBottom = container.cut.height - pro.validEY - container.offsetY - 20
          } else {
            pro.moveOffsetTop = pro.validEY - container.offsetY - 20
            pro.moveOffsetBottom = container.cut.height - pro.startY - container.offsetY - 20
          }
        }
      }

      // 鼠标移出
      onMouseOut (e) {
        let pro = this.property,
          container = this.container
        pro.isCutting = false
        pro.readyResize = false
        pro.isResizing = false
        container.cut.style.cursor = 'default'
        if (pro.isMoving === true) {
          // 关闭移动
          pro.isMoving = false

          pro.startX = pro.moveStartX
          pro.startY = pro.moveStartY
          pro.validEX = pro.moveEndX
          pro.validEY = pro.moveEndY
        }
        // 是否存在可剪辑区域
        pro.hasCut = (pro.startX !== pro.endX) || (pro.startY !== pro.endY)
        // 存在可剪切区域
        if (pro.hasCut !== true) {
          // 还原
          container.cutCtx.putImageData(pro.oldImg, 0, 0)
        }
      }

      // 回车剪切图片
      onKeyDown (e) {
        let pro = this.property,
          container = this.container
        if (e.keyCode === 13) {
          // 获取四个点坐标
          this.previewCutImg()
        }
      }

      // 剪切矩形的四个顶点
      drawCute (x, y, ex, ey) {
        let pro = this.property,
          container = this.container
        let r = pro.cuteLength, // 方块为2个像素
          color = 'red'// 颜色
        container.cutCtx.save()
        container.cutCtx.fillStyle = color
        let tx = x || pro.startX,
          ty = y || pro.startY,
          tex = ex || pro.validEX,
          tey = ey || pro.validEY
        container.cutCtx.fillRect(tx - r / 2, ty - r / 2, r, r)
        container.cutCtx.fillRect(tx - r / 2, tey - r / 2, r, r)
        container.cutCtx.fillRect(tex - r / 2, ty - r / 2, r, r)
        container.cutCtx.fillRect(tex - r / 2, tey - r / 2, r, r)
        container.cutCtx.restore()
      }

      // 显示截取范围宽高
      drawSize (x1, y1, ex, ey) {
        let pro = this.property,
          container = this.container
        let fillStyle = 'rgba(0,0,0,0.7)',
          x = x1 || pro.startX,
          y = y1 || pro.startY,
          tex = ex || pro.validEX,
          tey = ey || pro.validEY,
          offsetX = x - pro.validEX,
          offsetY = y - pro.validEY
        pro.realStartX = parseInt(container.scale * (x - container.offsetX - 20))
        pro.realStartY = parseInt(container.scale * (y - container.offsetY - 20))
        pro.realEndX = parseInt(container.scale * (tex - container.offsetX - 20))
        pro.realEndY = parseInt(container.scale * (tey - container.offsetY - 20))
        let width = parseInt(Math.abs(pro.realStartX - pro.realEndX)),
          height = parseInt(Math.abs(pro.realStartY - pro.realEndY))
        if (offsetX <= 0) {
          if (offsetY <= 0) {
            // 以startX,startY宽高点
          } else {
            y = tey
          }
        } else {
          if (offsetY <= 0) {
            x = tex
          } else {
            x = tex
            y = tey
          }
        }
        // 画图
        container.cutCtx.save()
        container.cutCtx.fillStyle = fillStyle
        container.cutCtx.fillRect(x, y, 100, y >= 20 ? -20 : 20)
        // console.log(x, y);
        // 屏外canvas创建像素大小
        let temp_ctx = document.createElement('canvas').getContext('2d')
        temp_ctx.canvas.width = 100
        temp_ctx.canvas.height = 20
        temp_ctx.textBaseline = 'middle'
        temp_ctx.textAlign = 'center'
        temp_ctx.fillStyle = 'white'
        temp_ctx.fillText(`${width}x${height}`, temp_ctx.canvas.width / 2, temp_ctx.canvas.height / 2)
        container.cutCtx.drawImage(
          temp_ctx.canvas,
          0, 0,
          temp_ctx.canvas.width, temp_ctx.canvas.height,
          x, y - 20 >= 0 ? y - 20 : y,
          temp_ctx.canvas.width, temp_ctx.canvas.height
        )
        container.cutCtx.restore()
      }

      // 向离屏canvas中画剪切区域
      drawCutArea (x, y, ex, ey) {
        let pro = this.property,
          container = this.container
        container.cutCtx.save()
        container.cutCtx.clearRect(0, 0, container.cut.width, container.cut.height)
        container.cutCtx.putImageData(pro.oldImg2, 0, 0)
        // 向外层canvas绘制剪切区域
        container.cutCtx.putImageData(
          pro.oldImg,
          0, 0,
          x, y,
          ex - x,
          ey - y
        )
        // 显示剪裁图片的宽高
        this.drawCute(x, y, ex, ey)
        // 绘制剪切区域大小
        this.drawSize(x, y, ex, ey)
        container.cutCtx.restore()
      }

      // 获取鼠标在外层canvas的坐标
      getMouseCoord (e) {
        let site = this.container.cut.getBoundingClientRect()
        return {
          x: e.clientX - site.left,
          y: e.clientY - site.top//
        }
      }
    }
    // 剪切类属性
    class CutProperty {
      constructor () {
        // 坐标点
        this.startX = 0
        this.startY = 0
        this.endX = 0
        this.endY = 0
        this.validEX = 0
        this.validEY = 0

        this.resizeX = 0
        this.resizeY = 0

        this.moveX = 0
        this.moveY = 0
        this.moveOffsetTop = 0
        this.moveOffsetRigth = 0
        this.moveOffsetBottom = 0
        this.moveOffsetLeft = 0
        this.moveStartX = 0
        this.moveStartY = 0
        this.moveEndX = 0
        this.moveEndY = 0

        this.offsetX = 0
        this.offsetY = 0

        // 图片的真实坐标大小
        this.realStartX = 0
        this.realStartY = 0
        this.realEndX = 0
        this.realEndY = 0

        // 状态
        this.isCutting = false// 正在剪切状态
        this.hasCut = false// 存在可剪切区域

        this.readyResize = false// 准备重新调整剪切区域大小
        this.startResize = false// 开始调整大小
        this.isResizing = false// 正在他调整剪切区域大小

        this.readyMove = false// 移动剪切区域
        this.startMove = false// 准备移动
        this.isMoving = false// 正在移动剪切区域

        this.cuteLength = 6// 出于可剪切状态中，剪切区域四个顶角方块边长

        this.background = null
        this.oldImg = null
        this.oldImg2 = null
      }
    }
    // 剪切类容器
    class CutContainer {
      constructor (main) {
        this.main = main
        this.container = document.createElement('div')// 整个容器
        this.cut = document.createElement('canvas')// 剪切区域容器
        this.cutCtx = this.cut.getContext('2d')//
        this.preview = document.createElement('div')// 预览容器
        this.operate = document.createElement('div')// 操作容器
        this.lv = document.createElement('canvas')// 离屏canvas用以存放图片canvas
        this.lvCtx = this.lv.getContext('2d')

        this.scale = 1// 图片在cut容器中显示的缩放比例
        this.offsetX = 0
        this.offsetY = 0
      }

      // 创建整个容器
      createContainer () {
        let styles = {
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255,255,256,0.3)'
        }
        // 容器宽高为浏览器可见区域宽高
        styles.width = document.body.clientWidth + 'px'
        styles.height = document.body.clientHeight + 'px'
        // 设置样式
        for (let a in styles) {
          this.container.style[a] = styles[a]
        }
        this.container.id = 'cut_container'
        // 插入容器
        document.body.appendChild(this.container)
        return this
      }

      // 创建剪切区域画布容器
      createCut () {
        let styles = {
            position: 'fixed',
            left: 0,
            backgroundColor: 'white'
          },
          w = document.getElementById('cut_container').style.height

          // 外层canvas高和宽为容器的高
        w = parseInt(w)
        styles.width = w + 'px'
        styles.height = w + 'px'
        for (let a in styles) {
          this.cut.style[a] = styles[a]
        }

        this.cut.id = 'cut_canvas'
        this.cut.tabIndex = 0
        this.cut.width = w
        this.cut.height = w
        // 背景图像
        let backCanvas = document.createElement('canvas')
        let backCtx = backCanvas.getContext('2d')
        backCanvas.width = backCanvas.height = 20
        backCtx.fillStyle = 'rgb(56, 62, 65)'
        backCtx.fillRect(0, 0, 10, 10)
        backCtx.fillRect(10, 10, 10, 10)
        backCtx.fillStyle = 'rgb(50, 56, 58)'
        backCtx.fillRect(10, 0, 10, 10)
        backCtx.fillRect(0, 10, 10, 10)
        this.cutCtx.save()
        this.cutCtx.fillStyle = this.cutCtx.createPattern(backCanvas, 'repeat')
        this.cutCtx.fillRect(0, 0, this.cut.width, this.cut.height)
        this.cutCtx.restore()
        // 向容器插入外层canvas
        document.getElementById('cut_container').appendChild(this.cut)

        return this
      }

      // 剪切预览容器
      createPreview () {
        return this
      }

      // 创建操作容器
      createOperate () {
        // 操作按钮id
        let file_id = 'change_btn',
          preview_id = 'preview_btn',
          save_id = 'save_btn'

        let styles = {
          position: 'fixed',
          top: 0,
          left: this.cut.style.height,
          width: '300px',
          height: this.cut.style.height,
          backgroundColor: 'rgba(255,255,255,0.9)'
        }
        for (let a in styles) {
          this.operate.style[a] = styles[a]
        }

        // 选择图片
        let file = document.createElement('input')
        let file_styles = {
          width: '80%',
          marginTop: '5%'
        }
        for (let a in file_styles) {
          file.style[a] = file_styles[a]
        }
        file.type = 'file'
        file.id = file_id
        file.addEventListener('change', function () {
          this.main.fileChange(file_id)
        }.bind(this))
        this.operate.appendChild(file)

        // 预览按钮
        let preBtn = document.createElement('div')
        preBtn.innerText = '预览剪裁图片'
        preBtn.className = 'btn btn-primary block col-sm-12'
        preBtn.id = preview_id
        preBtn.style.marginTop = '5%'
        preBtn.addEventListener('click', function () {
          this.main.previewCutImg()
        }.bind(this))
        this.operate.appendChild(preBtn)

        // 保存图片按钮
        let saveBtn = document.createElement('div')
        saveBtn.className = 'btn btn-success col-sm-12'
        saveBtn.innerText = '保存剪切图片'
        saveBtn.id = save_id
        saveBtn.style.marginTop = '5%'
        saveBtn.addEventListener('click', function () {
          this.main.downloadCutImg()
        }.bind(this))
        this.operate.appendChild(saveBtn)

        this.container.appendChild(this.operate)

        return this
      }

      /**
         *创建离平cavnas容器
         * @param img HTMLImgDOM
         * */
      createLvCanvas (img) {
        // 离屏canvas宽高比外层canvas宽高小40,鼠标移除canvas外会造成截取范围误差必须这么做
        let width = this.cut.width - 40
        let height = this.cut.height - 40

        this.lv.width = width
        this.lv.height = height

        // 创建离屏图
        let sw, sh

        /**
           * 离屏canvas的图像根据图片的宽高进行计算
           * 1.宽大于高以宽为主，高进行比例缩放
           * 2.高大于宽以高为主，宽按比例进行缩放
           * */
        if (img.width > img.height) {
          // 以宽为主
          if (img.width > this.lv.width) {
            // 缩放比例
            this.scale = img.width / this.lv.width

            let scale2 = 1// 原始比例
            scale2 = this.lv.width / img.width// 缩放比例
            sw = this.lv.width
            sh = parseInt(scale2 * img.height)// 转换为整形
          } else {
            sw = img.width
            sh = img.height
          }
        } else {
          // 以高为主
          if (img.height > this.lv.height) {
            // 缩放比例
            this.scale = img.height / this.lv.height

            let scale2 = 1
            scale2 = this.lv.height / img.height// 缩放比例
            sh = this.lv.height
            sw = parseInt(scale2 * img.width)// 转换为整形
          } else {
            sw = img.width
            sh = img.height
          }
        }
        // 计算offset,所有宽高，以及offset必须为整数不然最终计算要出现偏差
        if ((this.lv.width - sw) % 2 !== 0) {
          sw += 1
        }
        if ((this.lv.height - sh) % 2 !== 0) {
          sh += 1
        }
        // 图像与离屏canvas的大小不成比例，存在间隙
        this.offsetX = (this.lv.width - sw) / 2
        this.offsetY = (this.lv.width - sh) / 2
        // 将图片等比例缩放到离屏canvas
        this.lvCtx.save()
        this.lvCtx.drawImage(img, 0, 0, img.width, img.height, this.offsetX, this.offsetY, sw, sh)
        this.lvCtx.restore()
        this.cutCtx.clearRect(0, 0, this.cut.width, this.cut.height)
        this.cutCtx.putImageData(this.main.property.background, 0, 0)
        // 将离屏canvas绘制在外层canvas上
        this.cutCtx.putImageData(
          this.lvCtx.getImageData(0, 0, this.lv.width, this.lv.height),
          20, 20, this.offsetX, this.offsetY,
          sw, sh)
        return this
      }
    }
  },
  methods: {
    ...mapActions([
      'segmentImg'
    ]),
    startEdit () {
      var body = document.getElementById('map')
      var oDiv = document.getElementById('box')
      oDiv.style.display = 'block'
      // 计算最大偏移距离（后期判断边界时要用到）  oDiv.offsetWidth：表示div的宽度
      var maxLeft = window.innerWidth - oDiv.offsetWidth
      var maxTop = window.innerHeight - oDiv.offsetHeight

      body.onmousedown = e => {
        // if(e.button!==2) return false;
        var ev = e || Event
        var posX = ev.clientX - oDiv.offsetLeft
        var posY = ev.clientY - oDiv.offsetTop
        body.onmousemove = e => {
          var ev = e || Event
          var left = ev.clientX - posX
          var top = ev.clientY - posY
          // 判断边界
          if (left < 0) {
            left = 0
          } else if (left > maxLeft) {
            left = maxLeft
          }
          if (top < 0) {
            top = 0
          } else if (top > maxTop) {
            top = maxTop
          }
          oDiv.style.left = left + 'px'
          oDiv.style.top = top + 'px'
        }
        body.onmouseup = () => {
          body.onmousemove = null
          body.onmouseup = null
        }
      }

      oDiv.onmousedown = e => {
        // if(e.button!==2) return false;
        var ev = e || Event
        var posX = ev.clientX - oDiv.offsetLeft
        var posY = ev.clientY - oDiv.offsetTop
        oDiv.onmousemove = e => {
          var ev = e || Event
          var left = ev.clientX - posX
          var top = ev.clientY - posY
          // 判断边界
          if (left < 0) {
            left = 0
          } else if (left > maxLeft) {
            left = maxLeft
          }
          if (top < 0) {
            top = 0
          } else if (top > maxTop) {
            top = maxTop
          }
          oDiv.style.left = left + 'px'
          oDiv.style.top = top + 'px'
        }
        oDiv.onmouseup = () => {
          oDiv.onmousemove = null
          oDiv.onmouseup = null
        }
      }
    },
    startEdit2 () {
      var body = document.getElementById('map')
      var oDiv = document.getElementById('box')
      oDiv.style.display = 'block'
      // 计算最大偏移距离（后期判断边界时要用到）  oDiv.offsetWidth：表示div的宽度
      var maxLeft = window.innerWidth - oDiv.offsetWidth
      var maxTop = window.innerHeight - oDiv.offsetHeight

      body.onmousedown = e => {
        if (e.button !== 2) return false
        var ev = e || Event
        var posX = ev.clientX - oDiv.offsetLeft
        var posY = ev.clientY - oDiv.offsetTop

        var startX = ev.clientX
        var startY = ev.clientY

        body.onmousemove = e => {
          var ev = e || Event
          var left = ev.clientX - posX
          var top = ev.clientY - posY
          // 判断边界
          if (left < 0) {
            left = 0
          } else if (left > maxLeft) {
            left = maxLeft
          }
          if (top < 0) {
            top = 0
          } else if (top > maxTop) {
            top = maxTop
          }
          oDiv.style.left = left + 'px'
          oDiv.style.top = top + 'px'

          var endX = ev.clientX
          var endY = ev.clientY
          var disX = endX - startX
          var disY = endY - startY

          var myCanvas = document.querySelector('canvas')

          var ctx = myCanvas.getContext('2d')
          ctx.strokeStyle = '#FF0000'// http://localhost:8080/segment/#/canvas
          ctx.fillRect(startX, startY, disX, disY)
          this.myCanvas = myCanvas
          this.ctx = ctx
        }
        body.onmouseup = () => {
          body.onmousemove = null
          body.onmouseup = null
        }
      }
    },
    cancelEdit () {
      document.getElementById('box').style.display = 'none'
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
