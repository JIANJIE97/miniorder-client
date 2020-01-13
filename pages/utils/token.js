import {
  Config
} from 'config.js';

class Token {
  constructor() {
    this.verifyUrl = Config.restUrl + 'token/verify';
    this.tokenUrl = Config.restUrl + 'token/user';
  }
  //验证登录
  verify() {
    //console.log('验证登录');
    var token = wx.getStorageSync('token');
    //判断token是否为空
    if (!token) {
      //为空重新请求token
      this.getTokenFromServer();
    } else {
      //非空通过服务器API检测token
      this._verifyFromServer(token);
    }
  }
  //通过服务器请求token
  getTokenFromServer(callBack) {
    //console.log('token为空重新请求token');
    var that = this;
    wx.login({
      //登陆获取code码
      success: function(res) {
        console.log("code:"+res.code);
        //访问服务器API
        wx.request({
          url: that.tokenUrl,
          method: 'POST',
          data: {
            code: res.code
          },
          success: function(res) {
            var code = res.statusCode.toString();
            //code使用过了一次重新登录获取code码
            if(code=='400'){
              console.log('请求token失败,code码使用过了');
            }else{
              //console.log('请求token成功');
              wx.setStorageSync('token', res.data.token);
              callBack && callBack(res.data.token);
            }
          }
        });
      }
    })
  }

  //携带token令牌去服务器API校验token令牌
  _verifyFromServer(token) {
    console.log("token:"+token);
    var that = this;
    wx.request({
      url: that.verifyUrl,
      method: 'POST',
      data: {
        token: token
      },
      success: function(res) {
        //如果token无效再去服务器获取token
        var valid = res.data.isValid;
        if (!valid) {
          that.getTokenFromServer();
        }
      }
    });
  }
}

export {
  Token
};