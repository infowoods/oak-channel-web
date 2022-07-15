import { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

import { ProfileContext } from '../../stores/useProfile'

const OwlToast = dynamic(() => import('../../widgets/OwlToast'))
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))
const Overlay = dynamic(() => import('../../widgets/Overlay'))
const QrCodeSheet = dynamic(() => import('./QrCodeSheet'))

import Icon from '../../widgets/Icon'
import Input from '../../widgets/Input'
import TextArea from '../../widgets/TextArea'
import Loading from '../../widgets/Loading'

import { logout } from '../../utils/loginUtil'
import { copyText } from '../../utils/copyUtil'
import storageUtil from '../../utils/storageUtil'

import {
  getTopicsList,
  triggerCreate,
  modifyTopic,
  getOrder,
} from '../../services/api/amo'

import styles from './index.module.scss'

function Home() {
  const { t } = useTranslation('common')
  const [state, dispatch] = useContext(ProfileContext)
  const isLogin = state.isLogin
  const { push } = useRouter()

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [check, setCheck] = useState(false)
  const [modifiedTopic, setModifiedTopic] = useState({})
  const [payUrl, setPayUrl] = useState('')
  const [orderId, setOrderId] = useState('')
  const [intervalId, setIntervalId] = useState(null)

  const [pushIdx, setPushIdx] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [modifyLoading, setModifyLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const getList = async () => {
    setLoading(true)
    try {
      const data = await getTopicsList()
      setLoading(false)
      setList(data)
    } catch (error) {
      if (error?.action === 'logout') {
        toast.error(t('auth_expire'))
        setLoading(false)
        logout(dispatch)
        return
      }
    }
  }

  useEffect(() => {
    console.log('>>> home state:', state)
    if (isLogin) {
      getList()
    } else {
      console.log('home not login')
      setLoading(false)
    }
  }, [isLogin])

  useEffect(() => {
    if (check) {
      const orderInterval = setInterval(async () => {
        const res = await getOrder({ trace_id: orderId })
        if (res?.topic_token) {
          toast.success(t('create_success'))
          setCheck(false)
          setOrderId('')
          getList()
        }
      }, 3000)
      setIntervalId(orderInterval)
    } else {
      setOrderId('')
      intervalId && clearInterval(intervalId)
    }
  }, [check])

  const handleCreate = async () => {
    setCreateLoading(true)
    const res = await triggerCreate({ order_type: '1' })
    setCreateLoading(false)
    const payUrl =
      'mixin://pay?' +
      `recipient=${res?.recipient_id}` +
      `&asset=${res?.asset_id}` +
      `&amount=${res?.amount}` +
      `&memo=${res?.memo}` +
      `&trace=${res?.trace_id}`
    setOrderId(res?.trace_id)
    if (storageUtil.get('platform') === 'browser') {
      setPayUrl(payUrl)
    } else {
      setCheck(true)
      window.open(payUrl)
    }
  }

  const handleEdit = (val) => {
    setModifiedTopic(val)
    setShowEdit(true)
  }

  const handleClose = () => {
    setShowEdit(false)
    setModifyLoading(false)
    setModifiedTopic({})
    reset()
  }

  const handleModify = async (data) => {
    setModifyLoading(true)
    console.log(data.title, data.description)
    const res = await modifyTopic(modifiedTopic.topic_id, {
      title: data.title,
      description: data.description,
    })
    if (res?.title) {
      setModifyLoading(false)
      setShowEdit(false)
      toast.success(t('modify_success'))
      getList()
    } else {
      toast.error(t('modify_failed'))
    }
  }

  return (
    <div className={styles.main}>
      {loading ? (
        <Loading className={styles.homeLoading} />
      ) : isLogin === false ? (
        <div className={styles.ufo}>
          <Icon type="ufo" />
        </div>
      ) : (
        <div>
          <p className={styles.mine}>我的</p>

          {list.length > 0 &&
            list.map((item, idx) => (
              <div key={idx} className={styles.card}>
                <p>
                  <span>主题名：</span> {item.title}
                </p>
                <p>
                  <span>简介：</span> {item.description || '--'}
                </p>

                <div className={styles.divider} />
                <p className={styles.edit} onClick={() => handleEdit(item)}>
                  <span>修改主题信息</span> <Icon type="edit" />
                </p>
                <p
                  className={styles.copy}
                  onClick={() => copyText(item.subscription_uri, toast, t)}
                >
                  订阅链接：
                  <span>
                    {item.subscription_uri} <Icon type="copy" />
                  </span>
                </p>

                {pushIdx === idx ? (
                  <Loading size={26} className={styles.pushLoading} />
                ) : (
                  <Icon
                    type="add-circle"
                    className={styles.post}
                    onClick={() => {
                      setPushIdx(idx)
                      push(`/oak/${item.topic_id}`)
                    }}
                  />
                )}
              </div>
            ))}

          <div className={styles.create}>
            👉
            <span onClick={handleCreate}>创建新主题</span>
            {createLoading && (
              <Loading size={14} className={styles.createLoading} />
            )}
          </div>
        </div>
      )}

      {/* Modify topic data */}
      <BottomSheet
        t={t}
        show={showEdit}
        withConfirm
        confirmTitle="修改主题信息"
        onClose={handleClose}
        onCancel={handleClose}
        onConfirm={handleSubmit((data) => handleModify(data))}
      >
        {modifyLoading ? (
          <div className={styles.modifyLoading}>
            <Loading />
          </div>
        ) : (
          <div className={styles.sheet}>
            <div className={styles.current}>
              <p className={styles.title}>当前：</p>
              <p>
                <span>主题名：</span> {modifiedTopic.title}
              </p>
              <p>
                <span>简介：</span> {modifiedTopic.description || '--'}
              </p>
            </div>

            <div className={styles.modifyTo}>
              <p className={styles.title}>改为：</p>
              <form onSubmit={handleSubmit}>
                <div className={styles.label}>
                  <p>主题名：</p>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input className={styles.input} {...field} ref={null} />
                    )}
                    rules={{
                      required: '*不能为空',
                    }}
                  />
                  <p className={styles.error}>{errors?.title?.message}</p>
                </div>
                <div className={styles.label}>
                  <p>简介：</p>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        className={styles.textArea}
                        {...field}
                        ref={null}
                      />
                    )}
                    rules={{
                      required: '*不能为空',
                    }}
                  />
                  <p className={styles.error}>{errors?.description?.message}</p>
                </div>
              </form>
            </div>
          </div>
        )}
      </BottomSheet>

      <QrCodeSheet
        t={t}
        show={payUrl}
        id={payUrl}
        onClose={() => setPayUrl('')}
        onCancel={() => setPayUrl('')}
        onConfirm={() => {
          setPayUrl('')
          setCheck(true)
        }}
      />

      <Overlay
        t={t}
        desc={t('checking_pay')}
        visible={check}
        onCancel={() => setCheck(false)}
      />

      <OwlToast />
    </div>
  )
}

export default Home
