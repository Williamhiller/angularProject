/**
 * Created by Williamhiler on 2016/12/6.
 */

angular.module('global',['global.router','global.controller','global.service'])
angular.module('starter', ['ionic','global'])
    .run(["$rootScope","$state",'$location','$ionicLoading','$ionicViewSwitcher','$ionicHistory','$timeout',function($rootScope,$state,$location,$ionicLoading,$ionicViewSwitcher,$ionicHistory,$timeout){
        $rootScope.domain_weburl = window.location.origin+"/image/";
        $rootScope.stateGo = function(statename,base){
            $state.go(statename);
            if(!base) {
                $ionicViewSwitcher.nextDirection("forward");
            }
        };
        $rootScope.back = function (){
            // 检测是否保存有上一个页面的信息  即是否刷新过当前页面
            if($ionicHistory.backView()){
                $ionicHistory.goBack();
            }else {
                $state.go("tab."+$location.path().split('/')[1])
                // history.back();
            }
            $ionicViewSwitcher.nextDirection("back")
        };
        $rootScope.showLoading = function(message,timeout) {
            $ionicLoading.show({
                template: message == null? '拼命加载中...':message,
                duration: timeout  //n毫秒后关闭
            });
        };
        $rootScope.hideLoading = function(){
            $ionicLoading.hide();
        };
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            //是否隐藏tabs
            // if(!angular.isUndefined(toState.data)&& toState.data.hideTabs){
            //     $rootScope.hideTabs = true;
            // }else{
            //     $rootScope.hideTabs = false;
            // }
        })
        //$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        //    $timeout(function () {
        //        var $body = $('body');
        //        document.title = $ionicHistory.currentTitle()||"半燃幸运九宫格";
        //        var $iframe = $("<iframe src='/favicon2.ico'></iframe>");
        //        $iframe.on('load',function() {
        //            setTimeout(function() {
        //                $iframe.off('load').remove();
        //            }, 0);
        //        }).appendTo($body);
        //    },10)
        //});

    }])
    // 自定义过滤器
    .filter("splitBy", [function () {
        return function (input, type, value) {
            function phone(type) {
                return type = type || " ", input.replace(/\s/g, "").replace(/(\d{3})/, "$1" + type).replace(/(\d{4})/, "$1" + type)
            }
            function bankcard(type) {
                return type = type || " ", input.replace(/\s/g, "").replace(/(\d{4})/g, "$1" + type)
            }
            //手机号码格式处理
            function phoneReplace(type) {
                return type = input.replace(/(\d{3})(\d{4})(\d{4})/,"$1****$3");
            }
            //姓名格式处理
            function realnameReplace(type){
                return type = "**"+input.substr(input.length-1,input.length)
            }
            //地址处理
            function addressReplace(type){
                return type = input.substr(0,input.length<6?input.length:6)+(input.length<6?"":"**");
            }
            return input = input ? "" + input : "", "phone" == type ? phone(value) : "bankcard" == type ? bankcard(value) : "phoneReplace" == type ? phoneReplace(value) :"realnameReplace" == type ? realnameReplace(value) : "addressReplace" == type ? addressReplace(value) :"";
        }
    }])
    //微信的分享-分裂营销
    .directive('wxshare', function() {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                count : '='
            },
            template: '',
            controller: function($scope, $element,$location,commonRemoteService,validateService){
                var basepath = window.location.origin
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
                    $.get("jsapiSign.action?time=" + new Date().getMilliseconds(), { "url": $location.absUrl() }, function (result) {
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
                                    title : "老板说：送英雄联盟玩家点卷，守望先锋玩家战网点数。老板疯了，妈的智障，骚年，还等什么？",
                                    imgUrl : basepath+"/activity/frame/images/share.jpg",
                                    link : basepath+'/activity/appMain.html',
                                    desc : "老板说：送英雄联盟玩家点卷，守望先锋玩家战网点数。老板疯了，妈的智障，骚年，还等什么？",
                                    success:function(){
                                        //分享成功后的回调函数
                                        var promise = commonRemoteService.remote("appHomeAction!share.action");
                                        promise.then(function(result) {
                                            if ("000" == result.result_code) {
                                                if(result.data.TODAY_SHARE_COUNT==0){
                                                    validateService.showError("分享成功，抽奖机会+1。");
                                                    $scope.count=$scope.count+1;
                                                }
                                            }else{
                                                validateService.showError(result.result_msg);
                                            }
                                        });
                                    }
                                };
                                var shareDataToFriend = {
                                    title : "老板疯了，妈的智障？",
                                    imgUrl : basepath+"/activity/frame/images/share.jpg",
                                    link : basepath+'/activity/appMain.html',
                                    desc : "老板说：送英雄联盟玩家点卷，守望先锋玩家战网点数。老板疯了，妈的智障，骚年，还等什么？"
                                };
                                wxApi.shareToFriend(shareDataToFriend);
                                wxApi.shareToTimeline(shareData);
                            });

                        } else {
                        }
                    },"json");
                })(window);
                var init = function(){
                    //var shareData = {
                    //    title : "微信分享",
                    //    imgUrl : basepath+"/activity/frame/images/person.png",
                    //    link : basepath+'/activity/appMain.html',
                    //    desc : "大家一起来分享啊啊啊啊啊啊"
                    //};
                    ////默认分享
                    //wx.ready(function () {
                    //    wxApi.shareToFriend(shareData);
                    //    wxApi.shareToTimeline(shareData);
                    //});
                }
                init();
            }
        }
    })
    // // 安卓tabs自动在上边 设置统一在底部
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider,$httpProvider) {
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('left');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
        $httpProvider.defaults.timeout = 120000;
        //监听httpresponse
        // $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.defaults.headers.post = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        };
    });

