import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { RiArrowLeftLine, RiArrowDownSLine } from 'react-icons/ri'

import { toLogin } from '../../utils/loginUtil'
import Avatar from '../../widgets/Avatar'

import { APPS } from '../../constants'
import favIconImg from '../../public/favicon.png'

import styles from './index.module.scss'

function TopBar(props) {
  const { ctx, t, curLogin, backPath, showApps, setShowApps } = props

  const router = useRouter()

  const avatarLink = (path) => {
    switch (path) {
      case '/user':
        break
      default:
        return '/user'
    }
  }

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {backPath && (
          <RiArrowLeftLine
            className={styles.back}
            onClick={() => {
              router.push(backPath)
            }}
          />
        )}

        {!backPath && curLogin?.user && (
          <div className={styles.avatar}>
            <Avatar
              isGroup={curLogin?.group?.is_group}
              imgSrc={curLogin?.user?.avatar}
              onClick={() => {
                const link = avatarLink(router.pathname)
                if (link) {
                  router.push(link)
                }
              }}
            />
          </div>
        )}
        {!backPath && !curLogin?.user && (
          <div className={styles.login} onClick={() => toLogin()}>
            <span>
              {curLogin?.group?.is_group ? t('owner_login') : t('login')}
            </span>
          </div>
        )}
      </div>

      <div className={styles.middle}>
        <div
          className={styles.app}
          onClick={() => {
            setShowApps(true)
          }}
        >
          <Image src={favIconImg} alt="favicon" width={24} height={24} />
          <span className={styles.title}>{t(APPS.oak.title)}</span>
          <span className={showApps ? styles.active : styles.passive}>
            <RiArrowDownSLine className={styles.arrow} />
          </span>
        </div>
      </div>
      <div className={styles.right}></div>
    </div>
  )
}

export default TopBar
