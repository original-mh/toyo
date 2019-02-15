<template>
  <div class="v-use">
    <app-header :title="title" :rightText="rightText" :clickRight="clickRight"></app-header>
    <div class="filter">
      <ul>
        <li @click="downClick(0)">
          {{currItem.text}}
          <i class="my-icon icon-down"></i>
        </li>
        <li @click="downClick(1)">
          {{currUseItem.text}}
          <i class="my-icon icon-down"></i>
        </li>
        <li @click="downClick(2)">
          {{currUseName.text}}
          <i class="my-icon icon-down"></i>
        </li>
      </ul>
    </div>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :error.sync="errorFlag"
        :error-text="errorText"
      >
        <use-list
          v-for="item in useArr"
          :key="item.id"
          :item="item"
          :user="user"
          :carStatus="currItem"
        ></use-list>
      </van-list>
    </van-pull-refresh>
    <van-popup
      v-model="ispicker0"
      position="bottom"
      :overlay="true"
      @click-overlay="clickOverlay(0)"
    >
      <van-picker
        show-toolbar
        title
        :columns="columns"
        @confirm="onPickerConfirm"
        @cancel="clickOverlay(0)"
      />
    </van-popup>
    <van-popup
      v-model="ispicker1"
      position="bottom"
      :overlay="true"
      @click-overlay="clickOverlay(1)"
    >
      <van-picker
        show-toolbar
        title
        :columns="columns1"
        @confirm="onPickerConfirm1"
        @cancel="clickOverlay(1)"
      />
    </van-popup>
    <van-popup
      v-model="ispicker2"
      position="bottom"
      :overlay="true"
      @click-overlay="clickOverlay(2)"
    >
      <van-picker
        show-toolbar
        title
        :columns="columns2"
        @confirm="onPickerConfirm2"
        @cancel="clickOverlay(2)"
      />
    </van-popup>
  </div>
</template>

<script>
import { carStatusArr, carUseArr } from "@dist/status";
import appHeader from "@c/vehicle-header";
import useList from "./use/use-list";
import filterVue from "./filter-vue";
export default {
  components: {
    appHeader,
    useList,
    filterVue
  },
  data() {
    return {
      columns: carStatusArr,
      columns1: carUseArr,
      columns2: [{ id: 0, text: "全部车辆" }],
      title: "用车",
      rightText: "历史用车",
      ispicker0: false,
      ispicker1: false,
      ispicker2: false,
      useArr: [],
      allArr: [],
      isLoading: false,
      loading: false,
      finished: false,
      par: {
        pageIndex: 1,
        pageSize: 10
      },
      clickRight: this.clickRightFun,
      user: {},
      currItem: {},
      currUseItem: {},
      currUseName: {},
      errorFlag: false,
      errorText: "请求失败，点击重新加载"
    };
  },
  mounted() {
    this.currItem = this.columns[0];
    this.currUseItem = this.columns1[0];
    this.currUseName = this.columns2[0];
    this.initView();
    setTimeout(() => {
      window.$vm.$on("reUse", this.onRefresh);
      this.$native.registerhandler("ios_use_onRefresh", this.onRefresh);
    }, 1);
  },
  beforeDestroy() {
    window.$vm.$off("reUse", this.onRefresh);
  },
  methods: {
    initView() {
      this.user = this.$cache.getUser();
    },
    clickOverlay(type) {
      this.$toastFull.isBack = false;
      this[`ispicker${type}`] = false;
    },
    onPickerConfirm(value) {
      this.currItem = value;
      this.clickOverlay(0);
      this.serchUseCar();
    },
    onPickerConfirm1(value) {
      this.currUseItem = value;
      this.clickOverlay(1);
      this.serchUseCar();
    },
    onPickerConfirm2(value) {
      this.currUseName = value;
      this.clickOverlay(2);
      this.serchUseCar();
    },
    serchUseCar() {
      const c1 = this.currItem,
        c2 = this.currUseItem,
        c3 = this.currUseName;
      let list = this.allArr;
      if (c1.id > 0) {
        if (c1.id == 1) {
          //借出
          list = list.filter(p => p.fromUserId == this.user.userid);
        } else {
          //借入
          list = list.filter(p => p.toUserId == this.user.userid);
        }
      }
      if (c2.id > 0) {
        const currDate = new Date().getTime();
        if (c2.id == 1) {
          //预定
          list = list.filter(p => p.borrowFromTime > currDate);
        } else {
          //用车
          list = list.filter(
            p => currDate > p.borrowFromTime && currDate < p.borrowToTime
          );
        }
      }
      if (c3.id != 0) {
        list = list.filter(p => p.carName == c3.text);
      }
      this.useArr = list;
    },
    downClick(type) {
      this.$toastFull.isBack = true;
      this[`ispicker${type}`] = true;
    },
    clickRightFun() {
      //历史用车
      this.$router.push("/hisuser");
    },
    getBorrowCarListByUserId() {
      const user = this.user;
      this.$native
        .getBorrowCarListByUserId({
          UserId: user.userid,
          currPage: this.par.pageIndex
        })
        .then(data => {
          this.setUseArr(data);
        })
        .catch(() => {
          this.loading = false;
          this.errorFlag = true;
        });
    },
    setUseArr(data) {
      // 加载状态结束
      this.loading = false;
      this.isLoading = false;
      this.finished = false;
      const res = data.JSONResult.BorrowCarRecordList;
      // if (this.par.pageIndex == 1) {
      this.allArr = res;
      res.forEach(item => {
        this.columns2.push({ id: item.carId, text: item.carName });
      });
      this.serchUseCar();
      // else {
      //   this.useArr = this.useArr.concat(res);
      // }
      //到底了
      // if (this.par.pageSize > res.length)
      this.finished = true;
    },
    onRefresh() {
      this.par.pageIndex = 1;
      this.getBorrowCarListByUserId();
    },
    onLoad() {
      // this.par.pageIndex++;
      this.getBorrowCarListByUserId();
    }
  }
};
</script>
<style lang="less" scoped>
.filter {
  height: 88px;
  position: fixed;
  top: 1rem;
  left: 0px;
  width: 100%;
  background-color: #fbfbfc;
  > ul {
    display: flex;
    height: 100%;
    justify-content: space-around;
    align-items: center;
    li {
      font-size: 32px;
      flex: 1 auto;
      text-align: center;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      > i {
        margin-left: 20px;
        margin-top: 2px;
      }
      &:nth-of-type(even) {
        border-left: 1px solid #d9dde4;
        border-right: 1px solid #d9dde4;
      }
    }
  }
}
</style>

