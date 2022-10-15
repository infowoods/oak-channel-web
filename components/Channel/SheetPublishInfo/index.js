import useSWR from 'swr'
import { useState, useEffect, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { RiPenNibLine } from 'react-icons/ri'

import Tabs from '../../../widgets/Tabs'
import FormText from './FormText'
import FormMarkdown from './FormMarkdown'
import { getFees_Infos } from '../../../services/api/infowoods'
import BottomSheet from '../../../widgets/BottomSheet'

import styles from './index.module.scss'

function SheetPublishInfo(props) {
  const {
    ctx,
    t,
    curLogin,
    showPublish,
    setShowPublish,
    channel,
    refreshChannel,
  } = props

  const [activeTab, setActiveTab] = useState('text')

  function onClose() {
    setShowPublish(false)
  }

  function useInfoFees() {
    const { data, error, mutate } = useSWR(
      { key: 'infos.fees', channel_id: channel.id },
      getFees_Infos
    )
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

  const infoFees = useInfoFees()

  return (
    <>
      <BottomSheet onClose={onClose} showing={showPublish} closeAtLeft>
        <div className={styles.wrap}>
          <div className={styles.sheetTitle}>
            <RiPenNibLine />
            <div>{t('publish_info')}</div>
          </div>

          <Tabs defaultActiveKey="text" onChange={(val) => setActiveTab(val)}>
            <Tabs.TabPane key="text" tab={t('plain_text')}>
              <FormText
                ctx={ctx}
                t={t}
                curLogin={curLogin}
                channel={channel}
                refreshChannel={refreshChannel}
                infoFees={infoFees}
              />
            </Tabs.TabPane>

            <Tabs.TabPane key="markdown" tab={t('plain_markdown')}>
              <FormMarkdown
                ctx={ctx}
                t={t}
                curLogin={curLogin}
                channel={channel}
                refreshChannel={refreshChannel}
                infoFees={infoFees}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
        {/* /.wrap */}
      </BottomSheet>
    </>
  )
}

export default SheetPublishInfo
