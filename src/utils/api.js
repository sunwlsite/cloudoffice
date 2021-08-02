import axios from "axios"
import {Message} from 'element-ui'
import router from '../router/index.js'

// 创建axios实例, 后面设置拦截器就直接用service, 因为直接在vue.config.js中设置了代理, 这里就不使用这种了
// const service = axios.create({
//     baseURL: process.env.BASE_API, // api的base_url
//     timeout: 5000 // 请求超时时间
// })

/**
 * axios请求拦截器
 *
 * interceptors: 拦截器
 * request:      请求
 * success:      请求成功
 * error:        请求错误
 */
axios.interceptors.request.use(config => {
    // 如果存在token,则后续请求携带这个token
    if (window.sessionStorage.getItem("token")) {
        config.headers['Authorization'] = window.sessionStorage.getItem("token");
    }
    return config
}, error => {
    console.log(error);
})


/**
 * axios响应拦截器
 *
 * interceptors: 拦截器
 * response:     响应
 * success:      响应成功
 * error:        响应错误
 * */
axios.interceptors.response.use(success => {
    // 判断响应码是否存在以及等于200(成功调用后端接口)
    if (success.status && success.status === 200) {
        // 判断返回信息中的code(业务逻辑错误)
        if (success.data.code === 500 || success.data.code === 401 || success.data.code === 403) {
            // 直接返回后端传递过来的错误信息
            Message.error({message: success.data.message});
            return;
        }
        if (success.data.message) {
            Message.success({message: success.data.message})
        }
    }
    // 返回响应对象
    return success.data;
}, error => {
    if (error.response.code === 504 || error.response.code === 404) {
        Message.error({message: "服务器被吃了∑(っ°Д°;)っ"});
    } else if (error.response.code === 403) {
        Message.error({message: "权限不足,请联系管理员!"});
    } else if (error.response.code === 401) {
        Message.error({message: "尚未登录,请登录!"});
        router.replace('/');
    } else {
        if (error.response.data.message) {
            Message.error({message: error.response.data.message});
        } else {
            Message.error({message: "未知错误!"});
        }
    }
    // 响应错误不返回响应对象
    // return;
})


// 前置路径
let base = '';

// 传送json格式的post请求
export const postRequest = (url, params) => {
    return axios({
        // 请求类型
        method: 'post',
        // 请求地址
        url: `${base}${url}`,
        // 请求数据
        data: params
    })
}

// 传送json格式的put请求
export const putRequest = (url, params) => {
    return axios({
        // 请求类型
        method: 'put',
        // 请求地址
        url: `${base}${url}`,
        // 请求数据
        data: params
    })
}

// 传送json格式的get请求
export const getRequest = (url, params) => {
    return axios({
        // 请求类型
        method: 'get',
        // 请求地址
        url: `${base}${url}`,
        // 请求数据
        data: params
    })
}

// 传送json格式的delete请求
export const deleteRequest = (url, params) => {
    return axios({
        // 请求类型
        method: 'delete',
        // 请求地址
        url: `${base}${url}`,
        // 请求数据
        data: params
    })
}
