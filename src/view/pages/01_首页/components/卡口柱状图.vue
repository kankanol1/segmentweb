<template>
  <div style="width: 100%; height: 100%;">
    <div id="ele1593399342977" style="width: 100%; height: 100%;">
    </div>
  </div>
</template>

<script>
  export default {
    name: "KakouHistogram",
    components: {},
    beforeMount() {
      let args = {page: 0, size: 10};
      this.$http.post('/api/com/statistics/selectNodes', args).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
          this.$set(this, 'content', response.data.data || []);
          this.draw();
        }
      });
    },
    mounted() {
    },
    computed: {},
    data() {
      return {
        content: [],
        option: (xAxis, validData, unvalidData, validProportion) => ({
          grid: {bottom: 20},
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross', crossStyle: {color: '#000000'}}},
          toolbox: {feature: {saveAsImage: {show: true, title: '保存', pixelRatio: 3}}},
          legend: {data: ['有效采集量', '无效采集量', '有效采集比例']},
          xAxis: [{type: 'category', data: [...xAxis], axisPointer: {type: 'shadow'}}],
          yAxis: [
            {type: 'value', name: '采集总量(万条)', min: 0, interval: 1000, axisLabel: {formatter: '{value}'}},
            {type: 'value', name: '有效比例', min: 0, max: 100, interval: 20, axisLabel: {formatter: '{value}%'}}
          ],
          series: [
            {color: ['#555555'], name: '有效采集量', type: 'bar', stack: 'one', data: [...validData]},
            {color: ['#888888'], name: '无效采集量', type: 'bar', stack: 'one', data: [...unvalidData]},
            {color: ['#000000'], name: '有效采集比例', type: 'line', yAxisIndex: 1, data: [...validProportion]}
          ]
        }),
      };
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    },
    methods: {
      draw() {
        let [xAxis, validData, unvalidData, validProportion] = [[], [], [], []];
        this.content.sort((a, b) => a.day - b.day).forEach(it => {
          xAxis.push(it.day);
          validData.push(it.car / 10000);
          unvalidData.push((it.carFull > it.car ? it.carFull - it.car : 0) / 10000);
          validProportion.push(((it.carFull > it.car ? it.car / it.carFull : 100) * 100).toFixed(3));
        });
        let echarts = require('echarts');
        let kkChart = echarts.init(document.getElementById('ele1593399342977'));
        kkChart.setOption(this.option(xAxis, validData, unvalidData, validProportion));
        this.$kkChart = kkChart;
        window.addEventListener('resize', this.resize);
      },
      resize() {
        this.$kkChart && this.$kkChart.resize();
      },
    },
  }
</script>

<style scoped lang="less">
</style>
