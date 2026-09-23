import styles from './tank-scene.module.css';

/** Decorative product illustration, rendered locally with CSS surfaces. */
export default function TankScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.scene} ${compact ? styles.compact : ''}`} aria-hidden="true">
      <div className={styles.halo} /><div className={styles.orbit} /><div className={styles.platform} />
      <div className={styles.tanks}>
        {['back', 'side', 'front'].map((position) => (
          <div key={position} className={`${styles.tank} ${styles[position]}`}>
            <div className={styles.lid} /><div className={styles.top} />
            <div className={styles.cylinder}>
              <div className={styles.rib} /><div className={styles.rib} />
              <span className={styles.wordmark}>مميز<small>MOMAYAZ</small></span>
              <div className={styles.rib} /><div className={styles.rib} /><span className={styles.outlet} />
            </div>
          </div>
        ))}
      </div>
      {!compact && <>
        <div className={`${styles.label} ${styles.labelTop}`}><span className={styles.labelIcon}>◇</span><span>صناعة بدقة<small>عناية بكل التفاصيل</small></span></div>
        <div className={`${styles.label} ${styles.labelBottom}`}><span className={styles.labelIcon}>≋</span><span>خزانات مميز<small>حلول تخزين المياه</small></span></div>
        <span className={styles.caption}>MOMAYAZ / WATER SOLUTIONS</span>
      </>}
    </div>
  );
}
