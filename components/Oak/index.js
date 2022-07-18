import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
})
import 'easymde/dist/easymde.min.css'

import OwlToast from '../../widgets/OwlToast'

import { getToken } from '../../utils/loginUtil'
import { getTopicDetails, postInfo, revokeToken } from '../../services/api/amo'

import Tabs from '../../widgets/Tabs'
import TextArea from '../../widgets/TextArea'
import Button from '../../widgets/Button'
import Icon from '../../widgets/Icon'

import styles from './index.module.scss'

const TabPane = Tabs.TabPane

function Details() {
  const {
    query: { oid },
  } = useRouter()
  const [details, setDetails] = useState({})
  const [activeTab, setActiveTab] = useState('text')
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [md, setMd] = useState('')

  const {
    control: txtControl,
    handleSubmit: handleTxtSubmit,
    formState: { errors: txtErrors },
  } = useForm()

  const {
    control: mdControl,
    handleSubmit: handleMdSubmit,
    formState: { errors: mdErrors },
  } = useForm()

  useEffect(() => {
    const getDetails = async () => {
      const res = await getTopicDetails(oid)
      setDetails(res)
    }

    getDetails()
  }, [oid])

  const mdeOptions = useMemo(() => {
    return {
      hideIcons: ['side-by-side', 'fullscreen'],
      minHeight: '800px',
      nativeSpellcheck: false,
      spellChecker: false,
    }
  }, [])

  const handlePost = async (data) => {
    setSending(true)
    console.log('form data:', data)

    if (!data?.text && !data?.markdown) {
      console.log('no form data')
      setSending(false)
      return
    }

    const res = await postInfo(oid, {
      infos: [
        {
          content_type: activeTab,
          content_value: activeTab === 'text' ? data.text : data.markdown,
        },
      ],
    })

    if (res?.infos_count) {
      setSending(false)
      toast.success('成功发送')
    } else {
      toast.error('发生错误')
      setSending(false)
    }
  }

  const handleRevoke = async () => {
    const token = getToken()
    const res = await revokeToken(token)
  }

  return (
    <div>
      <div className={styles.title}>
        <p>主题名：{details?.title}</p>
        <p>简介：{details?.description || 'null'}</p>
      </div>

      <Tabs defaultActiveKey="text" onChange={(val) => setActiveTab(val)}>
        {/* 纯文本 Form */}
        <TabPane key="text" tab="发布纯文本消息">
          <form id="1" onSubmit={handleTxtSubmit(handlePost)}>
            <Controller
              name="text"
              control={txtControl}
              render={({ field }) => (
                <TextArea
                  className={styles.textArea}
                  {...field}
                  rows={10}
                  ref={null}
                />
              )}
              rules={{
                required: '* 不能为空',
              }}
            />
          </form>
          <p className={styles.error}>{txtErrors?.text?.message}</p>
        </TabPane>

        {/* Markdown Form */}
        <TabPane key="markdown" tab="发布文章消息">
          <form id="2" onSubmit={handleMdSubmit(handlePost)}>
            <Controller
              name="markdown"
              control={mdControl}
              render={({ field }) => (
                <SimpleMDE options={mdeOptions} {...field} ref={null} />
              )}
              rules={{
                required: '* 不能为空',
              }}
            />
          </form>
          <p className={styles.error}>{mdErrors?.markdown?.message}</p>
        </TabPane>
      </Tabs>

      {/* <Button
        type="primary"
        size="large"
        onClick={() => handleRevoke()}
      >
        revoke
      </Button> */}

      <Button
        type="floating"
        size="medium"
        className={styles.sendBtn}
        loading={sending}
        form={activeTab === 'text' ? '1' : '2'}
      >
        <Icon type="send" />
      </Button>

      <OwlToast />
    </div>
  )
}

export default Details
