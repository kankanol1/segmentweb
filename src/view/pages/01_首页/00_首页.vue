<template>
  <div style="width: 100%; height: 100%;">
    <div id="up_title">
      <span>人车轨迹分析系统</span>
    </div>
    <div id="down_content">
      <div class="box">
        <div class="sub_content" style="margin-left: 14pt; margin-right: 7pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>卡口采集有效比例</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div class="data-content" style="height: calc(100% - 28pt) !important;">
            <KakouHistogram></KakouHistogram>
          </div>
        </div>
        <div class="sub_content" style="margin-left: 14pt; margin-right: 7pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>异常卡口数据点位推送</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div style="position: absolute; right: 20pt; top: 8pt;">
            <Icon style="font-size: 15pt; cursor: pointer;" type="ios-cloud-download-outline"
                  @click="download($regioncode, 'kakou', true, false)"/>
          </div>
          <div class="data-content">
            <div class="data-content-title">
              <p>
                <span><h3>行政区划</h3></span>
                <span><h3>道路名称</h3></span>
                <span><h3>点位编号</h3></span>
                <span><h3>最后更新时间</h3></span>
              </p>
            </div>
            <div class="data-content-data">
              <template v-if="kakouCollectionAbnormalContent && kakouCollectionAbnormalContent.length">
                <template v-for="(item, index) in kakouCollectionAbnormalContent">
                  <p :key="index">
                    <span>{{dictionary.kkxzqh && dictionary.kkxzqh[item.regionCode] || item.regionCode || '无'}}</span>
                    <span>{{item.roadName}}</span>
                    <span>{{item.pointCode}}</span>
                    <span>{{item.lastUpdateTime}}</span>
                  </p>
                </template>
              </template>
              <template v-else>
                <div style="text-align: center;">暂无数据</div>
              </template>
            </div>
          </div>
          <div style="height: 18pt;">
            <Page size="small"
                  :current.sync="kakouCollectionAbnormalPageInfo.page"
                  :page-size.sync="kakouCollectionAbnormalPageInfo.size"
                  :total="kakouCollectionAbnormalPageInfo.totalElements"
                  @on-change="selectKakouCollectionAbnormal()"
                  @on-page-size-change="(value) => {kakouCollectionAbnormalPageInfo.size = value;selectKakouCollectionAbnormal();}"
                  style="float: right; padding-right: 20pt;"/>
          </div>
        </div>
        <div class="sub_content" style="margin-left: 7pt; margin-right: 14pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>异常热点数据点位推送</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div style="position: absolute; right: 20pt; top: 8pt;">
            <Icon style="font-size: 15pt; cursor: pointer;" type="ios-cloud-download-outline"
                  @click="download($regioncode, 'redian', true, false)"/>
          </div>
          <div class="data-content">
            <div class="data-content-title">
              <p>
                <span><h3>行政区划</h3></span>
                <span><h3>道路名称</h3></span>
                <span><h3>点位编号</h3></span>
                <span><h3>最后更新时间</h3></span>
              </p>
            </div>
            <div class="data-content-data">
              <template v-if="redianCollectionAbnormalContent && redianCollectionAbnormalContent.length">
                <template v-for="(item, index) in redianCollectionAbnormalContent">
                  <p :key="index">
                    <span>{{dictionary.rdxzqh && dictionary.rdxzqh[item.regionCode] || item.regionCode || '无'}}</span>
                    <span>{{item.roadName}}</span>
                    <span>{{item.pointCode}}</span>
                    <span>{{item.lastUpdateTime}}</span>
                  </p>
                </template>
              </template>
              <template v-else>
                <div style="text-align: center;">暂无数据</div>
              </template>
            </div>
          </div>
          <div style="height: 18pt;">
            <Page size="small"
                  :current.sync="redianCollectionAbnormalPageInfo.page"
                  :page-size.sync="redianCollectionAbnormalPageInfo.size"
                  :total="redianCollectionAbnormalPageInfo.totalElements"
                  @on-change="selectRedianCollectionAbnormal()"
                  @on-page-size-change="(value) => {redianCollectionAbnormalPageInfo.size = value;selectRedianCollectionAbnormal();}"
                  style="float: right; padding-right: 20pt;"/>
          </div>
        </div>
      </div>
      <div class="box">
        <div class="sub_content" style="margin-left: 14pt; margin-right: 7pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>热点采集有效比例</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div class="data-content" style="height: calc(100% - 28pt) !important;">
            <RedianHistogram></RedianHistogram>
          </div>
        </div>
        <div class="sub_content" style="margin-left: 14pt; margin-right: 7pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>异常卡口位置点位推送</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div style="position: absolute; right: 20pt; top: 8pt;">
            <Icon style="font-size: 15pt; cursor: pointer;" type="ios-cloud-download-outline"
                  @click="download($regioncode, 'kakou', false, true)"/>
          </div>
          <div class="data-content">
            <div class="data-content-title">
              <p>
                <span><h3>行政区划</h3></span>
                <span><h3>道路名称</h3></span>
                <span><h3>点位编号</h3></span>
                <span><h3>经纬度</h3></span>
              </p>
            </div>
            <div class="data-content-data">
              <template v-if="kakouDeviceAbnormalContent && kakouDeviceAbnormalContent.length">
                <template v-for="(item, index) in kakouDeviceAbnormalContent">
                  <p :key="index">
                    <span>{{dictionary.kkxzqh && dictionary.kkxzqh[item.regionCode] || item.regionCode || '无'}}</span>
                    <span>{{item.roadName}}</span>
                    <span>{{item.pointCode}}</span>
                    <span>{{`${item.wgsLongitude || '0.000000'} / ${item.wgsLatitude || '0.000000'}`}}</span>
                  </p>
                </template>
              </template>
              <template v-else>
                <div style="text-align: center;">暂无数据</div>
              </template>
            </div>
            <div style="height: 18pt;">
              <Page size="small"
                    :current.sync="kakouDeviceAbnormalPageInfo.page"
                    :page-size.sync="kakouDeviceAbnormalPageInfo.size"
                    :total="kakouDeviceAbnormalPageInfo.totalElements"
                    @on-change="selectKakouDeviceAbnormal()"
                    @on-page-size-change="(value) => {kakouDeviceAbnormalPageInfo.size = value;selectKakouDeviceAbnormal();}"
                    style="float: right; padding-right: 20pt;"/>
            </div>
          </div>
        </div>
        <div class="sub_content" style="margin-left: 7pt; margin-right: 14pt;">
          <i class="topL"></i><i class="topR"></i><i class="bottomL"></i><i class="bottomR"></i>
          <div class="data-title">
            <b class="data-title-left">[&nbsp;&nbsp;</b>
            <span>异常热点位置点位推送</span>
            <b class="data-title-right">&nbsp;&nbsp;]</b>
          </div>
          <div style="position: absolute; right: 20pt; top: 8pt;">
            <Icon style="font-size: 15pt; cursor: pointer;" type="ios-cloud-download-outline"
                  @click="download($regioncode, 'redian', false, true)"/>
          </div>
          <div class="data-content">
            <div class="data-content-title">
              <p>
                <span><h3>行政区划</h3></span>
                <span><h3>道路名称</h3></span>
                <span><h3>点位编号</h3></span>
                <span><h3>经纬度</h3></span>
              </p>
            </div>
            <div class="data-content-data">
              <template v-if="redianDeviceAbnormalContent && redianDeviceAbnormalContent.length">
                <template v-for="(item, index) in redianDeviceAbnormalContent">
                  <p :key="index">
                    <span>{{dictionary.rdxzqh && dictionary.rdxzqh[item.regionCode] || item.regionCode || '无'}}</span>
                    <span>{{item.roadName}}</span>
                    <span>{{item.pointCode}}</span>
                    <span>{{`${item.wgsLongitude || '0.000000'} / ${item.wgsLatitude || '0.000000'}`}}</span>
                  </p>
                </template>
              </template>
              <template v-else>
                <div style="text-align: center;">暂无数据</div>
              </template>
            </div>
            <div style="height: 18pt;">
              <Page size="small"
                    :current.sync="redianDeviceAbnormalPageInfo.page"
                    :page-size.sync="redianDeviceAbnormalPageInfo.size"
                    :total="redianDeviceAbnormalPageInfo.totalElements"
                    @on-change="selectRedianDeviceAbnormal()"
                    @on-page-size-change="(value) => {redianDeviceAbnormalPageInfo.size = value;selectRedianDeviceAbnormal();}"
                    style="float: right; padding-right: 20pt;"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import KakouHistogram from './components/卡口柱状图';
  import RedianHistogram from './components/热点柱状图';

  export default {
    name: "home",
    components: {KakouHistogram: KakouHistogram, RedianHistogram: RedianHistogram},
    beforeMount() {
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: ['kkxzqh', 'rdxzqh']}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    mounted() {
      this.selectKakouCollectionAbnormal();
      this.selectRedianCollectionAbnormal();
      this.selectKakouDeviceAbnormal();
      this.selectRedianDeviceAbnormal();
    },
    computed: {},
    data() {
      return {
        dictionary: {}, // 字典
        kakouCollectionAbnormalPageInfo: {page: 1, size: 100, totalElements: 0},
        kakouCollectionAbnormalContent: [],
        redianCollectionAbnormalPageInfo: {page: 1, size: 100, totalElements: 0},
        redianCollectionAbnormalContent: [],

        kakouDeviceAbnormalPageInfo: {page: 1, size: 100, totalElements: 0},
        kakouDeviceAbnormalContent: [],
        redianDeviceAbnormalPageInfo: {page: 1, size: 100, totalElements: 0},
        redianDeviceAbnormalContent: [],
      };
    },
    methods: {
      download(regionCode, type, collectionAbnormal, deviceAbnormal) {
        let args = `?_t=${new Date().getTime()}&timeThreshold=86400000`;
        regionCode && (args += `&regionCode=${regionCode}`);
        collectionAbnormal && (args += `&collectionAbnormal=${collectionAbnormal}`);
        deviceAbnormal && (args += `&deviceAbnormal=${deviceAbnormal}`);
        window.location.href = `/api/com/${type}/downloadAbnormalNodes` + args;
      },
      selectKakouCollectionAbnormal() {
        let args = {};
        args.deviceAbnormal = false;
        args.collectionAbnormal = true;
        args.timeThreshold = 86400000;
        args.page = this.kakouCollectionAbnormalPageInfo.page - 1;
        args.size = this.kakouCollectionAbnormalPageInfo.size || 100;
        this.$http.post('/api/com/kakou/selectAbnormalNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            this.$set(this.kakouCollectionAbnormalPageInfo, 'totalElements', response.data.page.totalElements);
            this.$set(this.kakouCollectionAbnormalPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
            this.$set(this, 'kakouCollectionAbnormalContent', response.data.data);
          }
        });
      },
      selectRedianCollectionAbnormal() {
        let args = {};
        args.deviceAbnormal = false;
        args.collectionAbnormal = true;
        args.timeThreshold = 86400000;
        args.page = this.redianCollectionAbnormalPageInfo.page - 1;
        args.size = this.redianCollectionAbnormalPageInfo.size || 100;
        this.$http.post('/api/com/redian/selectAbnormalNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            this.$set(this.redianCollectionAbnormalPageInfo, 'totalElements', response.data.page.totalElements);
            this.$set(this.redianCollectionAbnormalPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
            this.$set(this, 'redianCollectionAbnormalContent', response.data.data);
          }
        });
      },
      selectKakouDeviceAbnormal() {
        let args = {};
        args.deviceAbnormal = true;
        args.collectionAbnormal = false;
        args.timeThreshold = 86400000;
        args.page = this.kakouDeviceAbnormalPageInfo.page - 1;
        args.size = this.kakouDeviceAbnormalPageInfo.size || 100;
        this.$http.post('/api/com/kakou/selectAbnormalNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            this.$set(this.kakouDeviceAbnormalPageInfo, 'totalElements', response.data.page.totalElements);
            this.$set(this.kakouDeviceAbnormalPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
            this.$set(this, 'kakouDeviceAbnormalContent', response.data.data);
          }
        });
      },
      selectRedianDeviceAbnormal() {
        let args = {};
        args.deviceAbnormal = true;
        args.collectionAbnormal = false;
        args.timeThreshold = 86400000;
        args.page = this.redianDeviceAbnormalPageInfo.page - 1;
        args.size = this.redianDeviceAbnormalPageInfo.size || 100;
        this.$http.post('/api/com/redian/selectAbnormalNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            this.$set(this.redianDeviceAbnormalPageInfo, 'totalElements', response.data.page.totalElements);
            this.$set(this.redianDeviceAbnormalPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
            this.$set(this, 'redianDeviceAbnormalContent', response.data.data);
          }
        });
      },
    },
  }
</script>

<style scoped lang="less">
  #up_title {
    font-size: 30pt;
    text-align: center;
    padding: 10pt 0pt;
    height: 65pt;
  }

  #down_content {
    height: calc(100% - 65pt);

    .box {
      height: 50%;
      padding: 12pt 0pt;
      display: flex !important;

      .sub_content {
        position: relative;
        width: calc(50% - 21pt);
        height: 100%;
        flex-grow: inherit;
        box-shadow: 5px 5px 10px #666666e8;
        border-radius: 10pt;

        .data-title {
          background-color: #ffffff00;
          width: 260px;
          /*margin: -18px auto 0 auto;*/
          margin: 0px auto 0 auto;
          font-size: 20px;
          text-align: center;

          .data-title-left, .data-title-right {
            color: #999999;
            font-family: 微软雅黑;
            font-size: 20px;
          }

          span {
            /*color: #999999;*/
            text-align: center;
            display: inline-block;
            text-align: center;
            font-size: 18px;
          }
        }

        .data-content {
          width: 100%;
          height: 100%;
          padding: 5pt 5pt;
          /*height: calc(100% - 20pt);*/
          height: calc(100% - 28pt - 13pt);

          .data-content-title {
            width: 100%;

            p {
              border-bottom: 1px solid #999999;
              display: flex;
              background-color: #f8f8f9;

              span {
                width: 25%;
                flex-grow: inherit;
                text-align: center;
              }
            }
          }

          .data-content-data {
            overflow-y: auto;
            padding: 5pt 5pt;
            height: calc(100% - 13pt);

            p {
              border-bottom: 1px solid #999999;
              margin: 5pt 0pt;
              padding: 2pt 0pt;
              display: flex;

              span {
                width: 25%;
                flex-grow: inherit;
                text-align: center;
              }
            }
          }

          .data-content-data::-webkit-scrollbar {
            display: none;
          }
        }
      }

      .topL {
        display: none;
        width: 20px;
        height: 20px;
        border-top-width: 2px;
        border-top-color: #999999;
        border-top-style: solid;
        border-left-width: 2px;
        border-left-color: #999999;
        border-left-style: solid;
        position: absolute;
        top: -2px;
        left: -2px;
      }

      .topR {
        display: none;
        width: 20px;
        height: 20px;
        border-top-width: 2px;
        border-top-color: #999999;
        border-top-style: solid;
        border-right-width: 2px;
        border-right-color: #999999;
        border-right-style: solid;
        position: absolute;
        top: -2px;
        right: -2px;
      }

      .bottomL {
        display: none;
        width: 20px;
        height: 20px;
        border-bottom-width: 2px;
        border-bottom-color: #999999;
        border-bottom-style: solid;
        border-left-width: 2px;
        border-left-color: #999999;
        border-left-style: solid;
        position: absolute;
        bottom: -2px;
        left: -2px;
      }

      .bottomR {
        display: none;
        width: 20px;
        height: 20px;
        border-bottom-width: 2px;
        border-bottom-color: #999999;
        border-bottom-style: solid;
        border-right-width: 2px;
        border-right-color: #999999;
        border-right-style: solid;
        position: absolute;
        bottom: -2px;
        right: -2px;
      }

    }
  }
</style>
