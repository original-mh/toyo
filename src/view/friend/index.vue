<template>
  <div class="friend" ref="funVue">
    <app-header :title="title" :clickRight="clickRight"></app-header>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :error.sync="errorFlag"
        :error-text="errorText"
      >
        <friend-item
          v-for="item in friendArr"
          :user="user"
          :key="item.id"
          :item="item"
          @opFriend="opFriend"
          @itemClick="itemClick"
        ></friend-item>
      </van-list>
    </van-pull-refresh>
    <fun-vue v-show="isfunVue" @qrCodeClick="qrCode" @search="searchFriend"></fun-vue>
    <add-friend v-if="isAdd" @submit="submitFriend"></add-friend>
  </div>
</template>

<script>
import appHeader from "@c/vehicle-header";
import friendItem from "./friend-item";
import funVue from "./function-vue";
import addFriend from "./add-friend";
export default {
  components: {
    appHeader,
    friendItem,
    funVue,
    addFriend
  },
  data() {
    return {
      title: "好友",
      friendArr: [],
      isLoading: false,
      loading: false,
      finished: false,
      isfunVue: false,
      isAdd: false,
      clickRight: this.clickRightFun,
      user: {},
      par: {
        pageIndex: 0,
        pageSize: 10
      },
      errorFlag: false,
      errorText: "请求失败，点击重新加载"
    };
  },
  beforeDestroy() {
    window.$vm.$off(this.$route.meta.overlay, this.closeFull);
    window.$vm.$off("reFriend", this.onRefresh);
  },
  mounted() {
    this.initView();
    setTimeout(() => {
      this.addChecked(); //开启监控事件
    }, 1);
  },
  methods: {
    itemClick(currentItem) {
      this.friendArr.forEach(item => {
        // if (item.id == currentItem.id)
        item.show = false;
      });
      currentItem.show = true;
    },
    opFriend(status) {
      if (status == 2) {
        this.$toast.success("添加好友成功");
      } else {
        this.$toast.success("拒绝好友成功");
      }
    },
    submitFriend(phone, name) {
      this.addFriend(
        {
          userId: this.user.userid,
          friendPhoneNumber: phone,
          friendActualName: name
        },
        true
      );
    },
    searchFriend() {
      this.isfunVue = false;
      setTimeout(() => {
        this.isAdd = true;
      }, 1);
    },
    qrCode() {
      this.closeFull();
      this.$closeFull();
      this.$native.jumpToQRCode().then(data => {
        try {
          let res = JSON.parse(data.RESULT);
          // alert("扫描结果" + res);
          this.addFriend(res);
        } catch (error) {
          setTimeout(() => {
            this.$toast.fail("请扫描正确的用户二维码（我的→我的二维码）");
          }, 1);
        }
      });
    },
    addFriend(data, isl = false) {
      this.$native.addFriend(data).then(() => {
        setTimeout(() => {
          if (isl) {
            this.closeFull();
            this.$closeFull();
          }
          this.$toast.success("好友申请已发送");
        }, 1);
      });
    },
    addChecked() {
      //监控全局事件
      window.$vm.$on(this.$route.meta.overlay, this.closeFull);
      //监控全局事件
      window.$vm.$on("reFriend", this.onRefresh);
    },
    closeFull() {
      //关闭
      this.isfunVue = false;
      this.isAdd = false;
    },
    clickRightFun() {
      //开启 检测
      this.$toastFull();
      this.isfunVue = true;
    },
    initView() {
      this.user = this.$cache.getUser();
    },
    getFriendList() {
      const user = this.user;
      this.$native
        .getFriendList({
          UserId: user.userid,
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
      // 加载状态结束
      this.loading = false;
      this.isLoading = false;
      this.finished = false;
      const res = data.JSONResult.FriendRelationList;
      res.forEach(item => {
        item.show = false;
      });
      if (this.par.pageIndex == 1) {
        this.friendArr = res;
      } else {
        this.friendArr = this.friendArr.concat(res);
      }
      //到底了
      if (this.par.pageSize > res.length) this.finished = true;
    },
    onRefresh() {
      this.par.pageIndex = 1;
      // setTimeout(() => {
      this.getFriendList();
      // }, 5000);
    },
    onLoad() {
      this.par.pageIndex++;
      this.getFriendList();
    }
  }
};
</script>
<style lang="less" scoped>
</style>
