<template>
  <div class="search-friend">
    <p class="title">添加好友</p>
    <div class="form-input">
      <div class="input">
        <input type="text" placeholder="手机号" v-model="phone" maxlength="11">
      </div>
      <div class="input">
        <input type="text" placeholder="姓名" v-model="name">
      </div>
    </div>
    <p class="error" v-show="msg != ''">
      <i class="my-icon icon-error"></i>
      <span>{{msg}}</span>
    </p>
    <button class="but" @click="submit">申请添加</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      phone: "",
      name: "",
      msg: ""
    };
  },
  methods: {
    submit() {
      const phone = this.phone,
        name = this.name,
        user = this.$cache.getUser();
      if (!phone) {
        this.msg = "请输入手机号";
      } else if (!window.isPoneAvailable(phone)) {
        this.msg = "请输入合法的手机号";
      } else if (!name) {
        this.msg = "请输入姓名";
      } else if (!this.$$checkName(name)) {
        this.msg = "姓名不能包含特殊字符";
      } else if (phone == user.phonenumber) {
        this.msg = "无法向自己发出申请";
      } else if (phone == user.phonenumber && name == user.actualname) {
        this.msg = "无法向自己发出申请";
      } else {
        this.msg = "";
        this.$emit("submit", phone, name);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.search-friend {
  text-align: center;
  // display: flex;
  height: 630px;
  width: 659px;
  position: fixed;
  z-index: 3333;
  top: 320.4px;
  left: 45px;
  background-color: #fff;
  border: 1px solid #979797;
  border-radius: 8px;
  > .title {
    width: 100%;
    font-size: 32px;
    color: #383b41;
    text-align: center;
    padding-top: 51.6px;
  }
  > .form-input {
    padding-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .input {
      // opacity: 0.5;
      background: #eaecf0;
      border: 1px solid #a5adbb;
      border-radius: 4px;
      width: 540px;
      height: 88px;
      margin-bottom: 15px;
      padding-left: 30px;
      display: flex;
      align-items: center;
      > input {
        background-color: transparent;
        font-size: 28px;
        color: #383b41;
        width: 533px;
      }
    }
  }
  > button {
    margin-top: 30px;
  }
  .icon-error {
    vertical-align: sub;
  }
}
</style>
