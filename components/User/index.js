import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ProfileContext } from '../../stores/useProfile'

import styles from './index.module.scss'

function User() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const isLogin = state.userInfo && state.userInfo.user_name
  const { push } = useRouter()

  return (
    <div>
      <p className={styles.mine}>{t('my_balance')}</p>
      <p className={styles.balance}>🔋 1230</p>
    </div>
  )
}

export default User
