import styles from './index.module.scss'

function BottomSheet(props) {
  const { className, children, onClose, title } = props

  return (
    <>
      <div
        className={`${styles.overlay} ${className}`}
        onClick={() => onClose()}
      ></div>
      <div
        className={styles.sheet}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {children}
      </div>
    </>
  )
}

export default BottomSheet
