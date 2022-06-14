import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import { getDetails, amoLogs, updateAmo } from '../../../services/api/amo'
import Collapse from '../../../widgets/Collapse'
import Icon from '../../../widgets/Icon'
import Button from '../../../widgets/Button'
import Input from '../../../widgets/Input'
import TextArea from '../../../widgets/TextArea'
import Checkbox from '../../../widgets/Checkbox'
import Switch from '../../../widgets/Switch'
import styles from './index.module.scss'

function Details(props) {
  const { query:{ aid } } = useRouter()
  const [ info, setInfo ] = useState({})
  const [ logs, setLogs ] = useState({})
  const [ edit, setEdit ] = useState(true)
  const { control, handleSubmit, setValue, formState: { errors } } = useForm()

  const getAmoDetails = async() => {
    const data = await getDetails(aid)
    data && setInfo(data)
    console.log('amo detail:', data)
    setValue('profile.title', data.config.profile.title)
    setValue('profile.description', data.config.profile.description)
    setValue('triggers.schedule.enable', data.config.triggers?.schedule?.enable)
    setValue('triggers.schedule.expr', data.config.triggers?.schedule?.expr)
  }

  const getLogs = async() => {
    const data = await amoLogs(aid)
    data && setLogs(data)
  }

  useEffect(() => {
    getAmoDetails()
    getLogs()
  }, [])

  const onSubmit = async(params) => {
    console.log('errs:', errors)
    if (Object.keys(errors).length === 0) {
      try {
        const data = await updateAmo(aid, params)
        getAmoDetails()
        getLogs()
        setEdit(true)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const renderArguments = (key, val) => {
    switch (val.type) {
      case 'text':
        return (
          <div key={key}>
            <label>{val.label}</label>
            <Controller
              name={`arguments.${val.name}`}
              control={control}
              defaultValue={val.value}
              render={({ field }) => <Input {...field} ref={null} autoComplete="off" disabled={edit} />}
              rules={{
                required: '不能为空',
                minLength: {
                  value: 4,
                  message: 'at least 4'
                }
              }}
            />
            <p className={styles.error}>
              { errors?.arguments && errors?.arguments[val.name]?.message }
            </p>
          </div>
        )
      case 'boolean':
        return (
          <div key={key}>
            <Controller
              name={`arguments.${val.name}`}
              control={control}
              defaultValue={val.value}
              render={({ field }) => <Checkbox {...field} ref={null} disabled={edit}>{val.label}</Checkbox>}
            />
          </div>
        )
      default:
        break
    }
  }

  return (
    <div className={styles.details}>
      <div className={styles.modify}>
        <Button
          type="floating"
          size="medium"
          className={styles.editBtn}
          onClick={() => setEdit(false)}
        >
          <Icon type="edit" /> 修改
        </Button>
        <Button
          type="floating"
          size="medium"
          className={styles.saveBtn}
          onClick={handleSubmit(onSubmit)}
        >
          <Icon type="save" /> 保存
        </Button>
      </div>

      <form>
        <Collapse
          title="基本信息"
        >
          <label>标题</label>
          <Controller
            name="profile.title"
            control={control}
            render={({ field }) => <Input {...field} ref={null} autoComplete="off" disabled={edit} />}
            rules={{
              required: '不能为空',
              minLength: {
                value: 4,
                message: 'at least 4'
              }
            }}
          />
          <p className={styles.error}>{ errors?.profile?.title?.message }</p>

          <label>描述</label>
          <Controller
            name="profile.description"
            control={control}
            render={({ field }) => <TextArea {...field} ref={null} disabled={edit} />}
            rules={{
              required: '不能为空',
              minLength: {
                value: 4,
                message: 'at least 4'
              }
            }}
          />
          <p className={styles.error}>{ errors?.profile?.description?.message }</p>

          <p className={styles.created}>
            创建时间：
            <span>{info.created}</span>
          </p>
        </Collapse>

        <Collapse
          title="执行参数"
        >
          {
            info?.config?.constants &&
            Object.entries(info?.config?.constants).map(([key, value]) => renderArguments(key, value))
          }
        </Collapse>

        <Collapse
          title="触发器"
        >
          <label>定时器开关</label>
          <Controller
            name="triggers.schedule.enable"
            control={control}
            render={({ field }) => <Switch {...field} ref={null} disabled={edit} />}
          />

          <label>Cron 表达式</label>
          <Controller
            name="triggers.schedule.expr"
            control={control}
            render={({ field }) => <Input {...field} ref={null} disabled={edit} />}
            rules={{
              required: '不能为空',
              minLength: {
                value: 4,
                message: 'at least 4'
              }
            }}
          />
          <p className={styles.error}>{ errors?.triggers?.schedule.expr?.message }</p>
        </Collapse>

        <Collapse
          title="上次执行情况"
        >
          <div className={styles.logs}>
            <div>
              {
                info?.last_execution?.status === 'success' ?
                  <div className={styles.success}><div></div> 成功运行</div>
                  :
                  info?.last_execution?.status === null ?
                    '还未运行 🤷‍♀️'
                    :
                    '运行失败'
              }
            </div>
            <p>结束时间：{info?.last_execution?.time}</p>
            <p>
              日志：
              {
                logs[0]?.logs?.map((item, idx) => <span key={idx}>{item}</span>)
              }
            </p>
            <p>时长：{info?.last_execution?.duration}</p>
            <p>用电：{info?.last_execution?.amount}</p>
          </div>
        </Collapse>
      </form>

    </div>
  )
}

export default Details