import toast from 'react-hot-toast'
import { getMixinContext } from './pageUtil'
import { logout, toLogin } from './loginUtil'

export function handleInfowoodsApiError(error, t, curLogin) {
  if (error.action === 'logout') {
    toast.loading(t('login_first'))
    const ctx = getMixinContext()
    logout(ctx.conversation_id)
    curLogin.token = null
    curLogin.user = null
    curLogin.group = null

    toLogin()
  } else {
    console.log('error.message :>> ', error.message)
    toast.error(`${error.code} ${error.message}`, { duration: 4500 })
  }
}
