import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { getMixinContext } from '../../utils/pageUtil'
import { getUserWallets } from '../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../utils/apiUtils'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const SubPageCard = dynamic(() => import('../../widgets/SubPageCard'))
const Toast = dynamic(() => import('../../widgets/Toast'))
const TopUpSheet = dynamic(() => import('./TopUpSheet'))
const Wallets = dynamic(() => import('./Wallets'))

import styles from './index.module.scss'
import { logout } from '../../utils/loginUtil'

function User() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [inProcessOfTopUp, setInProcessOfTopUp] = useState(false)
  const router = useRouter()

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
        mutate('me?wallets')
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
        setInProcessOfTopUp={setInProcessOfTopUp}
      ></Wallets>

      <div className={styles.logout}>
        <span
          onClick={() => {
            const ctx = getMixinContext()
            logout(ctx.conversation_id)
            window.location.href = '/'
          }}
        >
          {t('logout')}
        </span>
      </div>

      {/* 充值组件 */}
      {inProcessOfTopUp && (
        <TopUpSheet
          t={t}
          toast={toast}
          myWallets={myWallets}
          handelOwlApiErrorP={(error) => {
            handleInfowoodsApiError(error, t, curLogin)
          }}
          setInProcessOfTopUp={setInProcessOfTopUp}
        />
      )}

      <Toast />
    </div>
  )
}

export default User
