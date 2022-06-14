import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useForm, Controller } from 'react-hook-form'
import Button from '../../../widgets/Button'
import Tabs from '../../../widgets/Tabs'
import Icon from '../../../widgets/Icon'
import BottomSheet from '../../../widgets/BottomSheet'
import styles from './index.module.scss'
import { parseScript, getSamples, creatAmo } from '../../../services/api/amo'
import Editor from 'react-simple-code-editor'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/atom-one-light.css'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)

const TabPane = Tabs.TabPane

function Add(props) {
  const { t } = useTranslation('common')
  const [ samples, setSamples ] = useState([])
  const [ base64Txt, setBase64Txt ] = useState('')
  const [ meta, setMeta ] = useState('')
  const [ config, setConfig ] = useState('')
  const [ pyScript, setPyScript ] = useState('')
  const [ info, setInfo ] = useState({})
  const [ submitData, setSubmitData ] = useState({})
  const [ show, setShow ] = useState(false)
  const [ activeTab, setActiveTab ] = useState('manual')
  const [ parseLoading, setParseLoading ] = useState(false)
  const [ createLoading, setCreateLoading ] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm()
  const {
    control: combinedControl,
    handleSubmit: handleCombinedSubmit,
    formState: { errors: combinedErrors }
  } = useForm()

  useEffect(() => {
    const getSamp = async() => {
      const data = await getSamples()
      data && setSamples(data)
    }

    getSamp()
  }, [])

  const chooseSubmit = () => {
    if (activeTab === 'manual') {

    }
  }

  const handleCreate = async(e) => {
    e.preventDefault()
    setCreateLoading(true)
    let params
    switch (activeTab) {
      case 'manual':
        params = {
          type: 'raw',
          value: {
            meta: meta,
            config: config,
            script: btoa(pyScript)
          }
        }
        break
      case 'combined':
        params = {
          type: 'combined-b64',
          value: btoa(unescape(encodeURIComponent(base64Txt)))
        }
        break
      default:
        break
    }

    const parseData = await parseScript(params)
    if (parseData) {
      const res = await creatAmo(JSON.stringify(parseData))
      if (res) {
        setCreateLoading(false)
      }
    }
  }

  const handleAdd = async(val) => {
    const parseData = await parseScript({ type: 'url', value: val })
    const res = await creatAmo(JSON.stringify(parseData))
  }

  const handleParse = async(e) => {
    e.preventDefault()
    setParseLoading(true)
    let params
    switch (activeTab) {
      case 'manual':
        params = {
          type: 'raw',
          value: {
            meta: meta,
            config: config,
            script: btoa(pyScript)
          }
        }
        break
      case 'combined':
        params = {
          type: 'combined-b64',
          value: btoa(unescape(encodeURIComponent(base64Txt)))
        }
        break
      default:
        break
    }

    const data = await parseScript(params)
    if (data) {
      setParseLoading(false)
      setSubmitData(data)
      setInfo(data?.config)
      setShow(true)
    }
  }

  const renderParseValue = (val) => {
    if (typeof val === 'boolean') {
      if (val) return '是'
      return '否'
    }
    return val
  }

  const handleConfirm = async() => {
    const data = await creatAmo(JSON.stringify(submitData))
  }

  return (
    <div className={styles.add}>
      <div className={styles.modify}>
        <Button
          type="floating"
          size="medium"
          className={styles.editBtn}
          loading={parseLoading}
          form={activeTab === 'manual' ? '2' : '1'}
          onClick={(e) => handleParse(e)}
        >
          <Icon type="parse" /> 解析脚本
        </Button>
        <Button
          type="floating"
          size="medium"
          className={styles.saveBtn}
          loading={createLoading}
          form={activeTab === 'manual' ? '2' : '1'}
          onClick={(e) => handleCreate(e)}
        >
          <Icon type="upload" /> 直接添加
        </Button>
      </div>

      <Tabs
        defaultActiveKey="manual"
        onChange={(val) => setActiveTab(val)}
      >
        <TabPane key="sample" tab="选择示例脚本">
          {
            samples && samples.map((item, idx) => (
              <div key={idx} className={styles.card}>
                <div>
                  <p>{item.title}</p>
                  <p>描述：{item.description}</p>
                  <p>作者：{item.author}</p>
                </div>
                <Button
                  type="primary"
                  size="medium"
                  onClick={() => handleAdd(item.url)}
                >
                  添加
                </Button>
              </div>
            ))
          }
        </TabPane>

        <TabPane key="combined" tab="粘贴 base64 文本">
          {/* <form id='1' onSubmit={handleCombinedSubmit(() => handleParse())}> */}
          <form id='1' onSubmit={handleCombinedSubmit}>
            <label>此处请粘贴 base64 转码后的文本</label>
            <Controller
              name="base64"
              control={combinedControl}
              render={({ field }) => (
                <Editor
                  {...field}
                  ref={null}
                  value={base64Txt}
                  onValueChange={(code) => setBase64Txt(code)}
                  highlight={(code) => {
                    const hCode = hljs.highlightAuto(code).value
                    return hCode
                  }}
                  padding={14}
                  textareaClassName={styles.editor}
                  preClassName={styles.pre}
                  style={{
                    fontFamily: 'Monaco',
                    fontSize: 13,
                  }}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
            <p>{ combinedErrors?.base64?.message }</p>
            <input type="submit" />
          </form>
        </TabPane>

        <TabPane key="manual" tab="手动填写脚本">
          <form
            id="2"
            className={styles.form}
            onSubmit={handleSubmit(() => handleParse())}
          >
            <label>meta.json</label>
            <Controller
              name="meta"
              control={control}
              render={({ field }) => (
                <Editor
                  {...field}
                  ref={null}
                  value={meta}
                  onValueChange={(code) => setMeta(code)}
                  highlight={(code) => {
                    const hCode = hljs.highlight(code, { language: 'json' }).value
                    return hCode
                  }}
                  padding={14}
                  textareaClassName={styles.editor}
                  preClassName={styles.pre}
                  style={{
                    fontFamily: 'Monaco',
                    fontSize: 13,
                  }}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
            <p>{ errors?.meta?.message }</p>

            <label>config.toml or config.yaml</label>
            <Controller
              name="config"
              control={control}
              render={({ field }) => (
                <Editor
                  {...field}
                  ref={null}
                  value={config}
                  onValueChange={(code) => setConfig(code)}
                  highlight={(code) => {
                    const hCode = hljs.highlightAuto(code).value
                    return hCode
                  }}
                  padding={14}
                  textareaClassName={styles.editor}
                  preClassName={styles.pre}
                  style={{
                    fontFamily: 'Monaco',
                    fontSize: 13,
                  }}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
            <p>{ errors?.config?.message }</p>

            <label>script.py</label>
            <Controller
              name="script"
              control={control}
              render={({ field }) => (
                <Editor
                  {...field}
                  ref={null}
                  value={pyScript}
                  onValueChange={(code) => setPyScript(code)}
                  highlight={(code) => {
                    const hCode = hljs.highlight(code, { language: 'python' }).value
                    return hCode
                  }}
                  padding={14}
                  textareaClassName={styles.editor}
                  preClassName={styles.pre}
                  style={{
                    fontFamily: 'Monaco',
                    fontSize: 13,
                  }}
                />
              )}
              rules={{
                required: '不能为空',
              }}
            />
            <p>{ errors?.script?.message }</p>

            <input type="submit" />
          </form>
        </TabPane>
      </Tabs>

      <BottomSheet
        t={t}
        show={show}
        withConfirm
        confirmTitle="解析结果"
        confirmText="添加阿莫"
        onCancel={() => setShow(false)}
        onConfirm={() => handleConfirm()}
      >
        <div className={styles.info}>
          <div>
            <h2>基本信息</h2>
            <p className={styles.parse}>标题：<span>{info?.profile?.title}</span></p>
            <p className={styles.parse}>描述：<span>{info?.profile?.description}</span></p>
          </div>
          <div>
            <h2>执行参数</h2>
            {
              info?.constants && Object.entries(info?.constants)?.map(([key, val]) => (
                <p key={key} className={styles.parse}>
                  {val.label}： <span>{renderParseValue(val.value)}</span>
                </p>
              ))
            }
          </div>
          <p className={styles.note}>* 添加后可修改「阿莫」的基本信息和执行参数</p>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Add