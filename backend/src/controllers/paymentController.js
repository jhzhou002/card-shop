const { Payment, Order, PaymentMethod } = require('../models')
const QRCode = require('qrcode')
const crypto = require('crypto')

class PaymentController {
  // 获取支付方式列表
  async getMethods(req, res, next) {
    try {
      const methods = await PaymentMethod.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name', 'type', 'config', 'min_amount', 'max_amount', 'fee_rate']
      })

      res.json({
        success: true,
        data: methods
      })
    } catch (error) {
      next(error)
    }
  }

  // 创建支付订单
  async createPayment(req, res, next) {
    try {
      const { order_id, payment_method_id, amount, notify_url, return_url } = req.body
      
      // 验证订单
      const order = await Order.findByPk(order_id)
      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        })
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '订单状态异常，无法支付'
        })
      }

      // 获取支付方式
      const paymentMethod = await PaymentMethod.findByPk(payment_method_id)
      if (!paymentMethod || paymentMethod.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: '支付方式不可用'
        })
      }

      // 验证金额
      if (amount !== order.total_price) {
        return res.status(400).json({
          success: false,
          message: '支付金额与订单金额不匹配'
        })
      }

      // 生成支付单号
      const payment_no = 'P' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
      
      // 创建支付记录
      const payment = await Payment.create({
        payment_no,
        order_id,
        payment_method_id,
        amount,
        status: 'pending',
        notify_url,
        return_url,
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30分钟过期
      })

      // 根据支付方式类型生成支付信息
      let paymentData = {}
      
      if (paymentMethod.type === 'wechat') {
        paymentData = await this.generateWechatPayment(payment, paymentMethod)
      } else if (paymentMethod.type === 'alipay') {
        paymentData = await this.generateAlipayPayment(payment, paymentMethod)
      }

      res.json({
        success: true,
        data: {
          payment_no,
          payment_url: paymentData.payment_url,
          qr_code: paymentData.qr_code,
          expires_at: payment.expires_at
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // 生成微信支付
  async generateWechatPayment(payment, paymentMethod) {
    const config = JSON.parse(paymentMethod.config)
    
    // 生成支付参数 - 基于原项目的微信支付模板
    const paymentParams = {
      appId: config.app_id,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: Math.random().toString(36).substr(2, 15),
      package: `prepay_id=${payment.payment_no}`,
      signType: 'MD5'
    }

    // 生成签名
    const signString = `appId=${paymentParams.appId}&nonceStr=${paymentParams.nonceStr}&package=${paymentParams.package}&signType=${paymentParams.signType}&timeStamp=${paymentParams.timeStamp}&key=${config.key}`
    paymentParams.paySign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase()

    // 生成支付URL
    const payment_url = `/payment/wechat/${payment.payment_no}`
    
    // 生成二维码
    const qr_code = await QRCode.toDataURL(payment_url)

    // 保存支付参数到数据库
    await payment.update({
      payment_data: JSON.stringify(paymentParams)
    })

    return {
      payment_url,
      qr_code,
      payment_params: paymentParams
    }
  }

  // 生成支付宝支付
  async generateAlipayPayment(payment, paymentMethod) {
    const config = JSON.parse(paymentMethod.config)
    
    // 支付宝支付参数
    const paymentParams = {
      app_id: config.app_id,
      method: 'alipay.trade.precreate',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      out_trade_no: payment.payment_no,
      total_amount: payment.amount.toString(),
      subject: `订单支付 - ${payment.payment_no}`
    }

    // 生成支付URL
    const payment_url = `/payment/alipay/${payment.payment_no}`
    
    // 生成二维码
    const qr_code = await QRCode.toDataURL(payment_url)

    // 保存支付参数
    await payment.update({
      payment_data: JSON.stringify(paymentParams)
    })

    return {
      payment_url,
      qr_code,
      payment_params: paymentParams
    }
  }

  // 微信支付页面 - 基于原项目的jsapi.blade.php模板
  async wechatPaymentPage(req, res, next) {
    try {
      const { payment_no } = req.params
      
      const payment = await Payment.findOne({
        where: { payment_no },
        include: [{ model: Order, as: 'order' }]
      })

      if (!payment || payment.status !== 'pending') {
        return res.status(404).json({
          success: false,
          message: '支付订单不存在或已过期'
        })
      }

      const paymentData = JSON.parse(payment.payment_data || '{}')
      const returnUrl = payment.return_url || '/orders'

      // 返回微信支付页面HTML - 基于原项目模板
      const html = `
<!doctype html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>微信支付</title>
</head>
<body>
<script>
    function onBridgeReady(){
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', {
                "appId": "${paymentData.appId}",
                "timeStamp": "${paymentData.timeStamp}",
                "nonceStr": "${paymentData.nonceStr}",
                "package": "${paymentData.package}",
                "signType": "${paymentData.signType}",
                "paySign": "${paymentData.paySign}"
            },
            function(res){
                window.location.href = '${returnUrl}';
            });
    }
    if (typeof WeixinJSBridge == "undefined"){
        if( document.addEventListener ){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }else if (document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
    }else{
        onBridgeReady();
    }
</script>
</body>
</html>`

      res.send(html)
    } catch (error) {
      next(error)
    }
  }

  // 支付宝支付页面
  async alipayPaymentPage(req, res, next) {
    try {
      const { payment_no } = req.params
      
      const payment = await Payment.findOne({
        where: { payment_no },
        include: [{ model: Order, as: 'order' }]
      })

      if (!payment || payment.status !== 'pending') {
        return res.status(404).json({
          success: false,
          message: '支付订单不存在或已过期'
        })
      }

      const paymentData = JSON.parse(payment.payment_data || '{}')
      const returnUrl = payment.return_url || '/orders'

      // 支付宝支付页面
      const html = `
<!doctype html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <title>支付宝支付</title>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h3>支付宝扫码支付</h3>
        <p>订单号：${payment_no}</p>
        <p>支付金额：￥${payment.amount}</p>
        <div style="margin: 20px 0;">
            <img src="data:image/png;base64,${await this.generateQRCode(req.protocol + '://' + req.get('host') + '/payment/alipay/' + payment_no)}" alt="支付二维码" />
        </div>
        <p>请使用支付宝扫描二维码完成支付</p>
        <button onclick="window.location.href='${returnUrl}'">返回订单</button>
    </div>
</body>
</html>`

      res.send(html)
    } catch (error) {
      next(error)
    }
  }

  // 生成二维码数据
  async generateQRCode(url) {
    try {
      const qrCode = await QRCode.toDataURL(url)
      return qrCode.replace('data:image/png;base64,', '')
    } catch (error) {
      return ''
    }
  }

  // 查询支付状态
  async getPaymentStatus(req, res, next) {
    try {
      const { payment_no } = req.params

      const payment = await Payment.findOne({
        where: { payment_no },
        include: [{ model: Order, as: 'order' }]
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: '支付记录不存在'
        })
      }

      res.json({
        success: true,
        data: {
          payment_no: payment.payment_no,
          status: payment.status,
          amount: payment.amount,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          expires_at: payment.expires_at
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // 支付回调处理
  async handleNotify(req, res, next) {
    try {
      const { payment_no, status, transaction_id } = req.body

      const payment = await Payment.findOne({
        where: { payment_no },
        include: [{ model: Order, as: 'order' }]
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: '支付记录不存在'
        })
      }

      // 更新支付状态
      await payment.update({
        status: status === 'success' ? 'paid' : 'failed',
        transaction_id,
        paid_at: status === 'success' ? new Date() : null
      })

      // 如果支付成功，更新订单状态
      if (status === 'success') {
        await payment.order.update({
          status: 'paid',
          paid_at: new Date()
        })
      }

      res.json({
        success: true,
        message: '处理成功'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new PaymentController()