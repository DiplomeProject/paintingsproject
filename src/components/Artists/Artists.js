import React, { useState } from "react";
import "./Artists.css";

export default function Artists() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);

    const categories = [
        "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES",
        "MOCKUPS", "UI/UX", "ADVERTISING", "BRENDING", "POSTER",
        "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
    ];

    const artists = [{
            id: 1,
            name: "Artist #1",
            country: "Spain",
            style: "2D AVATARS",
            avatar: "/images/author.png",
            artworks: [
                { title: "Artwork 1", price: "$ 40.26", img: "/images/image1.png" },
                { title: "Artwork 2", price: "$ 73.70", img: "/images/image2.png" },
                { title: "Artwork 3", price: "$ 118.02", img: "/images/image3.png" },
                { title: "Artwork 4", price: "$ 114.28", img: "/images/image4.png" },
            ],
        },
        {
            id: 2,
            name: "Artist #2",
            country: "Italy",
            style: "3D MODELS",
            avatar: "/images/author.png",
            artworks: [
                { title: "Artwork 1", price: "$ 56.22", img: "/images/image1.png" },
                { title: "Artwork 2", price: "$ 67.88", img: "/images/image2.png" },
                { title: "Artwork 3", price: "$ 99.45", img: "/images/image3.png" },
                { title: "Artwork 4", price: "$ 83.01", img: "/images/image4.png" },
            ],
        },
    ];

    const filteredArtists = artists.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.style.toLowerCase().includes(search.toLowerCase()) ||
        a.country.toLowerCase().includes(search.toLowerCase())
    );

    return ( <
        div className = "artistsPage" >
        <
        div className = "contentWrapper" > { /* === Верхня частина === */ } <
        div className = "artistsHeader" >
        <
        h1 className = "artistsTitle" > ARTISTS < /h1> <
        div className = "artistsSearchBar" >
        <
        svg xmlns = "http://www.w3.org/2000/svg"
        className = "searchIcon"
        viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        strokeLinecap = "round"
        strokeLinejoin = "round" >
        <
        circle cx = "11"
        cy = "11"
        r = "8" / >
        <
        line x1 = "21"
        y1 = "21"
        x2 = "16.65"
        y2 = "16.65" / >
        <
        /svg> <
        input className = "artistsSearchInput"
        type = "text"
        placeholder = "Search artist name, style, or country..."
        value = { search }
        onChange = {
            (e) => setSearch(e.target.value) }
        /> <
        /div> <
        /div>

        { /* === Категорії === */ } <
        div className = "categoryGrid" > {
            categories.map((cat) => ( <
                button key = { cat }
                className = { `categoryButton ${
                activeCategory === cat ? "active" : ""
              }` }
                onClick = {
                    () => setActiveCategory(cat) } >
                { cat } <
                /button>
            ))
        } <
        /div>

        { /* === Список артистів === */ } <
        div className = "artistsContent" > {
            filteredArtists.map((artist) => ( <
                div key = { artist.id }
                className = "artistRow" >
                <
                div className = "artistInfoRow" >
                <
                img src = { artist.avatar }
                alt = { artist.name }
                className = "artistAvatar" /
                >
                <
                div className = "artistText" >
                <
                div className = "artistName" > { artist.name } < /div> <
                div className = "artistStyle" > { artist.style } < /div> <
                div className = "artistCountry" > { artist.country } < /div> <
                /div> <
                /div>

                <
                div className = "artistGalleryRow" > {
                    artist.artworks.map((art, i) => ( <
                        div key = { i }
                        className = "artistCard" >
                        <
                        img src = { art.img }
                        alt = { art.title }
                        className = "artistCardImg" /
                        >
                        <
                        div className = "artistCardInfo" >
                        <
                        span className = "artistCardTitle" > { art.title } < /span> <
                        span className = "artistCardPrice" > { art.price } < /span> <
                        /div> <
                        /div>
                    ))
                } <
                /div> <
                /div>
            ))
        }

        {
            filteredArtists.length === 0 && ( <
                div className = "noResults" > No artists found < /div>
            )
        } <
        /div> <
        /div> <
        /div>
    );
}