<template>
  <div class="vehicle-list-body-status">
    <!-- <span v-if="status == '01'" class="free">空闲中</span> -->
    <span v-if="status == '02'" class="busy">有预定</span>
    <span v-else-if="status == '03'" class="reserve">用车中</span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String
    },
    styleArr: {
      type: Object
    }
  }
};
</script>

<style lang="less" scoped>
</style>
