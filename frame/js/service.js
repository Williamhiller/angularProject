/**
 * Created by Williamhiler on 2016/12/6.
 */
angular.module('global.service',[])

    .factory('lotteryService',['$timeout','$rootScope',function ($timeout,$rootScope) {
        var lottery = {
            index:-1,    //当前转动到哪个位置，起点位置
            count:8,    //总共有多少个位置
            timer:0,    //setTimeout的ID，用clearTimeout清除
            speed:100,    //初始转动速度
            times:0,    //转动次数
            cycle:40,    //转动基本次数：即至少需要转动多少次再进入抽奖环节
            prize:-1,    //中奖位置
            init : function () {
                var index = this.index;
                var count = this.count;
                index += 1;
                if (index>count-1) {
                    index = 0;
                };
                /**  改变显示位置 此处是核心，通过改变ng-class位置改变页面显示位置**/
                $rootScope.prize = index;
                this.index=index;
                return false;
            },
            roll : function () {
                lottery.times += 1;
                lottery.init();
                if (lottery.times > lottery.cycle+10 && lottery.prize==lottery.index) {
                    $timeout.cancel(lottery.timer);
                    // 重置
                    lottery.prize=-1;
                    lottery.times=0;
                    $rootScope.isClicked = false;
                    lottery.callback();
                }else{
                    if (lottery.times<lottery.cycle) {
                        // 逐渐减速
                        lottery.speed -= 10;
                    }else{
                        // 判断转动次数以及中奖位置，在最后阶段逐渐减速
                        if (lottery.times > lottery.cycle+10 && ((lottery.prize==0 && lottery.index==7) || lottery.prize==lottery.index+1)) {
                            if(lottery.speed > 200){
                                lottery.speed = 400;
                            }else {
                                lottery.speed += 200;
                            }
                        }else{
                            if(lottery.speed > 200){
                                lottery.speed = 400;
                            }else {
                                lottery.speed += 20;
                            }
                        }
                    }
                    // 速度低于60时通通设为60
                    if (lottery.speed<60) {
                        lottery.speed=60;
                    };
                    // console.log(lottery.times+'^^^^^^'+lottery.speed+'^^^^^^^'+lottery.prize);
                    lottery.timer = $timeout(lottery.roll,lottery.speed);
                }
                return false;
            }
        };
        return {
            drawLottery : function (prize,callback) {
                lottery.prize = prize; //设置中奖位置，后台获取
                lottery.speed = 100; //防止多次抽奖后速度变慢
                lottery.callback=callback;
                lottery.roll(); //执行
            }
        }
    }])
    // 共通后台调用Service
    .factory('commonRemoteService', ['$http', '$q', function($http, $q) {
        // 调用远程接口
        this.remote = function(url, paramForm){
            // 声明延后监控
            var deffered = $q.defer();
            var param = typeof paramForm == 'object' ? $.param(paramForm) : null;
            $http.post(url, param).success(function(result){
                deffered.resolve(result);
            }).error(function(result){
                deffered.reject(result);
            })
            return deffered.promise;
        };
        return this;
    }])
    .factory('validateService',['$timeout','$ionicPopup',function($timeout,$ionicPopup){
        var format = {
            has: {
                special: /[。~\+\\\/\?\|:\.<>{}()';="]/,
                number: /[0-9]+/,
                letter: /[a-zA-Z]+/,
                lowerletter: /[a-z]+/,
                userName: /^[\u4E00-\u9FA5]{2,5}$/,
                idcard: /(^\d{15}$)|(^\d{17}([0-9]|x|X)$)/
            }
        }
        var validate={
            mobileNo:{
                formats: ["require", "phoneFormat"],
                messages: ["手机号不能为空", "请输入正确的手机号码"]
            },
            password: {
                formats: ["require", "passwordFormat"],
                messages: ["密码不能为空", "密码需为6-16位字母和数字的组合"]
            },
            phoneCode: {
                formats: ["require", "phoneCodeFormat"],
                messages: ["验证码不能为空", "验证码必须是6位数字"]
            },
            invitationCode: {
                formats: ["require"],
                messages: ["邀请码不能为空"]
            },
            tradePassword:{
                formats: ["require", "tradePasswordFormat"],
                messages: ["交易密码不能为空", "密码需为6-16位字母和数字的组合"]
            },
            amount:{
                formats: ["require", "amountFormat"],
                messages: ["金额不能为空", "金额格式不正确"]
            },
            userName:{
                formats: ["require", "userNameFormat"],
                messages: ["姓名不能为空", "请填写真实姓名"]
            },
            idcard:{
                formats: ["require", "idcardFormat"],
                messages: ["身份证号不能为空", "请填写正确的身份证号"]
            },
            bankcard:{
                formats: ["require", "bankcardFormat"],
                messages: ["银行卡号不能为空", "请填写正确的银行卡号"]
            },
            bankId:{
                formats: ["require"],
                messages: ["请选择所属银行"]
            },
            email:{
                formats: ["require", "emailFormat"],
                messages: ["邮箱不能为空", "请填写正确的邮箱地址"]
            },
            method:{
                baseCheck:function(checkValue,formats,message){
                    for(var i=0;i<formats.length;i++){
                        //动态调用验证
                        if (typeof this[formats[i]] == "function"){
                            if(!this[formats[i]](checkValue)){
                                return message[i];
                            }
                        }
                    }
                    return null;
                },
                require :function(val){
                    return val!=null&&val!="";
                },
                phoneFormat : function(val){
                    var reg = /^(((12[0-9]{1})|(13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(147))+\d{8})$/;
                    return val.match(reg)!=null
                },
                passwordFormat : function(val){
                    var reg01 = format.has.special ; //特殊字符
                    var reg02 = format.has.number ;  //数字
                    var reg03 = format.has.letter;  //英文字母
                    return (val.length>=6&&val.length<=16)&& (val.match(reg01)!=null||val.match(reg02)!=null)&&(val.match(reg02)!=null||val.match(reg03)!=null)&&(val.match(reg01)!=null||val.match(reg03)!=null);
                },
                phoneCodeFormat : function(val){
                    return val.length == 6;
                },
                tradePasswordFormat :function(val){
                    var reg01 = format.has.special ; //特殊字符
                    var reg02 = format.has.number ;  //数字
                    var reg03 = format.has.letter;  //英文字母
                    return (val.length>=6&&val.length<=16)&& (val.match(reg01)!=null||val.match(reg02)!=null)&&(val.match(reg02)!=null||val.match(reg03)!=null)&&(val.match(reg01)!=null||val.match(reg03)!=null);
                },
                amountFormat : function(val){
                    val = val.toString();
                    var reg = /^-?([1-9]\d*|[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/;
                    return val.match(reg)!=null
                },
                userNameFormat : function(val){
                    return val.match(format.has.userName)!=null;
                },
                idcardFormat : function(val){
                    return val.match(format.has.idcard)!=null;
                },
                bankcardFormat : function(val){
                    // 只接受空格、数字和破折号
                    if ( /[^0-9 \-]+/.test(val)) {
                        return false;
                    }
                    var nCheck = 0,
                        nDigit = 0,
                        bEven = false,
                        n, cDigit;

                    val = val.replace(/\D/g, "");

                    // 最小和最大长度验证
                    if (val.length < 13 || val.length > 19) {
                        return false;
                    }
                    for (n = val.length - 1; n >= 0; n--) {
                        cDigit = val.charAt(n);
                        nDigit = parseInt(cDigit, 10);
                        if ( bEven ) {
                            if ((nDigit *= 2) > 9) {
                                nDigit -= 9;
                            }
                        }
                        nCheck += nDigit;
                        bEven = !bEven;
                    }

                    return (nCheck % 10) === 0;
                },
                emailFormat : function(val){
                    var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    return val.match(reg);
                }
            }
        }
        return {
            check: function (validateForm,validateGroup) {
                for (var i = 0; i < validateGroup.length; i++) {
                    //var _validate = validateGroup[i]
                    var checkName = validateGroup[i];
                    var checkValue = validateForm[checkName];
                    var checkValidate = validate[checkName];
                    var formats = checkValidate.formats;
                    var message = checkValidate.messages
                    var err_message = validate.method.baseCheck(checkValue,formats,message);
                    if(err_message!=null){
                        return err_message;
                    }
                }
            },
            showError:function(err_message){
                if(err_message!=null&&err_message!=""){
                    var alertPopup = $ionicPopup.alert({
                        title: '温馨提示!',
                        template: err_message,
                        okText : '确定',
                        okType : 'button-positive'
                    });
                    $timeout(function() {
                        alertPopup.close(); //1秒后关闭弹出
                    }, 5000);
                    $timeout(function() {
                        document.onclick = function () {
                            alertPopup.close();
                            document.onclick = null
                        }
                    },100);
                }
            },
            showConfirm : function (title,msg,button) {
                var alertPopup = $ionicPopup.show({
                    title: title,
                    template:   '<textarea readonly auto-height>'+msg+'</textarea>',
                    buttons : button
                });
                return alertPopup;
            }
        }
    }])
.directive('autoHeight',[function () {
    return {
        restrict: 'EA',
        replace : false,
        link: function(scope, element) {
            element.css('height',element[0].scrollHeight);
            element.bind('input',function () {
                element.css('height',element[0].scrollHeight)
            })
        }
    };
}])