<template>
  <div class="his-use">
    <app-header :title="title" :leftArrow="leftArrow"></app-header>
    <div class="had">
      <van-swipe :autoplay="0" @change="onChange" indicator-color="white" ref="$swipe">
        <van-swipe-item v-for="item in arr" :key="item.id">
          <div class="itme-con">
            <div class="item-con-body">
              <div class="img">
                <app-img :url="item.brandmodelnumber"></app-img>
              </div>
              <div class="item-con-text">
                <p class="name">{{item.brandmodelnumber}}</p>
                <p class="chepai">车牌：{{item.platenumber}}</p>
              </div>
            </div>
            <div class="item-con-car">
              <p>型号: {{item.brandmodelnumber}} &nbsp;&nbsp;|&nbsp;&nbsp;排量: {{item.displacement}}&nbsp;&nbsp;|&nbsp;&nbsp; 颜色: {{item.color}}</p>
            </div>
          </div>
        </van-swipe-item>
        <div class="custom-indicator" slot="indicator">
          <i class="my-icon icon-prev" @click="switchSwipe(false)"></i>
          <i class="my-icon icon-next1" @click="switchSwipe(true)"></i>
        </div>
      </van-swipe>
    </div>
    <div class="filter">
      <ul>
        <li @click="carStatusFun">
          {{carStatus.text}}
          <i class="my-icon icon-down"></i>
        </li>
        <li @click="carFilterDateFun">
          <span v-if="currentDate !=''">{{currentDate | formatDate('yyyy-MM')}}</span>
          <span v-else>全部时段</span>
          <i class="my-icon icon-down"></i>
        </li>
      </ul>
    </div>
    <div class="his-use-list">
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :error.sync="errorFlag"
          :error-text="errorText"
        >
          <div class="his-use-list-item" v-for="item in hisArr" :key="item.id">
            <p class="jieche">
              <i class="my-icon icon-jieche"></i>
              <span v-if="carStatus.id == 1 ">借车人：{{item.actualName}}</span>
              <span v-else-if="carStatus.id == 2 ">车主：{{item.actualName}}</span>
              <!-- 借出方 -->
              <span v-else-if="user.userid == item.fromUserId">借车人：{{item.actualName}}</span>
              <!-- 借入方 -->
              <span v-else>车主：{{item.actualName}}</span>
            </p>
            <p class="endtiem">
              <i class="my-icon icon-endtime"></i>
              <span>结束用车：{{ item.borrowToTime | timeStamp('yy/MM/dd hh:mm') }}</span>
            </p>
          </div>
        </van-list>
      </van-pull-refresh>
      <van-popup v-model="ispicker" position="bottom" :overlay="true" @click-overlay="clickOverlay">
        <van-picker
          show-toolbar
          title
          :columns="columns"
          @change="onPopUpChange"
          @confirm="onPickerConfirm"
          @cancel="onPickerCancel"
          @click-overlay="clickOverlay"
        />
      </van-popup>
      <van-popup
        v-model="ispickerDate"
        position="bottom"
        :overlay="true"
        @click-overlay="clickOverlayDate"
      >
        <van-datetime-picker
          @confirm="onPickerConfirmDate"
          @cancel="onPickerCancelDate"
          v-model="currentModelDate"
          type="year-month"
          :min-date="minDate"
          :formatter="formatter"
          :max-date="maxDate"
        />
      </van-popup>
    </div>
  </div>
</template>

<script>
import appHeader from "@c/vehicle-header";
import { carStatusArr } from "@dist/status";
import appImg from "@c/app-carimg";
export default {
  components: {
    appHeader,
    appImg
  },
  data() {
    return {
      columns: carStatusArr,
      currentModelDate: new Date(),
      maxDate: new Date(),
      currentDate: "",
      // carStatusArr: [{ id: 1, text: "借出" }, { id: 2, text: "借入" }],
      ispicker: false,
      ispickerDate: false,
      minDate: this.$minDate,
      title: "历史用车",
      leftArrow: true,
      arr: [],
      isLoading: false,
      loading: true,
      finished: false,
      par: {
        pageIndex: 0,
        pageSize: 20
      },
      user: {},
      hisArr: [],
      currentItem: null,
      formatter: this.$dateFormatter,
      carStatus: {},

      errorFlag: false,
      errorText: "请求失败，点击重新加载"
    };
  },
  mounted() {
    this.user = this.$cache.getUser();
    this.carStatus = this.columns[0];
    this.getHistoricalVehicleList();
  },
  methods: {
    carFilterDateFun() {
      this.ispickerDate = true;
    },
    carStatusFun() {
      // this.columns = carStatusArr;
      this.ispicker = true;
    },
    onPopUpChange() {},
    onPickerConfirm(value) {
      this.carStatus = value;
      this.getHistoricalVehicleRecordList();
      this.clickOverlay();
    },
    onPickerCancel() {
      this.clickOverlay();
    },
    onPickerConfirmDate(value) {
      this.currentDate = value;
      this.getHistoricalVehicleRecordList();
      this.clickOverlayDate();
    },
    onPickerCancelDate() {
      this.clickOverlayDate();
    },
    clickOverlay() {
      this.$toastFull.isBack = false;
      this.ispicker = false;
    },
    clickOverlayDate() {
      this.$toastFull.isBack = false;
      this.ispickerDate = false;
    },
    onChange(index) {
      this.currentItem = this.arr[index];
      this.onRefresh();
    },
    getHistoricalVehicleList() {
      const user = this.user;
      this.$native
        .getHistoricalVehicleList({
          userId: user.userid
        })
        .then(data => {
          this.arr = data.JSONResult.CarInfoList;

          if (this.arr.length == 0) {
            this.loading = false;
            this.finished = true;
            return;
          }
          let swipe = this.$refs.$swipe;
          swipe.swipeTo(0);
          this.onChange(0);
          // this.loading = this.arr.length ? true : false;
        });
    },
    getHistoricalVehicleRecordList() {
      const user = this.user,
        param = this.currentItem;
      let par = {
        userId: user.userid,
        likeDate: "",
        carId: param.carid,
        borrowCarState: this.carStatus.id == 0 ? "" : this.carStatus.id,
        currPage: this.par.pageIndex
      };
      if (!par.carId || this.arr.length == 0) {
        this.loading = false;
        this.finished = true;
        return;
      }
      if (this.currentDate != "") {
        par.likeDate = this.$$formatDate(this.currentDate, "yyyy-MM");
      } else {
        delete par.likeDate;
      }
      this.$native.getHistoricalVehicleRecordList(par).then(data => {
        this.setUseArr(data);
      });
    },
    setUseArr(data) {
      // 加载状态结束
      this.loading = false;
      this.isLoading = false;
      this.finished = false;
      const res = data.JSONResult.HistoricalVehicleRecordList;
      // console.log(this.$$timeStamp(res[0].borrowToTime, "yy-MM-dd hh:mm"));
      if (this.par.pageIndex == 1) {
        this.hisArr = res;
      } else {
        this.hisArr = this.hisArr.concat(res);
      }
      //到底了
      if (this.par.pageSize > res.length) this.finished = true;
    },
    onRefresh() {
      this.par.pageIndex = 1;
      this.getHistoricalVehicleRecordList();
    },
    onLoad() {
      this.par.pageIndex++;
      this.getHistoricalVehicleRecordList();
    },
    switchSwipe(flag) {
      /* eslint-disable */
      console.log(this.$refs.$swipe, flag);
      let swipe = this.$refs.$swipe,
        index = swipe.active;
      if (flag) {
        index++;
      } else {
        index--;
      }
      this.currentItem = this.arr[index];
      swipe.swipeTo(index);
    }
  }
};
</script>

<style lang="less">
.van-nav-bar--fixed {
  z-index: 4 !important;
}
.his-use {
  &-list {
    padding-top: 480px;
    &-item {
      height: 98px;
      border-bottom: 1px solid #cbcdd0;
      display: flex;

      justify-content: space-around;
      //   align-items: center;
      line-height: 98px;
      .jieche {
        width: 250px;
      }
      &:nth-of-type(even) {
        background: rgba(203, 205, 208, 0.1);
        // opacity: 0.1;
      }
      i {
        width: 32px;
        height: 32px;
        margin-right: 5px;
        background-size: 100%;
      }
    }
  }
  .van-swipe {
  }
  .item-con-text {
    // width: 294px;
    // padding: 20px 0px;
    padding-left: 20px;
    > .name {
      font-size: 36px;
      color: #414246;
      letter-spacing: 0;
    }
    > .chepai {
      font-size: 28px;
      color: #383b41;
      letter-spacing: 1.17px;
    }
  }
  .van-swipe-item {
    display: flex;
    // height: 305px !important;
    padding-bottom: 20px;
    justify-content: center;
    background: white;
  }
  //   .my-indicator {
  //     position: absolute;
  .icon-prev {
    left: 20px;
  }
  .icon-next1 {
    left: 685px;
  }
  .icon-prev,
  .icon-next1 {
    position: absolute;
    z-index: 2;
    top: 60px;
  }
  .filter {
    height: 88px;
    top: 5.3rem;
    position: fixed;
    left: 0px;
    width: 100%;
    z-index: 2;
    background-color: #fafbfc;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: #d9dde4;
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
        border-right: 1px solid #d9dde4;
        background-color: #fbfbfc !important;
        > i {
          margin-left: 20px;
          margin-top: 2px;
        }
        &:last-child {
          border-right: 0px;
        }
      }
    }
  }
  .icon-endtime,
  .icon-jieche {
    width: 32px;
    height: 32px;
  }
  //   }
}
// .fil {
//   height: 335px;
// }
.had {
  min-height: 335px;

  position: fixed;
  z-index: 2;
  width: 100%;
}
.itme-con {
  width: ceil(317.5px + 380px) !important;

  .item-con-body {
    justify-content: center;
    display: flex;
    align-items: center;
    // width: 611px;
    height: 241px;
    > .img {
      width: 317.5px;
      // height: 200px;
      padding: 5px;
      background-color: transparent;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .item-con-car {
    width: 100%;

    text-align: center;
    p {
      // font-size: 24px;
      color: #a5adbb;
      // line-height: 35px;
    }
  }
}
.van-list {
  min-height: 400px;
}
</style>
