/**
 * Created by Williamhiler on 2016/12/6.
 */

angular.module("global.router",["ionic"])
    .config(function ($stateProvider,$urlRouterProvider) {
        $stateProvider
            .state('tab', {
                url: '',
                abstract: true,
                templateUrl: 'html/tabs.html'
            })
            .state('tab.home', {  // 主页
                url: '/home',
                cache : false,
                views: {
                    'tab_home': {
                        templateUrl: 'html/home/tab_home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('tab.gift', {  // 兑奖中心
                url: '/gift',
                cache : false,
                views: {
                    'tab_gift': {
                        templateUrl: 'html/gift/tab_gift.html',
                        controller: 'GiftCtrl'
                    }
                }
            })
            .state('tab.me', {  // 我的
                url: '/me',
                cache : false,
                views: {
                    'tab_me': {
                        templateUrl: 'html/me/tab_me.html',
                        controller: 'MeCtrl'
                    }
                }
            })
            .state('tab.me_awards', {  // 我的奖品
                url: '/me/awards',
                cache : false,
                views: {
                    'tab_me': {
                        templateUrl: 'html/me/me_awards.html',
                        controller: 'MyAwardCtrl'
                    }
                }
            })
            .state('tab.me_phone', {  // 电话号码
                url: '/me/phone',
                cache : false,
                views: {
                    'tab_me': {
                        templateUrl: 'html/me/me_phone.html',
                        controller: 'MyPhoneCtrl'
                    }
                }
            })
            .state('tab.me_address', {  // 地址
                url: '/me/address',
                cache : false,
                views: {
                    'tab_me': {
                        templateUrl: 'html/me/me_address.html',
                        controller: 'MyAddressCtrl'
                    }
                }
            })


        $urlRouterProvider.otherwise('/home');
    });