import React from 'react';
import styles from './ArtCard.module.css';

function ArtCard({ imageUrl, title, artistName, artistStyle, likes, price }) {
    return (
        <div className={styles.artCard}>
            <div
                className={styles.artCardImage}
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className={styles.artCardInfo}>
                <div className={styles.cardRow}>
                    <span className={styles.artCardTitle}>{title}</span>
                    <span className={styles.artCardLikes}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {likes}
                    </span>
                </div>
                <div className={styles.cardRow}>
                    <div className={styles.artistInfo}>
                        <span className={styles.artistName}>{artistName}</span>
                        <span className={styles.artistStyle}>{artistStyle}</span>
                    </div>
                    <span className={styles.artCardPrice}>$ {price}</span>
                </div>
            </div>
        </div>
    );
}

export default ArtCard;