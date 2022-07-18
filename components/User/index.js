import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ProfileContext } from '../../stores/useProfile'

import { getMe } from '../../services/api/amo'

import { logout } from '../../utils/loginUtil'

import styles from './index.module.scss'

function User() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const isLogin = state.isLogin
  const { push } = useRouter()

  const [userData, setUserData] = useState({})

  const getMeData = async () => {
    try {
      const data = await getMe()
      setUserData(data)
    } catch (error) {
      if (error?.action === 'logout') {
        push('/')
        logout(dispatch)
        return
      }
    }
  }

  useEffect(() => {
    if (isLogin) {
      getMeData()
    }
    if (isLogin === false) {
      push('/')
    }
  }, [isLogin])

  return (
    <div>
      {isLogin && (
        <div>
          <p className={styles.mine}>{t('my_balance')}</p>
          <div className={styles.balance}>
            <p>
              <span>{t('gift_balance')}: </span>
              {userData?.balances?.gift}
            </p>
            <p>
              <span>{t('normal_balance')}: </span>
              {userData?.balances?.normal}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default User
