import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { RiAddLine } from 'react-icons/ri'

import { getMixinContext } from '../../utils/pageUtil'
import { CurrentLoginContext } from '../../contexts/currentLogin'
const Toast = dynamic(() => import('../../widgets/Toast'))

const ChannelCards = dynamic(() => import('./ChannelCards'))
const ChannelCreate = dynamic(() => import('./ChannelCreate'))

import styles from './index.module.scss'

function Home() {
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)

  const [ctx, setCtx] = useState({})
  const [showCreating, setShowCreating] = useState(false)

  useEffect(() => {
    const ctx = getMixinContext()
    setCtx(ctx)
  }, [])

  return (
    <div className={styles.main}>
      {curLogin?.token && (
        <>
          <ChannelCards ctx={ctx} t={t} curLogin={curLogin} />

          <div
            className={styles.channelAdd}
            onClick={() => {
              if (!curLogin.token) {
                toast(t('login_first'), { icon: '💁' })
                return
              }
              setShowCreating(true)
            }}
          >
            <RiAddLine />
          </div>

          <ChannelCreate
            ctx={ctx}
            t={t}
            curLogin={curLogin}
            showCreating={showCreating}
            setShowCreating={setShowCreating}
          />
        </>
      )}

      <Toast />
    </div>
  )
}

export default Home
