import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import Icon from '../../widgets/Icon'
const BottomSheet = dynamic(() => import('../../widgets/BottomSheet'))

import storageUtil from '../../utils/storageUtil'

import styles from './index.module.scss'
import favImg from '../../public/favicon.png'
import favImgOwl from '../../public/favicon-owl.png'

function TopBar(props) {
  const { url } = props
  const { t } = useTranslation('common')
  const router = useRouter()
  const [show, setShow] = useState(false)

  const botList = {
    owl: {
      id: '60d30faa-3825-48da-ac1c-6aca1f573dd5',
      url: 'https://mixin.owldeliver.one',
    },
  }

  const handleClose = () => setShow(false)

  const handleBotClick = (name) => {
    setShow(false)
    if (storageUtil.get('platform') === 'browser') {
      window.open(botList[name].url)
    } else {
      window.open(`mixin://apps/${botList[name].id}`)
    }
  }

  return (
    <div className={styles.bar}>
      {url && (
        <Icon
          className={styles.back}
          type="arrow-right"
          onClick={() => {
            router.push(url)
          }}
        />
      )}
      <div
        className={`${styles.icon} ${url && styles.iconPadding}`}
        onClick={() => setShow(true)}
      >
        <Image src={favImg} alt="favico" width={28} height={28} />
        <span>Oak Topic Hub</span>
        <Icon
          type="arrow-right"
          className={show ? styles.active : styles.inactive}
        />
      </div>

      <BottomSheet
        t={t}
        show={show}
        onClose={handleClose}
        onCancel={handleClose}
      >
        <div className={styles.botWrap}>
          <div className={styles.bot} onClick={() => handleBotClick('owl')}>
            <Image
              src={favImgOwl}
              alt="owl deliver"
              width={38}
              height={38}
              layout="fixed"
            />
            <div>
              <p>Owl Deliver</p>
              <p>Subscribe all kinds of feeds</p>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default TopBar
