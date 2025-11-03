import React from "react";

export default function ArtworkCard({ card }) {
    return ( <
        div className = "art-card" >
        <
        div className = "art-thumb" >
        <
        img src = { card.img || "/placeholder.jpg" }
        alt = { card.title || "" }
        /> <
        /div> <
        div className = "art-meta" >
        <
        div className = "art-title" > { card.title || "Untitled" } < /div> {
            "price" in card && ( <
                div className = "art-price" > $ { card.price } < /div>
            )
        } <
        /div> <
        div className = "art-bottom" >
        <
        div className = "art-artist" > { card.artistName } < /div> <
        div className = "art-actions" >
        <
        button className = "art-btn" > ♡ < /button> <
        button className = "art-btn" > ⋯ < /button> <
        /div> <
        /div> <
        /div>
    );
}