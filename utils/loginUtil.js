import AuthMixin from './auth/AuthMixin'
import StorageUtil from './storageUtil'
import { getProfile } from '../services/api/mixin'

const MIXIN_TOKEN = 'mixin_token'
const OAK_USER = 'user_info'

export function authLogin() {
  AuthMixin.requestCode(true)
}

export function logout(dispatch) {
  dispatch({
    type: 'profile',
    profile: {},
  })
  dispatch({
    type: 'userInfo',
    userInfo: {},
  })
  dispatch({
    type: 'groupInfo',
    groupInfo: {},
  })
  dispatch({
    type: 'isLogin',
    groupInfo: null,
  })
  console.log('logout')
  StorageUtil.del(OAK_USER)
  StorageUtil.del('mixin_token')
}

export async function loadAccountInfo(dispatch) {
  const profile = await getProfile()
  dispatch({
    type: 'profile',
    profile,
  })
}

export function saveToken({ token }) {
  StorageUtil.set(MIXIN_TOKEN, token)
}

export function getToken() {
  if (process.env.NODE_ENV === 'development' && process.env.TOKEN) {
    return process.env.TOKEN
  }
  const token = StorageUtil.get(OAK_USER)?.access_token
  return token
}
