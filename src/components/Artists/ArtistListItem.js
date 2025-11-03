import React from "react";

export default function ArtistListItem({ artist, active, onClick }) {
    // Безопасная обработка данных без optional chaining
    const safeArtist = artist || {};
    const name = safeArtist.name ? safeArtist.name : "Unknown Artist";
    const country = safeArtist.country ? safeArtist.country : "";
    const years = safeArtist.years ? safeArtist.years : "";
    const styles = Array.isArray(safeArtist.styles) ?
        safeArtist.styles.join(", ") :
        safeArtist.style ?
        safeArtist.style :
        "";

    const avatar = safeArtist.avatar ? safeArtist.avatar : "/images/author.png";

    return ( <
        button className = { `aside-item ${active ? "active" : ""}` }
        onClick = { onClick }
        style = {
            {
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 16px",
                color: "#fff",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "all 0.2s ease",
            }
        } >
        { /* Аватар */ } <
        div className = "aside-avatar"
        style = {
            {
                width: 64,
                height: 64,
                borderRadius: "50%",
                overflow: "hidden",
                marginRight: 16,
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.2)",
            }
        } >
        <
        img src = { avatar }
        alt = { name }
        style = {
            {
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }
        }
        /> <
        /div>

        { /* Текстовая часть */ } <
        div className = "aside-meta"
        style = {
            { flex: 1 } } >
        <
        div className = "aside-name"
        style = {
            { fontWeight: 700, fontSize: 18, marginBottom: 4 } } >
        { name } <
        /div> {
            country ? ( <
                div className = "aside-line"
                style = {
                    { fontSize: 14, opacity: 0.8 } } > { country } <
                /div>
            ) : null
        } {
            years ? ( <
                div className = "aside-line"
                style = {
                    { fontSize: 14, opacity: 0.8 } } > { years } <
                /div>
            ) : null
        } {
            styles ? ( <
                div className = "aside-line"
                style = {
                    { fontSize: 14, opacity: 0.8 } } > { styles } <
                /div>
            ) : null
        } <
        /div>

        { /* Стрелка */ } <
        div className = "aside-arrow"
        style = {
            {
                fontSize: 24,
                fontWeight: 600,
                marginLeft: 8,
                opacity: 0.5,
            }
        } >
        ›
        <
        /div> <
        /button>
    );
}