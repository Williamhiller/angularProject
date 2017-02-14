/**
 * Created by Williamhiler on 2016/12/6.
 */
angular.module('global.controller', [])

    .controller('HomeCtrl',['$scope','$rootScope','lotteryService','commonRemoteService','validateService',function ($scope,$rootScope,lotteryService,commonRemoteService,validateService) {

        $scope.loadingFlag=true;
        //获取用户首页信息
        var promise = commonRemoteService.remote("appHomeAction.action");
        promise.then(function(result) {
            if ("000" == result.result_code) {
                $scope.data = result.data;
                $scope.loadingFlag =false;
            }else{
                validateService.showError(result.result_msg);
            }
        });

        $rootScope.prize = -1;
        $rootScope.isClicked = false;

        $scope.lottery = function () {

            var promise = commonRemoteService.remote("appHomeAction!getGift.action");
            promise.then(function(result) {
                if ("000" == result.result_code) {
                    $scope.result = result.data;
                    $rootScope.isClicked = true;
                    $scope.data.CAN_PRIZE_COUNT=$scope.data.CAN_PRIZE_COUNT-1>=0?$scope.data.CAN_PRIZE_COUNT-1:0;
                    lotteryService.drawLottery($scope.result.index,function(){
                        if(result.data.adjust_integral>0){
                            $scope.data.TOTAL_INTEGRAL =$scope.data.TOTAL_INTEGRAL+result.data.adjust_integral;
                        }
                        validateService.showError("恭喜您获得了"+$scope.data.GIFIS[$scope.result.index].prize_name+"，可至电竞之家查看！");
                    });
                }else{
                    validateService.showError(result.result_msg);
                }
            });
        }

    }])
    //兑奖中心
    .controller('GiftCtrl',['$scope','commonRemoteService','validateService',function ($scope,commonRemoteService,validateService) {
        //获取用户个人中心
        var promise = commonRemoteService.remote("appGiftAction.action");
        promise.then(function(result) {
            if ("000" == result.result_code) {
                $scope.data = result.data;
            }else{
                validateService.showError(result.result_msg);
            }
        });

        $scope.toTaoBao=function(){
            validateService.showConfirm("温馨提示",
                "【爆炸输出电竞周边】http://e22a.com/h.1Cgzmo?cv=AAkQnLit&sm=e8d351点击链接，再选择浏览器打开；或复制这条信息，打开👉手淘👈￥AAkQnLit￥",
                [{
                text : "确定",
                type: 'button',
                onTap: function(e) {

                }
            }]);
        }

        $scope.exgPrize=function(index){
            var prize = $scope.data.PRIZES[index]
            if(prize.prize_count<=0){
                validateService.showError("奖品兑完啦，如果您喜欢可以点击右上角去购买噢！");
                return;
            }
            validateService.showConfirm(
                "确定兑换？",
                "是否要用"+prize.get_amt+"燃币兑换"+prize.prize_name+"?",
                [
                    {
                        text : "确定",
                        type: 'button',
                        onTap: function(e) {
                            return prize;
                        }
                    },
                    {
                        text: '取消',
                        type: 'cancel-button'
                    }
                ]).then(function(prize){
                    if(prize.get_amt>$scope.data.TOTAL_INTEGRAL){
                        validateService.showError("您的燃币不够。");
                    }else{
                        //开始进入后台兑换礼物
                        var promise = commonRemoteService.remote("appGiftAction!exgPrize.action",{prize_id:prize.prize_id});
                        promise.then(function(result) {
                            //console.log(result)
                            if ("000" == result.result_code) {
                                $scope.data.TOTAL_INTEGRAL = $scope.data.TOTAL_INTEGRAL-prize.get_amt;
                                prize.prize_count--;
                                validateService.showError("恭喜您兑换成功，可至电竞之家查看奖品。");
                            }else{
                                validateService.showError(result.result_msg);
                            }
                        });
                    }
                });
        }
    }])
    //电竞之家
    .controller('MeCtrl',['$scope','commonRemoteService','validateService',function ($scope,commonRemoteService,validateService) {
        //获取用户个人中心
        var promise = commonRemoteService.remote("appMeAction.action");
        promise.then(function(result) {
            if ("000" == result.result_code) {
                $scope.data = result.data;
            }else{
                validateService.showError(result.result_msg);
            }
        });
    }])
    //我的奖品列表
    .controller('MyAwardCtrl',['$scope','commonRemoteService',function ($scope,commonRemoteService) {
        $scope.params = {
            page  : 0,	// 当前页
            rows  : 10,	// 每页件数
            sort  : 'CREATED_DATE',
            order : 'desc'
        }
        $scope.moreflag = true;
        $scope.prizeList = null;

        // 下拉刷新
        $scope.doRefresh = function() {
            $scope.moreflag = true;
            $scope.params.page = 1;
            var promise = commonRemoteService.remote("appMeAction!prizeList.action", $scope.params);
            promise.then(function(result){
                if("000" == result.result_code){
                    $scope.prizeList = result.data.rows;

                    if (result.data.length < $scope.params.rows) {
                        $scope.moreflag = false;
                    }
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        // 上拉加载更多
        $scope.doMore = function() {
            $scope.params.page += 1;
            var promise = commonRemoteService.remote("appMeAction!prizeList.action", angular.copy($scope.params));
            promise.then(function(result){
                console.log(result)
                if("000" == result.result_code){
                    if($scope.prizeList != null&&result.data.total_record>$scope.params.rows){
                        $scope.prizeList = $scope.prizeList.concat(result.data.rows);
                    } else {
                        $scope.prizeList = result.data.rows;
                    }

                    if (result.data.rows.length < $scope.params.rows||result.data.total_record==$scope.params.rows) {
                        $scope.moreflag = false;
                    }
                } else {
                    //validateService.showError(result.result_msg);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        $scope.doRefresh();

    }])
    //我的电话号码
    .controller('MyPhoneCtrl',['$scope','validateService','commonRemoteService','$rootScope',function ($scope,validateService,commonRemoteService,$rootScope) {
        $scope.data={};
        $scope.submit = function() {
            //表单验证
            $scope.err_message = validateService.check($scope.data, ['mobileNo']);
            // 消息显示
            if($scope.err_message != null){
                validateService.showError($scope.err_message);
                return;
            }
            //更新手机号码
            var promise = commonRemoteService.remote("appMeAction!updateUserInfo.action",$scope.data);
            promise.then(function(result) {
                if ("000" == result.result_code) {
                    $rootScope.back();
                }else{
                    validateService.showError(result.result_msg);
                }
            });
        }
    }])
    //我的收获地址
    .controller('MyAddressCtrl',['$scope','validateService','commonRemoteService','$rootScope',function ($scope,validateService,commonRemoteService,$rootScope) {
        $scope.data={};
        $scope.submit = function() {
            //表单验证
            if($scope.data.address==null||$scope.data.address==""){
                $scope.err_message= "请输入收货地址"
            }else{
                if($scope.data.address.length>500){
                    $scope.err_message= "收货地址太长";
                }else{
                    $scope.err_message=null;
                }
            }

            // 消息显示
            if($scope.err_message != null){
                validateService.showError($scope.err_message);
                return;
            }
            //更新手机号码
            var promise = commonRemoteService.remote("appMeAction!updateUserInfo.action",$scope.data);
            promise.then(function(result) {
                if ("000" == result.result_code) {
                    $rootScope.back();
                }else{
                    validateService.showError(result.result_msg);
                }
            });
        }
    }])

