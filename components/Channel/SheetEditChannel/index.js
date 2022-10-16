import useSWR from 'swr'
import { useState, useEffect, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
  Button,
  Switch,
  Input,
  Textarea,
  useInput,
  Grid,
} from '@nextui-org/react'
import React from 'react'

import { RiProfileLine } from 'react-icons/ri'
import { MdSearch, MdSearchOff } from 'react-icons/md'

import { modifyChannel } from '../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../utils/apiUtils'

import Loading from '../../../widgets/Loading'
import BottomSheet from '../../../widgets/BottomSheet'

import styles from './index.module.scss'

function SheetEditChannel(props) {
  const { ctx, t, curLogin, showEdit, setShowEdit, channel, refreshChannel } =
    props
  const title = useInput(channel?.title)
  const description = useInput(channel?.description)
  const price_per_info = useInput(channel?.price_per_info)
  const searchable = useInput(channel?.searchable)
  const [saving, setSaving] = useState(false)

  function onClose() {
    setShowEdit(false)
    title.reset()
    description.reset()
    searchable.reset()
    price_per_info.reset()
  }

  const saveChannelProfile = () => {
    let data = {}
    if (title.value && title.value !== channel.title) data.title = title.value
    if (description.value !== channel.description)
      data.description = description.value
    if (searchable.value !== channel.searchable)
      data.searchable = searchable.value
    if (price_per_info.value !== channel.price_per_info)
      data.price_per_info = price_per_info.value

    if (Object.keys(data).length === 0) {
      toast(t('no_change_in_profile'), {
        icon: '🤷',
      })

      return
    }

    setSaving(true)
    data.channel_id = channel.id
    const rsp = modifyChannel(data)
      .then((rsp) => {
        console.log('rsp :>> ', rsp)
        refreshChannel()
        toast.success(t('save_success'), { duration: 3000 })
        setShowEdit(false)
      })
      .catch((err) => {
        handleInfowoodsApiError(err, t, curLogin)
      })
      .finally(() => {
        setSaving(false)
      })
  }

  return (
    <>
      <BottomSheet onClose={onClose} showing={showEdit} closeAtLeft>
        <div className={styles.wrap}>
          <div className={styles.sheetTitle}>
            <RiProfileLine />
            <div>{t('edit_channel')}</div>
          </div>

          {channel && (
            <>
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <Input
                  {...title.bindings}
                  aria-label={'title'}
                  label={t('title')}
                  required
                  bordered
                  color={'default'}
                  fullWidth={true}
                  // initialValue={title.value}
                  value={title.value}
                  onBlur={(e) => {
                    e.preventDefault()
                  }}
                />

                <Textarea
                  {...description.bindings}
                  aria-label={'description'}
                  label={t('description')}
                  clearable
                  bordered
                  fullWidth={true}
                  // initialValue={description.value}
                  value={description.value}
                  onBlur={(e) => {
                    e.preventDefault()
                  }}
                />

                <Grid className={styles.grid}>
                  <Switch
                    onChange={(e) => {
                      searchable.setValue(e.target.checked)
                    }}
                    className={styles.switch}
                    size={'xl'}
                    // initialChecked={searchable.value}
                    checked={searchable.value}
                    iconOn={<MdSearch />}
                    iconOff={<MdSearchOff />}
                    onBlur={(e) => {
                      e.preventDefault()
                    }}
                  />
                  <label aria-label={'searchable'}>
                    {searchable.value
                      ? t('allow_search')
                      : t('not_allow_search')}
                  </label>
                </Grid>
                <Input
                  {...price_per_info.bindings}
                  aria-label={'price_per_info'}
                  label={t('price_per_info')}
                  type={'number'}
                  min={0}
                  max={100}
                  step={0.01}
                  bordered
                  fullWidth={true}
                  initialValue={price_per_info.value}
                  onBlur={(e) => {
                    e.preventDefault()
                  }}
                />

                <div className={styles.buttons}>
                  <Button
                    type="submit"
                    onPress={saveChannelProfile}
                    disabled={saving}
                    auto
                    rounded
                    // bordered
                    color="gradient"
                    size="lg"
                  >
                    {saving ? <Loading size={'sm'} /> : t('save')}
                  </Button>
                </div>
              </form>
            </>
          )}
          {!channel && <Loading size={'md'} />}
        </div>
      </BottomSheet>
    </>
  )
}

export default SheetEditChannel
