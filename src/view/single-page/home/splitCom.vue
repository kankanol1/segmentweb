<template>
  <div class="demo-split">
    <Split mode="vertical">
      <div slot="left" class="demo-split-pane">
        Left Pane
      </div>
      <div slot="right" class="demo-split-pane">
        Right Pane
      </div>
    </Split>
    <div class="wrapper">
      <div class="pane pane-left"></div>
      <div class="pane pane-right"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'splitCom'
}
</script>

<style scoped lang="less">
  .wrapper {
    position: relative;
    width: 100%;
    height: 500px;
    margin-left: 20px;

    .pane {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;

      &-left {
        background: pink;
        right: 40%;
      }

      &-right {
        background: yellowgreen;
        left: 60%;
      }
    }
  }
    .demo-split {
      height: 200px;
      border: 1px solid #dcdee2;
    }

    .demo-split-pane {
      padding: 10px;
    }
</style>
