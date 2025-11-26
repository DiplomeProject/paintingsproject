import React, { useState, useRef } from "react";
import styles from "./SettingsProfile.module.css";
import deleteCrossIcon from "../../../../../assets/icons/deleteCrossIcon.svg";
import plusIcon from "../../../../../assets/icons/plusIcon.svg";
import arrowIcon from "../../../../../assets/icons/arrowIcon.svg";
import uploadIconPlaceholder from "../../../../../assets/image-placeholder-icon.svg";

const AVAILABLE_STYLES = [
    "Retro", "Psychedelia", "Minimalism", "Cyberpunk", "Realism", "Abstract", "Pop Art"
];

const AVAILABLE_LANGUAGES = [
    "English", "Українська", "Deutsch", "Español", "Français", "Polski"
];

function ProfileSettings({ user }) {
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState('available');
    const [avatarPreview, setAvatarPreview] = useState(user.profileImage || "https://via.placeholder.com/220");
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        displayName: user.name || "Kira Kudo",
        username: user.username || "Kira Kudo",
        instagram: "",
        behance: "",
        tiktok: "",
        twitter: "",
        website: "",
        description: "I create visual solutions..."
    });

    const [styleTags, setStyleTags] = useState(['Retro', 'Psychedelia']);
    const [languageTags, setLanguageTags] = useState(['English', 'Українська']);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
    };

    const handleTagChange = (index, newValue, setTags, currentTags) => {
        const updatedTags = [...currentTags];
        updatedTags[index] = newValue;
        setTags(updatedTags);
    };

    const removeTag = (indexToRemove, setTags, currentTags) => {
        setTags(currentTags.filter((_, index) => index !== indexToRemove));
    };

    const addTag = (setTags, currentTags, availableOptions) => {
        setTags([...currentTags, availableOptions[0]]);
    };

    // --- LOGIC: Avatar Upload ---
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving data:", { status, ...formData, styleTags, languageTags, selectedFile });
    };

    return (
        <form className={styles.settingsContainer} onSubmit={handleSave}>
            {/* statusSection прибрано звідси і перенесено в leftColumn */}

            <div className={styles.formGrid}>
                {/* --- LEFT COLUMN --- */}
                <div className={styles.leftColumn}>

                    {/* ТЕПЕР ЧЕКБОКСИ ТУТ (Верх лівої колонки) */}
                    <div className={styles.statusSection}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkboxInput}
                                checked={status === 'available'}
                                onChange={() => handleStatusChange('available')}
                            />
                            available
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkboxInput}
                                checked={status === 'unavailable'}
                                onChange={() => handleStatusChange('unavailable')}
                            />
                            unavailable
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>User's name</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="text"
                            name="email"
                            value="kudo.kira@gmail.com"
                            readOnly
                            className={styles.inputField}
                        />
                    </div>

                    {/* Styles Tags */}
                    <div className={styles.formGroup}>
                        <label>Style</label>
                        <div className={styles.tagsContainer}>
                            {styleTags.map((tag, index) => (
                                <div key={index} className={styles.tagRow}>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            value={tag}
                                            onChange={(e) => handleTagChange(index, e.target.value, setStyleTags, styleTags)}
                                            className={styles.selectField}
                                        >
                                            {AVAILABLE_STYLES.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <img src={arrowIcon} className={styles.arrowIcon} alt="arrow"/>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeTagBtn}
                                        onClick={() => removeTag(index, setStyleTags, styleTags)}
                                    >
                                        <img src={deleteCrossIcon} alt="Remove" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className={styles.addTagButton}
                            onClick={() => addTag(setStyleTags, styleTags, AVAILABLE_STYLES)}
                        >
                            <img src={plusIcon} alt="Add" />
                        </button>
                    </div>

                    {/* Language Tags */}
                    <div className={styles.formGroup}>
                        <label>Language</label>
                        <div className={styles.tagsContainer}>
                            {languageTags.map((tag, index) => (
                                <div key={index} className={styles.tagRow}>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            value={tag}
                                            onChange={(e) => handleTagChange(index, e.target.value, setLanguageTags, languageTags)}
                                            className={styles.selectField}
                                        >
                                            {AVAILABLE_LANGUAGES.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <img src={arrowIcon} className={styles.arrowIcon} alt="arrow"/>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeTagBtn}
                                        onClick={() => removeTag(index, setLanguageTags, languageTags)}
                                    >
                                        <img src={deleteCrossIcon} alt="Remove" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className={styles.addTagButton}
                            onClick={() => addTag(setLanguageTags, languageTags, AVAILABLE_LANGUAGES)}
                        >
                            <img src={plusIcon} alt="Add" />
                        </button>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className={styles.rightColumn}>

                    {/* АВАТАР ТУТ (Верх правої колонки) - буде на рівні з чекбоксами */}
                    <div className={styles.avatarWrapper}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />

                        <div className={styles.avatarContainer} onClick={handleAvatarClick}>
                            <img
                                src={avatarPreview}
                                alt="User Avatar"
                                className={styles.avatarImage}
                            />
                            <div className={styles.avatarOverlay}>
                                <img src={uploadIconPlaceholder} className={styles.uploadIcon} alt="Upload" />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className={styles.formGroup}>
                        <label>Instagram (link)</label>
                        <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Behance (link)</label>
                        <input type="text" name="behance" value={formData.behance} onChange={handleInputChange} className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Tik Tok (link)</label>
                        <input type="text" name="tiktok" value={formData.tiktok} onChange={handleInputChange} className={styles.inputField} />
                    </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={styles.textArea}
                    />
                </div>
            </div>

            <button type="submit" className={styles.saveButton}>Save</button>
        </form>
    );
}

export default ProfileSettings;