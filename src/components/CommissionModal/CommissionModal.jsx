import React from "react";
import styles from "./CommissionModal.module.css";

const CommissionModal = ({ commission, onClose, variant = "basic" }) => {
  if (!commission) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.topSection}>
          <img
            src={commission.image}
            alt={commission.title}
            className={styles.image}
          />

          <div className={styles.info}>
            <h2 className={styles.title}>{commission.title}</h2>

            <p className={styles.field}>
              <span>Category</span> {commission.category}
            </p>
            <p className={styles.field}>
              <span>Style</span> {commission.style}
            </p>
            <p className={styles.field}>
              <span>File format</span> {commission.fileFormat}
            </p>
            <p className={styles.field}>
              <span>Size</span> {commission.size}
            </p>

            {variant === "detailed" && (
              <img
                src={commission.authorIcon}
                alt="author"
                className={styles.authorIcon}
              />
            )}
          </div>
        </div>

        {variant === "detailed" && commission.previews && (
          <div className={styles.previewRow}>
            {commission.previews.map((img, index) => (
              <img key={index} src={img} alt="" className={styles.previewImg} />
            ))}
          </div>
        )}

        <div className={styles.about}>
          <h3>About</h3>
          <p>{commission.about}</p>
          <p className={styles.feelings}>
            <b>Feelings:</b> {commission.feelings}
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.priceBtn}>{commission.price}$</button>
          <button className={styles.takeBtn}>Take</button>
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;
