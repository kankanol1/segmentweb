
<template>
  <ul class="result-ul">
    <template v-for="(item,k) in colors">
      <li>
        {{k+1}}.{{item.label}}
        <span :title="item.name" :style="{backgroundColor:item.color}">
          </span>
      </li>
    </template>
  </ul>
</template>

<script>
export default {
  name: 'index',

  data () {
    return {
      a: [
        { c: 'rgba(48, 103, 141, 255)', num: [48, 103, 141, 255] },
        { c: 'rgba(53, 183, 120, 255)', num: [53, 183, 120, 255] },
        { c: 'rgba(253, 231, 36, 255)', num: [253, 231, 36, 255] },
        { c: 'rgba(68, 1, 84, 255)', num: [68, 1, 84, 255] },
        { c: 'rgba(94, 201, 97, 255)', num: [94, 201, 97, 255] },
        { c: 'rgba(58, 82, 139, 255)', num: [58, 82, 139, 255] }
      ],
      colors: [
        { name: '蓝绿色', color: 'rgba(68,6,94,255)', rgba: 'rgba(68,6,94,255)', label: '城市用地', c: [58, 82, 139, 255] },
        { name: '黄色', color: '#f9e723', rgba: 'rgba(0,0,0,255)', label: '农业用地', c: [48, 103, 141, 255] },
        { name: '紫色', color: '#404387', rgba: 'rgba(64,67,135,255)', label: '牧场用地', c: [48, 103, 141, 255] },
        { name: '绿色', color: '#46928e', rgba: 'rgba(70,146,142,255)', label: '林地', c: [48, 103, 141, 255] },
        { name: '蓝色', color: '#61ca61', rgba: 'rgba(97,202,97,255)', label: '河流湖泊', c: [48, 103, 141, 255] },
        { name: '白色', color: '#fff', rgba: 'rgba(255,255,255,255)', label: '荒地', c: [0, 0, 0, 255] },
        { name: '黑色', color: '#000', rgba: 'rgba(0,0,0,255)', label: '未知(云、雾)', c: [255, 255, 255, 255] }
      ]
    }
  }
}
</script>

<style scoped lang="less">

  .result-ul {
    list-style: none;
    padding: 0;
    li {
      float: left;
      padding: 0 6px;
      line-height: 1.1rem;
      font-size: 0.8rem;
      font-weight: bold;

      span {
        margin-left: 1px;
        vertical-align: top;
        display: inline-block;
        border: 0.05rem solid black;
        width: 2rem;
        height: 1rem;
      }
    }
  }
</style>
