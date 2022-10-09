import { useRouter } from 'next/router'
import Image from 'next/image'

import { getMixinContext } from '../../../utils/pageUtil'
import { APPS } from '../../../constants'
import BottomSheet from '../../../widgets/BottomSheet'

import styles from './index.module.scss'

function AppsJumper(props) {
  const { t, setShowApps } = props
  const ctx = getMixinContext()
  const router = useRouter()

  const onClick = (name) => {
    if (ctx?.conversation_id) {
      window.open(`mixin://apps/${APPS[name].id}`)
    } else {
      window.open(APPS[name].url)
    }
    setShowApps(false)
  }

  const onClose = () => {
    setShowApps(false)
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.appSheet}>
        <div className={styles.app} onClick={() => onClick('owl')}>
          <Image
            src={APPS.owl.icon}
            alt={t(APPS.owl.title)}
            width={38}
            height={38}
          />
          <div>
            <p className={styles.title}>{t(APPS.owl.title)}</p>
            <p className={styles.desc}>{t(APPS.owl.description)}</p>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default AppsJumper
