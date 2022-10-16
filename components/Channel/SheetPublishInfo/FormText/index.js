import useSWR from 'swr'
import { useState, useEffect, useContext, useMemo } from 'react'

import toast from 'react-hot-toast'
import {
  Tooltip,
  Text,
  Button,
  Grid,
  Input,
  Textarea,
  useInput,
} from '@nextui-org/react'
import React from 'react'

import { publishTextInfo } from '../../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../../utils/apiUtils'
import Loading from '../../../../widgets/Loading'
import styles from './index.module.scss'

function FormText(props) {
  const { ctx, t, curLogin, channel, refreshChannel, infoFees } = props

  const textTitle = useInput('')
  const textBody = useInput('')
  const textSource = useInput('')
  const [publishing, setPublishing] = useState(false)

  function resetAll() {
    textTitle.reset()
    textBody.reset()
    textSource.reset()
  }

  function toPublishInfo() {
    // validate values
    if (!textBody.value) {
      toast.error(t('text_body_required'))
      return
    }
    const data = {
      channel_id: channel.id,
      text: textBody.value,
      title: textTitle.value,
      source: textSource.value,
    }

    setPublishing(true)
    publishTextInfo(data)
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

  const textFee = infoFees?.data?.publish?.TEXT

  return (
    <>
      <form
        className={styles.form}
        id="text"
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

        <Textarea
          {...textBody.bindings}
          aria-label={'text_body'}
          label={t('text_body')}
          fullWidth={true}
          required
          placeholder={t('required_field')}
          bordered
          minRows={6}
          maxRows={20}
          onBlur={(e) => {
            e.preventDefault()
          }}
          value={textBody.value}
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
          fullWidth={true}
          onBlur={(e) => {
            e.preventDefault()
          }}
          value={textFee ? `${textFee?.amount} NUT` : ''}
          contentRight={
            textFee ? (
              <span className={styles.nth_info}>
                {'✉️ '}
                {t('today_nth')} {textFee?.nth}
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

export default FormText
