
import android from '../bridge';
// eslint-disable-next-line no-unused-vars
import pc from './pc';
var native = android
var ua = navigator.userAgent, pf = navigator.platform;
var platform = {};
platform.android = ua.indexOf("Android") > -1;
platform.iPhone = ua.indexOf("iPhone") > -1;
platform.iPad = ua.indexOf("iPad") > -1;
platform.iPod = ua.indexOf("iPod") > -1;
platform.winPhone = ua.indexOf("IE") > -1;
platform.PC = pf == 'MacIntel' || pf == 'Win32';
window.console.log(ua, platform);
window.identity = '';
if (platform.PC) {
    native = pc;
    window.identity = 'pc';
    // export { native }
}


(function (window) {

    window['$error'] = function (data) { //处理失败请求 
        window.$vm.$native.loadHide();
        if (data)
            window.$vm.$toast(data);
        // document.write(data);
    }
    window['filterInput'] = function (val, ch = false) {
        if (ch) {
            // eslint-disable-next-line no-useless-escape
            return val.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\ ]/g, '')
        }

        // eslint-disable-next-line no-useless-escape
        return val.replace(/[^\a-\z\A-\Z0-9\ ]/g, '')
    }
    window.isPoneAvailable = function ($poneInput) {
        var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test($poneInput)) {
            return false;
        } else {
            return true;
        }
    }
    window.showLoading = function (text) {
        window.$vm.$toast.loading({
            mask: true,
            message: text,
            duration: 0,
            loadingType: 'spinner',
            forbidClick: true, // 禁用背景点击
        });
    },
        window.clearLoading = function () {
            setTimeout(() => {
                window.$vm.$toast.clear()
            })
        }
    // 时间格式化
    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        }

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };


}(window))

let firstApp = null;
window['$appBack'] = function (isforce = false) {
    const call = window['appBackCall']();
    window.console.log(call);
    if (!call) {
        return false;
    }
    const r = window.$vm.$route,
        closeApp = r.meta.closeApp; //是否关闭app
    const isFull = window.$vm.$isfull();
    window.console.log(isFull);
    if (isFull) {
        window.$vm.$closeFull();//关闭全屏
        return;
    }
    else if (r.name == 'switch') {
        window.$vm.$router.replace('/login');
        return;
    }
    else if (closeApp) {

        //首次按键，提示  再按一次退出应用
        if (!firstApp) {
            firstApp = new Date().getTime();//记录第一次按下回退键的时间
            window.$vm.$toast('再次按返回键退出应用');//给出提示
            // history.go(-1)//回退到上一页面
            setTimeout(function () {//1s中后清除
                firstApp = null;
            }, 1000);
        } else {
            // alert('关闭');
            if (new Date().getTime() - firstApp < 3000) {//如果两次按下的时间小于1s，
                //调用原生的方法 关闭app
                // alert('关闭');
                window.$vm.$native.run('finish', '', '');
                window.console.log('关闭app')
                return false
            }
        }

    }
    else {
        //特殊页面处理 查看档案
        if (window.$vm.$route.name == 'seefile' && !isforce) {
            //警告 是否要退出
            window.$vm.$emit('tipsBackSee');
            return;
        }
        //特殊页面处理 答题页面
        if (window.$vm.$route.name == 'answer' && !isforce) {
            //警告 是否要退出
            window.$vm.$emit('tipsBack');
            return;
        }
        //特殊页面处理 答题页面
        if (window.$vm.$route.name == 'identificationreport' && !isforce && r.query.type == 1) {
            //警告 是否要退出
            window.$vm.$emit('tipsReportBack');
            return;
        }
        window.$vm.$closeFull();
        window.$vm.$router.go(-1)
        // console.log($vm.$router);
    }
}
window['appBackCall'] = function () {
    return true;
};
export { native }
