import useSWR from 'swr'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { Card, Row, Text, Grid } from '@nextui-org/react'

import { TbTrees } from 'react-icons/tb'
import {
  RiMoneyDollarCircleLine,
  RiUserFollowLine,
  RiSearchLine,
  RiIndeterminateCircleLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri'

import { MdSearch, MdSearchOff } from 'react-icons/md'

import { handleInfowoodsApiError } from '../../../utils/apiUtils'
import { getChannels } from '../../../services/api/infowoods'

import Empty from '../../../widgets/Empty'
import Loading from '../../../widgets/Loading'

import styles from './index.module.scss'
function Channels(props) {
  const { ctx, t, curLogin } = props
  const router = useRouter()

  function useMyChannels() {
    const { data, error } = useSWR('my.channels', getChannels)
    if (error) {
      if (error) {
        handleInfowoodsApiError(error, t, curLogin)
      }
    }
    return {
      data: data,
      isLoading: !error && !data,
      isError: error,
    }
  }

  const myChannels = useMyChannels()

  return (
    <div className={styles.main}>
      <p className={styles.sectionTitle}>
        <TbTrees /> {t('my_channels')}
      </p>
      <div className={styles.cards}>
        {myChannels.isLoading && <Loading size={'lg'} />}
        {myChannels.data && (
          <>
            {myChannels.data?.channels?.length === 0 && (
              <Empty
                text={t('no_records')}
                mainClass={styles.empty}
                imageClass={styles.emptyImage}
                textClass={styles.emptyText}
              />
            )}
            {myChannels?.data?.channels?.length > 0 &&
              myChannels.data.channels.map((item, index) => {
                return (
                  <Card
                    key={index}
                    className={styles.card}
                    isPressable
                    isHoverable
                    variant="bordered"
                    onPress={() => {
                      const path = `channels/${item.id}`
                      router.push(path)
                    }}
                  >
                    <Card.Body>
                      <Text b>{item.title}</Text>

                      {item.description && (
                        <Text className={styles.desc}>{item.description}</Text>
                      )}
                    </Card.Body>
                    <Card.Footer css={{ justifyItems: 'flex-start' }}>
                      <Row wrap="wrap" align="center" className={styles.status}>
                        <Grid className={styles.state}>
                          <RiMoneyDollarCircleLine />
                          <span className={styles.value}>
                            {item.price_per_info} NUT
                          </span>
                        </Grid>
                        <Grid className={styles.state}>
                          <span>
                            <RiSearchLine />
                          </span>
                          <span className={styles.value}>
                            {item.searchable ? (
                              <RiCheckboxCircleLine />
                            ) : (
                              <RiIndeterminateCircleLine />
                            )}
                          </span>
                        </Grid>
                        <Grid className={styles.state}>
                          <RiUserFollowLine />
                          <span className={styles.value}>
                            {item.subscribers}
                          </span>
                        </Grid>
                      </Row>
                    </Card.Footer>
                  </Card>
                )
              })}
          </>
        )}
      </div>
    </div>
  )
}

export default Channels
