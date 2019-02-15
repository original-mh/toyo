<template>
  <div class="my-vehicle">
    <app-header :title="title"></app-header>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :error.sync="errorFlag"
        :error-text="errorText"
      >
        <vehicle-list v-for="item in vehicleArr" :key="item.id" :item="item"></vehicle-list>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import vehicleList from "./vehicle-list.vue";
import appHeader from "@c/vehicle-header";
//使用borrowStatus字段进行状态显示：01申请中/02用车中/03已还车/04故障中
export default {
  components: {
    vehicleList,
    appHeader
  },
  data() {
    return {
      title: "车辆",
      vehicleArr: [],
      isLoading: false,
      loading: false,
      finished: false,
      par: {
        pageIndex: 0,
        pageSize: 10
      },
      user: {},
      errorFlag: false,
      errorText: "请求失败，点击重新加载"
    };
  },
  mounted() {
    this.initView();
  },
  beforeDestroy() {
    window.$vm.$off("reCar", this.onRefresh);
  },
  methods: {
    initView() {
      this.user = this.$cache.getUser();
      setTimeout(() => {
        window.$vm.$on("reCar", this.onRefresh);
        this.$native.registerhandler("ios_use_onRefresh", this.onRefresh);
      }, 1);
    },
    getCarListByUserId() {
      const user = this.user,
        query = this.$route.query,
        params = query && query.UserId;
      this.$native
        .getCarListByUserId({
          UserId: params || user.userid,
          currPage: this.par.pageIndex
        })
        .then(data => {
          this.setVehArr(data);
        })
        .catch(() => {
          this.loading = false;
          this.errorFlag = true;
        });
    },
    setVehArr(data) {
      // 加载状态结束;
      this.loading = false;
      this.isLoading = false;
      this.finished = false;
      const res = data.JSONResult.CarInfoList;
      if (this.par.pageIndex == 1) {
        this.vehicleArr = res;
      } else {
        this.vehicleArr = this.vehicleArr.concat(res);
      }
      //到底了
      if (this.par.pageSize > res.length) this.finished = true;
    },
    onRefresh() {
      this.par.pageIndex = 1;
      this.getCarListByUserId();
    },
    onLoad() {
      this.par.pageIndex++;
      this.getCarListByUserId();
    }
  }
};
</script>

<style lang="less" scoped>
.my-vehicle {
  width: 100%;
}
</style>

