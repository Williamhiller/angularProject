/*
 * 微信JS-API
 *
 * 注意：
 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
 * 2. 如果发现在不能分享自定义内容，请到官网下载最新的包覆盖安装。
 * 3. 完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * @author wen.zhang
 */

var wxApi = {
    version: "1.0.0" // 对应微信JS-SDK版本
};

(function (window) {
    var basepath = window.location.origin
    console.log(basepath);
    // 将wxApi暴露到window下：全局可使用，对旧版本向下兼容
    window.wxApi = wxApi;

    /*
     * 智能分享（同时可分享给朋友，朋友圈，QQ，腾讯微博）
     *
     * shareData = {
     * 		title	: '', // 分享标题
     * 		link	: '', // 分享链接
     * 		imgUrl	: '', // 分享图标
     *
     * 		//-------------------- 分享给朋友时独有属性 --------------------
     * 		desc	: '', // 分享描述
     * 		type	: '', // 分享类型,music、video或link，不填默认为link
     * 		dataUrl	: '', // 如果type是music或video，则要提供数据链接，默认为空
     * 		//-------------------- 分享给朋友时独有属性 --------------------
     *
     * 		success	: '', // 接口调用成功时执行的回调函数
     * 		fail	: '', // 接口调用失败时执行的回调函数
     * 		complete: '', // 接口调用完成时执行的回调函数，无论成功或失败都会执行
     * 		cancel	: '', // 用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
     * 		trigger	: ''  // 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口
     * }
     */
    wxApi.share = function(shareData){
        if (typeof(shareData) != "undefined" && shareData != null && shareData != "") {
            wx.onMenuShareAppMessage(shareData);	// 分享给朋友
            wx.onMenuShareTimeline(shareData);		// 分享到朋友圈
            wx.onMenuShareQQ(shareData);			// 分享到QQ
            wx.onMenuShareWeibo(shareData);			// 分享到腾讯微博
        }
        wx.showOptionMenu();	// 显示右上角菜单接口
    };

    /*
     * 分享给朋友
     * 参数同上
     */
    wxApi.shareToFriend = function(shareData){
        if (typeof(shareData) != "undefined" && shareData != null && shareData != "") {
            wx.onMenuShareAppMessage(shareData);
        }
        wx.showOptionMenu();	// 显示右上角菜单接口
    };

    /*
     * 分享到朋友圈
     * 参数同上
     */
    wxApi.shareToTimeline = function(shareData){
        if (typeof(shareData) != "undefined" && shareData != null && shareData != "") {
            wx.onMenuShareTimeline(shareData);
        }
        wx.showOptionMenu();	// 显示右上角菜单接口
    };

    /*
     * Config信息验证失败
     */
    wx.error(function (res) {
        // alert(res.errMsg);

        // console.log(res.errMsg);
        // console.log(res);
    });

    /*
     * JS-SDK使用权限签名
     */
    $.get("jsapiSign.action?time=" + new Date().getMilliseconds(), { "url": window.location.href }, function (result) {
        if (!result.error) {
            // 注入权限验证配置（异步）
            wx.config({
                debug		: false,			// 开启调试模式
                appId		: result.appId,		// 必填，公众号的唯一标识
                timestamp	: result.timestamp,	// 必填，生成签名的时间戳
                nonceStr	: result.nonceStr,	// 必填，生成签名的随机串
                signature	: result.signature,	// 必填，签名
                jsApiList	: [
                    'checkJsApi',				// 判断当前客户端是否支持指定JS接口
                    'onMenuShareTimeline',		// 分享到朋友圈
                    'onMenuShareAppMessage',	// 发送给朋友
                    'onMenuShareQQ',			// 分享到QQ
                    'onMenuShareWeibo',			// 分享到腾讯微博
                    'showOptionMenu',			// 显示右上角菜单接口
                    'hideOptionMenu'			// 隐藏右上角菜单接口
                ]
            });

            // config信息验证成功后会执行ready方法
            wx.ready(function () {
                var shareData = {
                    title : "微信分享",
                    imgUrl : basepath+"/activity/images/lottery_top.png",
                    link : basepath+'/appMain.html',
                    desc : "大家一起来分享啊啊啊啊啊啊"
                };
                //默认分享
                wx.ready(function () {
                    wxApi.shareToFriend(shareData);
                    wxApi.shareToTimeline(shareData);
                });
                console.log("ready")
            });

        } else {
        }
    },"json");
})(window);