import useSWR from 'swr'
import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { RiProfileLine, RiPenNibLine, RiLinksLine } from 'react-icons/ri'
import { TbTree } from 'react-icons/tb'
import { Button, Row } from '@nextui-org/react'

import Loading from '../../widgets/Loading'
import { handleInfowoodsApiError } from '../../utils/apiUtils'
import { readChannel } from '../../services/api/infowoods'
import { getMixinContext } from '../../utils/pageUtil'
import { CurrentLoginContext } from '../../contexts/currentLogin'
import { copyText } from '../../utils/copyUtil'
const Toast = dynamic(() => import('../../widgets/Toast'))

const SheetEditChannel = dynamic(() => import('./SheetEditChannel'))
const SheetPublishInfo = dynamic(() => import('./SheetPublishInfo'))

import styles from './index.module.scss'

function Channel() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [curLogin, _] = useContext(CurrentLoginContext)
  const [ctx, setCtx] = useState({})
  const [showEdit, setShowEdit] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const { cid } = router.query

  useEffect(() => {
    const ctx = getMixinContext()
    setCtx(ctx)
  }, [])

  function useChannel() {
    const { data, error, mutate } = useSWR(
      { key: 'channel', channel_id: cid },
      readChannel
    )
    if (error) {
      if (error) {
        handleInfowoodsApiError(error, t, curLogin)
      }
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

  const curChannel = useChannel()

  return (
    <div className={styles.main}>
      {curChannel?.isLoading && <Loading size={'lg'} />}
      {curChannel?.data && (
        <>
          <div className={styles.header}>
            <div className={styles.icon}>
              <TbTree />
            </div>
            <div className={styles.profile}>
              <div className={styles.title}>
                {curChannel.data.channel?.title}
              </div>
              <div className={styles.subscribers}>
                {curChannel.data.channel?.subscribers} {t('subscriptions')}
              </div>

              <div className={styles.uri}>
                <span
                  className={styles.copy}
                  onClick={() => copyText(curChannel.data.channel?.uri, t)}
                >
                  {curChannel.data.channel?.uri}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.buttons}>
            <Button
              type={'button'}
              onPress={() => {
                setShowEdit(true)
              }}
              // animated={false}
              // color="gradient"
              bordered
              size="lg"
              icon={<RiProfileLine size={20} />}
            ></Button>

            <Button
              type={'button'}
              onPress={() => {
                setShowPublish(true)
              }}
              // animated={false}
              // color="gradient"
              bordered
              size="lg"
              icon={<RiPenNibLine size={20} />}
            ></Button>
          </div>

          <SheetEditChannel
            ctx={ctx}
            t={t}
            curLogin={curLogin}
            showEdit={showEdit}
            setShowEdit={setShowEdit}
            channel={curChannel.data.channel}
            refreshChannel={curChannel.refresh}
          />

          <SheetPublishInfo
            ctx={ctx}
            t={t}
            curLogin={curLogin}
            showPublish={showPublish}
            setShowPublish={setShowPublish}
            channel={curChannel.data.channel}
            refreshChannel={curChannel.refresh}
          />
        </>
      )}

      <Toast />
    </div>
  )
}

export default Channel
