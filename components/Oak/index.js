import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import dynamic from 'next/dynamic'
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })
import 'easymde/dist/easymde.min.css'
import toast from 'react-hot-toast'
import OwlToast from '../../widgets/OwlToast'

import { getToken } from '../../utils/loginUtil'
import { getTopicDetails, postInfo, revokeToken } from '../../services/api/amo'

import Tabs from '../../widgets/Tabs'
import TextArea from '../../widgets/TextArea'
import Button from '../../widgets/Button'
import Icon from '../../widgets/Icon'
import styles from './index.module.scss'

const TabPane = Tabs.TabPane

function Details () {
  const { query:{ oid } } = useRouter()
  const [ details, setDetails ] = useState({})
  const [ activeTab, setActiveTab ] = useState('text')
  const [ sending, setSending ] = useState(false)
  const [ text, setText ] = useState('')
  const [ md, setMd ] = useState('')

  // const {
  //   control,
  //   handleSubmit,
  //   formState: { errors },
  //   clearErrors
  // } = useForm()
  const {
    control: txtControl,
    handleSubmit: handleTxtSubmit,
    formState: { errors: txtErrors },
    clearErrors: clearTxtErrors
  } = useForm()
  const {
    control: mdControl,
    handleSubmit: handleMdSubmit,
    formState: { errors: mdErrors },
    clearErrors: clearMdErrors
  } = useForm()

  useEffect(() => {
    const getDetails = async () => {
      const res = await getTopicDetails(oid)
      setDetails(res)
    }

    getDetails()
  }, [])

  const onChange = useCallback((val) => {
    clearMdErrors()
    setMd(val)
  }, [])

  const mdeOptions = useMemo(() => {
    return {
      hideIcons: ['side-by-side', 'fullscreen'],
      minHeight: "800px",
      nativeSpellcheck: false,
      spellChecker: false
    }
  }, [])

  const handlePost = async(e) => {
    // e.preventDefault()
    setSending(true)

    // if (!text || !md) {
    //   console.log('false')
    //   setSending(false)
    //   return
    // }

    console.log(e)
    return

    const res = await postInfo(oid, {
      infos: [
        {
          content_type: activeTab,
          content_value: activeTab === 'text' ? text : md,
        }
      ]
    })

    if (res?.infos_count) {
      setSending(false)
      toast.success('成功发送')

      if (activeTab === 'text') {
        setText('')
      } else {
        setMd('')
      }
    } else {
      toast.error('发生错误')
      setSending(false)
    }
  }

  const handleRevoke = async() => {
    const token = getToken()
    const res = await revokeToken(token)
  }

  const onSubmit = (data) => console.log(data)

  return (
    <div>
      <div className={styles.title}>
        <p>主题名：{details?.title}</p>
        <p>简介：{details?.description || 'null'}</p>
      </div>

      <Tabs
        defaultActiveKey="text"
        onChange={(val) => setActiveTab(val)}
      >
        <TabPane key="text" tab="发布纯文本消息">
          {/* <form id="1" onSubmit={handleSubmit(() => handlePost())}> */}
          <form id="1" onSubmit={handleTxtSubmit(() => handlePost())}>
          {/* <form id="1" onSubmit={handleTxtSubmit}> */}
          {/* <form onSubmit={handleTxtSubmit(onSubmit)}> */}
          {/* <form id="1" onSubmit={handleTxtSubmit(onSubmit)}> */}
            <Controller
              name="text"
              control={txtControl}
              // control={control}
              render={({ field }) => (
                <TextArea
                  className={styles.textArea}
                  {...field}
                  rows={10}
                  value={text}
                  onChange={(val) => {
                    // clearTxtErrors()
                    // clearErrors()
                    setText(val)
                  }}
                  ref={null}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
          </form>
          <input type="submit" />
          <p>{ txtErrors?.text?.message }</p>
          {/* <p>{ errors?.text?.message }</p> */}
        </TabPane>

        <TabPane key="markdown" tab="发布文章消息">
          {/* <form id="2" onSubmit={handleMdSubmit(() => handlePost())}> */}
          <form id="2" onSubmit={handleMdSubmit}>
            <Controller
              name="markdown"
              control={mdControl}
              render={({ field }) => (
                <SimpleMDE
                  className={styles.TextArea}
                  {...field}
                  options={mdeOptions}
                  value={md}
                  onChange={onChange}
                  ref={null}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
          </form>
          <p>{ mdErrors?.markdown?.message }</p>
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
        // type="submit"
        size="medium"
        className={styles.sendBtn}
        loading={sending}
        // form={activeTab === 'text' ? '1' : '2'}
        form="1"
        // onClick={(e) =>  handleTxtSubmit(handlePost(e))}
      >
        <Icon type="send" />
      </Button>

      <OwlToast />
    </div>
  )
}

export default Details