import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { i18n, useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
const Toast = dynamic(() => import('../../widgets/Toast'))

import { CurrentLoginContext } from '../../contexts/currentLogin'
import { getMixinContext } from '../../utils/pageUtil'
import { signIn_withMixin } from '../../services/api/infowoods'
import { mixinApi } from '../../services/api/mixin'

import { saveToken, saveUserData } from '../../utils/loginUtil'
import { APPS } from '../../constants'

import styles from './index.module.scss'

function AuthCallback() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const router = useRouter()

  const useQuery = () => {
    const hasQueryParams =
      /\[.+\]/.test(router.route) || /\?./.test(router.asPath)
    const ready = !hasQueryParams || Object.keys(router.query).length > 0
    if (!ready) return null
    return router.query
  }

  const query = useQuery()

  useEffect(() => {
    // login InfoWoods with mixin access token
    const ctx = getMixinContext()

    const login = async (token) => {
      const params = {
        app: APPS.current,
        mixin_access_token: token,
        conversation_id: ctx.conversation_id,
      }

      const data = await signIn_withMixin(params)

      if (data?.access_token) {
        curLogin.token = data.access_token
        saveToken(ctx.conversation_id, data.access_token)

        const user_data = {
          // expiry_time: data.expiry_time,
          user_name: data.user_name,
          avatar: data.avatar,
        }
        curLogin.user = user_data
        saveUserData(ctx.conversation_id, user_data)

        if (ctx?.locale && ctx.locale !== 'zh-CN' && i18n.language !== 'en') {
          i18n.changeLanguage('en')
          // router.push('/', '/', { locale: 'en' })
          window.location.href = '/en' //refresh page
        } else {
          // router.push('/')
          window.location.href = '/' //refresh page
        }
      }
    }

    const getMixinToken_andLoginOwl = async () => {
      const token = await mixinApi.getAccessToken(query.code)
      token && login(token)
    }

    if (query?.code) {
      getMixinToken_andLoginOwl().catch((err) => {
        console.log('err :>> ', err)
        toast.error(t('login_failed'))
        window.location.href = '/' //refresh page
      })
    }
    // else, no code, waiting page
  }, [query, curLogin, t])

  return (
    <div className={styles.main}>
      <Toast />
    </div>
  )
}

export default AuthCallback
