import React, { useState } from "react";
import styles from "./DigitalBrushProfile.module.css";
import MyImages from "./MyImages/MyImages";
import ProfileSettings from "./SettingsProfile/SettingsProfile";

import infoIcon from '../../../../assets/infoIcon.svg';
import globeIcon from '../../../../assets/icons/globeIcon.svg';
import heartIcon from '../../../../assets/icons/heartIcon.svg';
import userIcon from "../../../../assets/icons/userIcon.svg";
import pictureIcon from "../../../../assets/icons/pictureIcon.svg";
import calendarIcon from "../../../../assets/icons/calendarIcon.svg";
import comissionIcon from "../../../../assets/icons/comissionIcon.svg";
import walletIcon from "../../../../assets/icons/walletIcon.svg";
import closeIcon from "../../../../assets/closeCross.svg";
import plusIcon from "../../../../assets/icons/plusIcon.svg";
import MyCommission from "./MyCommission/MyCommission";

function DigitalBrushProfile({ user, onLogout }) {
    // Стан для відстеження поточної вкладки
    // Можливі варіанти: 'settings', 'images', 'commission', 'payment', 'calendar'
    const [activeTab, setActiveTab] = useState('images');

    const totalLikes = "0"; // Можна потім брати з user

    // Функція для рендерингу правої частини
    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <ProfileSettings user={user} />;
            case 'images':
                return <MyImages user={user} />;
            case 'commission':
                return <MyCommission user={user} />;
            case 'payment':
                return <div className={styles.placeholder}>Payment Component (Coming Soon)</div>;
            case 'calendar':
                return <div className={styles.placeholder}>Calendar Component (Coming Soon)</div>;
            default:
                return <MyImages user={user} />;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* --- ЛІВА ЧАСТИНА (SIDEBAR) --- */}
                <aside className={styles.sidebar}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={user.profileImage || "/images/profileImg.jpg"}
                            alt={user.name}
                            className={styles.avatar}
                        />
                    </div>

                    <div>
                        <h1 className={styles.artistName}>
                            {user.name || "Artist"}
                            <span className={styles.status}>(available)</span>
                        </h1>
                    </div>

                    <div className={styles.metaInfo}>
                        <div className={styles.metaRow}>
                            <img src={infoIcon} alt="Style" className={styles.socialicon} />
                            <span>Retro/Psychedelia</span>
                        </div>
                        <div className={styles.metaRow}>
                            <img src={globeIcon} alt="Country" className={styles.socialicon} />
                            <span>En/Ukr</span>
                        </div>
                        <div className={styles.metaRow}>
                            <img src={heartIcon} alt="Likes" className={styles.socialicon} />
                            <span>{totalLikes}</span>
                        </div>
                    </div>

                    <p className={styles.bio}>
                        {user.bio || "Welcome to my profile! No description provided yet."}
                    </p>

                    {/* КНОПКИ З ЛОГІКОЮ АКТИВНОГО СТАНУ */}
                    <div className={styles.actionButtonsContainer}>

                        <button
                            className={`${styles.profileSettingsBtn} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <img src={userIcon} alt="UserIcon" className={styles.btnicon} />
                            Settings profile
                        </button>

                        <button
                            className={`${styles.imagesBtn} ${activeTab === 'images' ? styles.active : ''}`}
                            onClick={() => setActiveTab('images')}
                        >
                            <img src={pictureIcon} alt="PictureIcon" className={styles.btnicon} />
                            My images
                            <img src={plusIcon} alt="PlusIcon" className={styles.plusIcon}/>
                        </button>

                        <button
                            className={`${styles.comissionBtn} ${activeTab === 'commission' ? styles.active : ''}`}
                            onClick={() => setActiveTab('commission')}
                        >
                            <img src={comissionIcon} alt="ComissionIcon" className={styles.btnicon} />
                            My Commission
                            <img src={plusIcon} alt="PlusIcon" className={styles.plusIcon}/>
                        </button>

                        <button
                            className={`${styles.paymentBtn} ${activeTab === 'payment' ? styles.active : ''}`}
                            onClick={() => setActiveTab('payment')}
                        >
                            <img src={walletIcon} alt="PaymentIcon" className={styles.btnicon} />
                            Payment
                        </button>

                        <button
                            className={`${styles.calendarBtn} ${activeTab === 'calendar' ? styles.active : ''}`}
                            onClick={() => setActiveTab('calendar')}
                        >
                            <img src={calendarIcon} alt="CalendarIcon" className={styles.btnicon} />
                            Calendar
                        </button>

                        <button className={styles.logoutBtn} onClick={onLogout}>
                            <img src={closeIcon} alt="LogoutIcon" className={styles.btnicon} />
                            Log out
                        </button>
                    </div>
                </aside>

                {/* --- ПРАВА ЧАСТИНА (ЗМІННИЙ КОНТЕНТ) --- */}
                <main className={styles.gallerySection}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default DigitalBrushProfile;