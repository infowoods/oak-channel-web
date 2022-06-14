import http from '../../services/http/amo'

// 授权
export function oakAuth(data) {
  return http.post('/oauth/mixin', { data })
}


// 获取用户 oak 列表
export function getTopicsList(data) {
  return http.get('/oth/topics', { data })
}


// 获取主题详情
export function getTopicDetails(id) {
  return http.get(`/oth/topics/${id}`)
}


// 获取主题 token
export function getTopicToken(id) {
  return http.get(`/oth/topics/${id}/token`)
}


// 修改主题信息
export function modifyTopic(id, data) {
  return http.put(`/oth/topics/${id}`, { data })
}


// 向主题发布信息
export function postInfo(id, data) {
  return http.post(`/oth/topics/${id}`, { data })
}


// 创建主题获得付款信息
export function triggerCreate(data) {
  return http.post('/oth/orders/create', { data })
}


// 创建主题获得付款信息
export function getOrder(data) {
  return http.post('/oth/orders/payment', { data })
}


// 创建主题获得付款信息
export function revokeToken(token) {
  return http.post('/oauth/revoke', { token })
}
