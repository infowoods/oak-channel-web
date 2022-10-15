import useSWR from 'swr'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { TbTree, TbSeeding } from 'react-icons/tb'
import { RiFileCopyLine } from 'react-icons/ri'
import {
  getFees_Channels,
  createChannel,
} from '../../../services/api/infowoods'
import { handleInfowoodsApiError } from '../../../utils/apiUtils'
import { copyText } from '../../../utils/copyUtil'

import BottomSheet from '../../../widgets/BottomSheet'

import { Grid, Input, Button, useInput, Loading } from '@nextui-org/react'

import styles from './index.module.scss'

function ChannelCreate(props) {
  const { ctx, t, curLogin, showCreating, setShowCreating } = props
  const router = useRouter()

  const [creating, setCreating] = useState(false)
  const title = useInput(t('new_channel'))

  function useFees() {
    const { data, error, mutate } = useSWR(
      'fee.createChannel',
      getFees_Channels
    )
    if (error) {
      handleInfowoodsApiError(error, t, curLogin)
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
      refresh: () => {
        mutate()
      },
    }
  }

  const fees = useFees()
  const createFee = fees?.data?.fees?.create_channel

  function onClose() {
    setShowCreating(false)
  }

  function toCreate() {
    if (!title.value) return

    setCreating(true)
    createChannel({ title: title.value })
      .then((rsp) => {
        toast.success(t('channel_created'))
        setTitle(t('new_channel'))

        router.push(`/channels/${rsp.channel.id}`)
      })
      .catch((error) => {
        handleInfowoodsApiError(error, t, curLogin)
      })
      .finally(() => {
        setCreating(false)
        onClose()
      })
  }

  return (
    <BottomSheet onClose={onClose} showing={showCreating}>
      <div className={styles.wrap}>
        <div className={styles.sheetTitle}>
          <TbSeeding />
          <div>{t('create_channel')}</div>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <Input
            {...title.bindings}
            type={'text'}
            label={t('title')}
            required
            bordered
            color={'default'}
            fullWidth={true}
            initialValue={title.value}
            onBlur={(e) => {
              e.preventDefault()
            }}
          />

          <Input
            className={styles.input}
            type={'text'}
            label={t('fee')}
            readOnly
            color={'default'}
            fullWidth={true}
            onBlur={(e) => {
              e.preventDefault()
            }}
            value={createFee ? `${createFee.amount} NUT` : ''}
            contentRight={
              createFee ? (
                <span className={styles.nth_info}>
                  {'🌲 '}
                  {t('nth_before')} {createFee.nth}
                  {t('nth_channel_after')}
                </span>
              ) : (
                <Loading size={'sm'} />
              )
            }
            contentRightStyling={false}
          />

          <div className={styles.buttons}>
            <Button
              type="submit"
              disabled={creating}
              color={'primary'}
              size={'lg'}
              onPress={() => toCreate()}
            >
              {creating ? <Loading size={'md'} /> : t('confirm_to_create')}
            </Button>
          </div>
        </form>
      </div>
    </BottomSheet>
  )
}

export default ChannelCreate
