import { useState, useMemo, useEffect } from 'react';

/**
 * Хук для керування логікою пагінації.
 * @param {Array} data - Повний масив даних (наприклад, filteredArtists).
 * @param {number} itemsPerPage - Кількість елементів на сторінці.
 * @returns {object} - Об'єкт зі станом пагінації та даними для поточної сторінки.
 */
export const usePagination = (data, itemsPerPage) => {
    const [currentPage, setCurrentPage] = useState(0);

    const totalPages = useMemo(() => {
        return Math.ceil(data.length / itemsPerPage);
    }, [data.length, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages - 1) {
            setCurrentPage(0);
        }
    }, [data.length, totalPages, currentPage]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [currentPage]);

    const displayedData = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, data, itemsPerPage]);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData
    };
};