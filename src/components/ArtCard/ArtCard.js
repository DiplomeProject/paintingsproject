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
                        <div
                            style={{
                                backgroundImage: `url(/images/pgsForCards/heart.png)`,
                                width: '14px',
                                height: '14px',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                            }}
                        />
                        {likes}
                    </span>
                </div>
                <div className={styles.cardRow}>
                    <div className={styles.artistInfo}>
                        <span className={styles.artistName}>{artistName}</span>
                        <span className={styles.artistStyle}>{artistStyle}</span>
                    </div>
                    <span className={styles.artCardPrice}>
                        <div
                            style={{
                                backgroundImage: `url(/images/pgsForCards/dollar.png)`,
                                width: '21px',
                                height: '21px',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                            }}
                        />
                        {price}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ArtCard;