import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { RiLogoutBoxLine } from 'react-icons/ri'

import { getMixinContext } from '../../utils/pageUtil'
import { getUserWallets } from '../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../utils/apiUtils'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const Toast = dynamic(() => import('../../widgets/Toast'))
const TopUpSheet = dynamic(() => import('./TopUpSheet'))
const Wallets = dynamic(() => import('./Wallets'))

import styles from './index.module.scss'
import { logout } from '../../utils/loginUtil'

function User() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [ctx, setCtx] = useState({})
  const [showTopupSheet, setShowTopupSheet] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const ctx = getMixinContext()
    setCtx(ctx)
  }, [])

  function useMyWallets() {
    const { data, error, mutate } = useSWR('me?wallets', getUserWallets)
    if (error) {
      handleInfowoodsApiError(error, t, curLogin)
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
      refresh: () => {
        mutate()
      },
    }
  }

  const myWallets = useMyWallets()

  return (
    <div className={styles.main}>
      <Wallets
        t={t}
        toast={toast}
        myWallets={myWallets}
        showTopupSheet={showTopupSheet}
        setShowTopupSheet={setShowTopupSheet}
      ></Wallets>

      <div className={styles.logout}>
        <span
          onClick={() => {
            const ctx = getMixinContext()
            logout(ctx.conversation_id)
            window.location.href = '/'
          }}
        >
          <RiLogoutBoxLine />
          <span>{t('logout')}</span>
        </span>
      </div>

      {/* 充值组件 */}

      <TopUpSheet
        ctx={ctx}
        t={t}
        curLogin={curLogin}
        myWallets={myWallets}
        handelOwlApiErrorP={(error) => {
          handleInfowoodsApiError(error, t, curLogin)
        }}
        showTopupSheet={showTopupSheet}
        setShowTopupSheet={setShowTopupSheet}
      />

      <Toast />
    </div>
  )
}

export default User
