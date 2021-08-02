import axios from 'axios'

const service = axios.create({
    // 响应类型, 下载文件返回的数据是二进制流的形式,所以这里设置一下responseType = arraybuffer
    responseType: 'arraybuffer',
    // baseURL: process.env.BASE_API,
    // timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(config => {
    // 如果存在token,则后续请求携带这个token
    if (window.sessionStorage.getItem("token")) {
        config.headers['Authorization'] = window.sessionStorage.getItem("token");
    }
    return config
}, error => {
    console.log(error);
})

// 响应拦截器
service.interceptors.response.use(response => {
    const headers = response.headers;
    console.log(headers);
    // 正则表达式 - 有可能返回的形式是JSON字符串
    let jsonReg = RegExp(/application\/json/);
    let streamReg = RegExp(/application\/octet-stream/);
    // 报文头部Content-Type匹配正则
    if (headers['content-type'].match(jsonReg)) {
        console.log("正常请求==>");
        response.data = unitToString(response.data);
    }
    if (headers['content-type'].match(streamReg)) {
        console.log("下载请求==>");
        // 获取文件下载插件
        let fileDownLoad = require('js-file-download');
        // 从响应头中获取信息
        // 文件名  content-disposition: attachment;filename=%E5%91%98%E5%B7%A5%E8%A1%A8.xls
        let fileName = headers['content-disposition'].split(';')[1].split('filename=')[1];
        // 响应类型  application/octet-stream;charset=UTF-8
        let contentType = headers['content-type'];
        // 转换文件名, 如果不转换,当文件名是中文,有可能出现乱码
        fileName = decodeURIComponent(fileName);
        // 通过js-file-download插件下载文件
        fileDownLoad(response.data, fileName, contentType);
    }
}, error => {
    console.log(error);
})

// 将返回数据转为JSON字符串对象
function unitToString(data) {
    let encodeString = String.fromCharCode.apply(null, new Uint8Array(data));
    let decodeString = decodeURIComponent(escape(encodeString));
    return JSON.parse(decodeString);
}

// 前置路径
let base = '';

// 封装get下载请求
export const downloadRequest = (url, params) => {
    return service({
        method: 'get',
        url: `${base}${url}`,
        data: params
    });
}

export default service;
