import React from 'react'

import ReactDOM from 'react-dom/client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

import { Button, Textarea } from '@nextui-org/react'
import { RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri'
import { MdOutlineEditNote, MdOutlinePreview } from 'react-icons/md'

import { copyText } from '../../../../../utils/copyUtil'

import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

import styles from './index.module.scss'

function MDEditor(props) {
  const { ctx, t, curLogin, mdValue, setMdValue } = props
  const [onPreview, setOnPreview] = useState(false)
  const [previewRoot, setPreviewRoot] = useState(null)

  useEffect(() => {
    const previewRoot = ReactDOM.createRoot(
      document.getElementById('md-preview')
    )
    setPreviewRoot(previewRoot)
  }, [])

  function updateValue(val) {
    setMdValue(val)
    updatePreview()
  }
  function updatePreview() {
    previewRoot &&
      previewRoot.render(
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>{mdValue}</ReactMarkdown>
      )
  }

  function togglePreview() {
    setOnPreview(!onPreview)
    updatePreview()
  }
  function auto_group_height(element) {
    element.style.height = '5px'
    element.style.height = element.scrollHeight + 'px'
  }
  return (
    <>
      <label className={styles.label}>{t('markdown_body')}</label>
      <div className={styles.editor}>
        <div className={styles.menu}>
          <span className={styles.button} onClick={togglePreview}>
            {onPreview ? (
              <MdOutlineEditNote title={t('edit')} />
            ) : (
              <MdOutlinePreview title={t('preview')} />
            )}
          </span>
        </div>
        <div className={`${styles.editArea} ${onPreview && styles.onPreview}`}>
          <textarea
            className={styles.textarea}
            aria-label={'markdown_body'}
            required
            placeholder={t('required_field')}
            // {t('required_field')}

            onBlur={(e) => {
              e.preventDefault()
            }}
            value={mdValue}
            onChange={(e) => {
              auto_group_height(e.target)
              updateValue(e.target.value)
            }}
          />

          <div className={styles.preview} id="md-preview"></div>
        </div>
      </div>
    </>
  )
}

export default MDEditor
