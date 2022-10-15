import React from 'react'
import useSWR from 'swr'
import { useState, useEffect, useContext, useMemo } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button, Input, useInput } from '@nextui-org/react'
import {
  RiFileCopy2Line,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from 'react-icons/ri'
import { AiOutlineClear } from 'react-icons/ai'

import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { createMarkdownEditor } from 'tiptap-markdown'

import { publishMarkdownInfo } from '../../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../../utils/apiUtils'
import { copyText } from '../../../../utils/copyUtil'
import Loading from '../../../../widgets/Loading'

import styles from './index.module.scss'

const MarkdownEditor = createMarkdownEditor(Editor)

function FormMarkdown(props) {
  const { ctx, t, curLogin, channel, refreshChannel, infoFees } = props

  const textTitle = useInput('')
  const textBody = useInput('')
  const textSource = useInput('')
  const [publishing, setPublishing] = useState(false)
  const mdFee = infoFees?.data?.publish?.MARKDOWN

  const [editor, _] = useState(
    new MarkdownEditor({
      placeholder: t('required_filed'),
      extensions: [StarterKit, Highlight, Typography],
      content: '',
    })
  )

  function toPublishInfo() {
    const text = editor.getMarkdown()
    // const text = textBody.value
    // validate values
    if (!text) {
      toast.error(t('text_body_required'))
      editor.commands.focus()
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
        <div>
          <span className={styles.label}>{t('markdown_body')}</span>
          <div className={styles.editorWrap}>
            <div className={styles.menu}>
              <button
                title={t('copy_all')}
                onClick={() => {
                  copyText(editor.getMarkdown(), t)
                }}
              >
                <RiFileCopy2Line />
              </button>
              <button
                title={t('clear_all')}
                onClick={() => {
                  editor.commands.clearContent(true)
                }}
              >
                <AiOutlineClear />
              </button>
              <div className={styles.divider}></div>
              <button
                title={t('undo')}
                onClick={() => {
                  editor.commands.undo()
                }}
              >
                <RiArrowGoBackLine />
              </button>
              <button
                title={t('redo')}
                onClick={() => {
                  editor.commands.redo()
                }}
              >
                <RiArrowGoForwardLine />
              </button>
            </div>

            <EditorContent className={styles.editArea} editor={editor} />
          </div>
        </div>

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
