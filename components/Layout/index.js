import { useState, useEffect, useContext } from 'react'
import { i18n, useTranslation } from 'next-i18next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { ProfileContext } from '../../stores/useProfile'

import TopBar from '../TopBar'
import Avatar from '../../widgets/Avatar'
import BottomNav from '../../widgets/BottomNav'
import Loading from '../../widgets/Loading'

import { getMixinContext, reloadTheme } from '../../services/api/mixin'

import { authLogin } from '../../utils/loginUtil'
import storageUtil from '../../utils/storageUtil'

import styles from './index.module.scss'

function Layout({ children }) {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const { pathname, push } = useRouter()
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState(false)
  const isLogin = state.isLogin

  const navHref = ['/', '/user']

  const getBarColor = (path) => {
    reloadTheme(platform)
    if (theme === 'dark') {
      return path.includes('/oak/') ? '#1E1E1E' : '#080808'
    }
    return path.includes('/oak/') ? '#F4F6F7' : '#FFFFFF'
  }

  const backLink = (path) => {
    if (path.includes('oak/')) {
      return '/'
    }
  }

  const avatarLink = (path) => {
    switch (path) {
      default:
        return
    }
  }

  const handleClick = () => {
    const link = avatarLink(pathname)
    if (link) {
      push(avatarLink(pathname))
    } else {
      return
    }
  }

  useEffect(() => {
    console.log('>>> layout init:', pathname)
    const ctx = getMixinContext()
    ctx.appearance &&
      document.documentElement.setAttribute('data-theme', ctx.appearance)
    setTheme(ctx.appearance || 'light')

    if (
      ctx?.locale &&
      ctx.locale !== 'zh-CN' &&
      i18n.language !== 'en' &&
      pathname !== '/callback/mixin'
    ) {
      i18n.changeLanguage('en')
      push(pathname, pathname, { locale: 'en' })
      return
    }

    if (!ctx?.app_version) {
      storageUtil.set('platform', 'browser')
    }
    ctx?.platform && setPlatform(ctx?.platform)

    console.log('>>> localStorage: ', storageUtil.get('user_info'))
    storageUtil.get('user_info') &&
      dispatch({
        type: 'userInfo',
        userInfo: storageUtil.get('user_info'),
      })
    dispatch({
      type: 'isLogin',
      isLogin: storageUtil.get('user_info')?.user_name ? true : false,
    })
  }, [])

  return (
    <div
      className={`${styles.wrap} ${
        pathname.includes('/oak/') && styles.bgGray
      }`}
    >
      <Head>
        <title>Oak Topic Hub</title>
        <meta name="description" content="Oak Topic Hub" />
        <meta name="theme-color" content={getBarColor(pathname)} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {pathname !== '/callback/mixin' ? (
        <>
          <TopBar url={backLink(pathname)} />
          <div className={styles.avatarWrap}>
            <div>
              {isLogin
                ? navHref.includes(pathname) && (
                    <div className={styles.avatar}>
                      <Avatar
                        imgSrc={state.userInfo?.avatar}
                        onClick={handleClick}
                      />
                    </div>
                  )
                : isLogin === false && (
                    <div className={styles.login} onClick={() => authLogin()}>
                      <span>{t('login')}</span>
                    </div>
                  )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Loading size={36} className={styles.loading} />
        </>
      )}
      <div>
        {children}
        {navHref.includes(pathname) && <BottomNav t={t} />}
      </div>
    </div>
  )
}

export default Layout
