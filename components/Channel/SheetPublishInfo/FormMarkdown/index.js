import React from 'react'
import ReactDom from 'react-dom'
import useSWR from 'swr'
import { useState, useEffect, useContext, useMemo } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button, Input, useInput } from '@nextui-org/react'

import { publishMarkdownInfo } from '../../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../../utils/apiUtils'
import Loading from '../../../../widgets/Loading'

import MDEditor from './MDEditor'
import styles from './index.module.scss'

function FormMarkdown(props) {
  const { ctx, t, curLogin, channel, refreshChannel, infoFees } = props

  const textTitle = useInput('')
  const textBody = useInput('')
  const textSource = useInput('')
  const [publishing, setPublishing] = useState(false)
  const mdFee = infoFees?.data?.publish?.MARKDOWN

  function resetAll() {
    textTitle.reset()
    textBody.reset()
    textSource.reset()
  }

  function toPublishInfo() {
    const text = textBody.value
    // validate values
    if (!text) {
      toast.error(t('text_body_required'))
      return
    }

    const data = {
      channel_id: channel.id,
      text: text,
      title: textTitle.value,
      source: textSource.value,
    }

    setPublishing(true)
    publishMarkdownInfo(data)
      .then((r) => {
        infoFees.refresh()
        toast.success(t('published'), { duration: 4000 })
        resetAll()
      })
      .catch((err) => {
        handleInfowoodsApiError(err, t, curLogin)
      })
      .finally(() => {
        setPublishing(false)
      })
  }

  return (
    <>
      <form
        className={styles.form}
        id="markdown"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Input
          {...textTitle.bindings}
          type={'text'}
          aria-label={'title'}
          label={t('title')}
          placeholder={t('optional_field')}
          bordered
          fullWidth={true}
          onBlur={(e) => {
            e.preventDefault()
          }}
          value={textTitle.value}
        />

        <MDEditor
          ctx={ctx}
          t={t}
          curLogin={curLogin}
          mdValue={textBody.value}
          setMdValue={textBody.setValue}
        />

        <Input
          {...textSource.bindings}
          type={'text'}
          aria-label={'source'}
          label={t('info_source')}
          placeholder={t('optional_field')}
          bordered
          fullWidth={true}
          onBlur={(e) => {
            e.preventDefault()
          }}
          value={textSource.value}
        />

        <Input
          type={'text'}
          aria-label={'fee'}
          label={t('fee')}
          readOnly
          color={'default'}
          fullWidth={true}
          onBlur={(e) => {
            e.preventDefault()
          }}
          value={mdFee ? `${mdFee?.amount} NUT` : ''}
          contentRight={
            mdFee ? (
              <span className={styles.nth_info}>
                {'✉️ '}
                {t('today_nth')} {mdFee?.nth}
                {t('nth_info')}
              </span>
            ) : (
              <Loading size={'sm'} />
            )
          }
          contentRightStyling={false}
        />

        <div className={styles.buttons}>
          <Button
            type={'submit'}
            size={'lg'}
            color={'gradient'}
            disabled={publishing}
            onPress={toPublishInfo}
          >
            {publishing ? <Loading size={'md'} /> : t('publish')}
          </Button>
        </div>
      </form>
    </>
  )
}

export default FormMarkdown
