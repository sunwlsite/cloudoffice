// 代理对象
let proxyObject = {}

// websocket代理
proxyObject['/ws'] = {
    // websocket
    ws: true,
    target: 'ws://localhost:8082'
};

// /表示代理所有的请求
proxyObject['/'] = {
    // websocket
    ws: false,
    // 目标地址
    target: 'http://localhost:8082',
    // 发送请求头host会被设置target
    changeOrigin: true,
    // 不重写请求地址
    pathRewrite: {
        '^/': '/'
    }
};

// 配置默认的访问路径
module.exports = {
    devServer: {
        // 还是访问localhost:8080
        host: 'localhost',
        port: 8080,
        // 根据代理对象将请求转发至localhost:8082
        proxy: proxyObject
    }
}
