import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ProfileContext } from '../../stores/useProfile'
import toast from 'react-hot-toast'
import OwlToast from '../../widgets/OwlToast'

import BottomSheet from '../../widgets/BottomSheet'
import Icon from '../../widgets/Icon'
import Input from '../../widgets/Input'
import TextArea from '../../widgets/TextArea'
import Loading from '../../widgets/Loading'
import Button from '../../widgets/Button'

import { authLogin, logout } from '../../utils/loginUtil'
import { getTopicsList, triggerCreate, modifyTopic } from '../../services/api/amo'
import { copyText } from '../../utils/copyUtil'
import styles from './index.module.scss'

function Amos() {
  const { t } = useTranslation('common')
  const [ state, dispatch ]  = useContext(ProfileContext)
  const isLogin = state.userInfo && state.userInfo.user_name
  const { push } = useRouter()

  const [ list, setList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ showEdit, setShowEdit ] = useState(false)
  const [ modifiedTopic, setModifiedTopic ] = useState({})

  const [ modifyLoading, setModifyLoading ] = useState(false)

  const { control, handleSubmit, formState: { errors }, clearErrors } = useForm()

  const getList = async () => {
    setLoading(true)
    const data = await getTopicsList()
    console.log('oak data:', data)
    setLoading(false)
    setList(data)
  }

  useEffect(() => {
    if (isLogin) {
      console.log('+++ login')
      try {
        getList()
      } catch (error) {
        console.log('err')
        if (error?.action === 'logout') {
          toast.error(t('auth_expire'))
          setLoading(false)
          logout(dispatch)
          return
        }
      }
    } else {
      console.log('not Login')
      // logout(dispatch)
      setLoading(false)
    }
  }, [isLogin])

  const handleCreate = async () => {
    const res = await triggerCreate({ order_type: '1' })
    const payUrl = 'mixin://pay?' +
      `recipient=${res.recipient_id}` +
      `&asset=${res.asset_id}` +
      `&amount=${res.amount}` +
      `&memo=${res.memo}` +
      `&trace=${res.trace_id}`
    window.open(payUrl)

    // 付完款需要请求主题接口
  }

  const handleEdit = (val) => {
    setModifiedTopic(val)
    setShowEdit(true)
  }

  const handleClose = () => {
    setShowEdit(false)
    setModifyLoading(false)
    setModifiedTopic({})
  }

  const handleModify = async(data) => {
    setModifyLoading(true)
    console.log(data.title, data.description)
    const res = await modifyTopic(modifiedTopic.topic_id, {
      title: data.title,
      description: data.description
    })
    if (res.title) {
      setModifyLoading(false)
      setShowEdit(false)
      toast.success(t('modify_success'))
      getList()
    }
  }

  return (
    <div className={styles.main}>
      {
        isLogin ?
          <p className={styles.mine}>我的</p>
          :
          <div className={styles.ufo}><Icon type="ufo" /></div>
      }

      {
        loading ?
          <Loading />
          :
          <div>
            {
              list && list.map((item, idx) => (
                <div key={idx} className={styles.card}>
                  <p><span>主题名：</span> {item.title}</p>
                  <p><span>简介：</span> {item.description || '--'}</p>

                  <div className={styles.divider} />
                  <p
                    className={styles.edit}
                    onClick={() => handleEdit(item)}
                  >
                    <span>修改主题信息</span> <Icon type="edit" />
                  </p>
                  <p
                    className={styles.copy}
                    onClick={() => copyText(item.subscription_uri, toast, t)}
                  >
                    订阅链接：<span>{item.subscription_uri} <Icon type="copy" /></span>
                  </p>

                  <Icon
                    type="add-circle"
                    className={styles.post}
                    onClick={() => push(`/oak/${item.topic_id}`)}
                  />
                </div>
              ))
            }

            {
              isLogin &&
              <div className={styles.create}>
                👉 <span onClick={handleCreate}>创建新主题</span>
              </div>
            }
          </div>
      }


      <BottomSheet
        t={t}
        show={showEdit}
        withConfirm
        confirmTitle="修改主题信息"
        onClose={handleClose}
        onCancel={handleClose}
        onConfirm={handleSubmit((data) => handleModify(data))}
      >
        {
          modifyLoading ?
          <div className={styles.modifyLoading}>
            <Loading />
          </div>
          :
          <div className={styles.sheet}>
            <div>
              <p className={styles.title}>当前：</p>
              <p><span>主题名：</span> {modifiedTopic.title}</p>
              <p><span>简介：</span> {modifiedTopic.description || '--'}</p>
            </div>

            <p className={styles.title}>改为：</p>
            <form onSubmit={handleSubmit}>
              <div className={styles.label}>
                <p>主题名：</p>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      className={styles.input}
                      onChange={() => {clearErrors('title')}}
                      {...field}
                      ref={null}
                    />
                  )}
                  rules={{
                    required: '不能为空',
                  }}
                />
                <p>{ errors?.title?.message }</p>
              </div>
              <div className={styles.label}>
                <p>简介：</p>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      className={styles.textArea}
                      onChange={() => {clearErrors('description')}}
                      {...field}
                      ref={null}
                    />
                  )}
                  rules={{
                    required: '不能为空',
                  }}
                />
                <p>{ errors?.description?.message }</p>
              </div>
            </form>
          </div>
        }
      </BottomSheet>

      <OwlToast />
    </div>
  )
}

export default Amos