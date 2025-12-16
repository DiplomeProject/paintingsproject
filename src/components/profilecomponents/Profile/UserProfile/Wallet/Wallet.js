import React, { useState, useMemo } from 'react';
import styles from './Wallet.module.css';
import CategoryFilters from '../../../../CategoryFilters/CategoryFilters';
import Pagination from '../../../../hooks/Pagination/Pagination';
import { usePagination } from '../../../../hooks/Pagination/usePagination';

// --- MOCK DATA (EN) ---
const walletData = {
    '2025': {
        categoriesYearly: [
            { name: 'Paintings', amount: 2100, percent: 60 },
            { name: 'Commissions', amount: 900, percent: 26 },
            { name: 'Donations', amount: 450, percent: 14 },
        ],
        chart: [
            { name: 'JAN', income: 400, details: { 'Paintings': 300, 'Commissions': 100, 'Donations': 0 } },
            { name: 'FEB', income: 300, details: { 'Paintings': 200, 'Commissions': 50, 'Donations': 50 } },
            { name: 'MAR', income: 600, details: { 'Paintings': 400, 'Commissions': 150, 'Donations': 50 } },
            { name: 'APR', income: 800, details: { 'Paintings': 500, 'Commissions': 200, 'Donations': 100 } },
            { name: 'MAY', income: 500, details: { 'Paintings': 300, 'Commissions': 100, 'Donations': 100 } },
            { name: 'JUN', income: 900, details: { 'Paintings': 600, 'Commissions': 200, 'Donations': 100 } },
            { name: 'JUL', income: 1200, details: { 'Paintings': 800, 'Commissions': 300, 'Donations': 100 } },
        ],
        transactions: [
            { id: 1, title: 'Commissioned portrait', date: '12.07.2025', month: 'JUL', amount: 150, status: 'Completed', category: 'Commissions' },
            { id: 2, title: 'Abstraction "Dream"', date: '10.07.2025', month: 'JUL', amount: 80, status: 'Completed', category: 'Paintings' },
            { id: 3, title: 'Withdrawal', date: '05.07.2025', month: 'JUL', amount: -200, status: 'Processing', category: 'Withdraw' },
            { id: 4, title: 'Commission for "Forest"', date: '01.07.2025', month: 'JUL', amount: 300, status: 'Completed', category: 'Commissions' },
            { id: 5, title: 'Landscape "Morning"', date: '15.06.2025', month: 'JUN', amount: 400, status: 'Completed', category: 'Paintings' },
            { id: 6, title: 'Fan donation', date: '10.06.2025', month: 'JUN', amount: 50, status: 'Completed', category: 'Donations' },
            { id: 7, title: 'Sketch', date: '05.05.2025', month: 'MAY', amount: 100, status: 'Completed', category: 'Commissions' },
        ]
    },
    '2024': {
        categoriesYearly: [
            { name: 'Paintings', amount: 12000, percent: 80 },
            { name: 'Commissions', amount: 3000, percent: 20 },
            { name: 'Donations', amount: 200, percent: 1 },
        ],
        chart: [
            { name: 'JAN', income: 1200, details: { 'Paintings': 1000, 'Commissions': 200 } },
            { name: 'FEB', income: 1500, details: { 'Paintings': 1200, 'Commissions': 300 } },
        ],
        transactions: [
            { id: 10, title: 'Withdrawal', date: '28.12.2024', month: 'DEC', amount: -5000, status: 'Completed', category: 'Withdraw' },
            { id: 11, title: 'Collection "Winter"', date: '15.12.2024', month: 'DEC', amount: 1200, status: 'Completed', category: 'Paintings' },
        ]
    }
};

const MONTHS = [
    { code: 'JAN', label: 'JANUARY' },
    { code: 'FEB', label: 'FEBRUARY' },
    { code: 'MAR', label: 'MARCH' },
    { code: 'APR', label: 'APRIL' },
    { code: 'MAY', label: 'MAY' },
    { code: 'JUN', label: 'JUNE' },
    { code: 'JUL', label: 'JULY' },
    { code: 'AUG', label: 'AUGUST' },
    { code: 'SEP', label: 'SEPTEMBER' },
    { code: 'OCT', label: 'OCTOBER' },
    { code: 'NOV', label: 'NOVEMBER' },
    { code: 'DEC', label: 'DECEMBER' },
];

const Wallet = () => {
    const [activeYear, setActiveYear] = useState('2025');
    const [selectedMonth, setSelectedMonth] = useState(null);

    const years = ['2025', '2024'];
    const currentData = walletData[activeYear];

    const categoryStats = useMemo(() => {
        if (!selectedMonth) {
            return currentData.categoriesYearly;
        }
        const monthData = currentData.chart.find(item => item.name === selectedMonth);
        if (!monthData || !monthData.details) return [];
        const totalMonthIncome = monthData.income;

        return Object.entries(monthData.details).map(([name, amount]) => ({
            name,
            amount,
            percent: totalMonthIncome > 0 ? Math.round((amount / totalMonthIncome) * 100) : 0
        })).sort((a, b) => b.amount - a.amount);
    }, [selectedMonth, currentData]);

    const filteredTransactions = useMemo(() => {
        if (!selectedMonth) return currentData.transactions;
        return currentData.transactions.filter(t => t.month === selectedMonth);
    }, [selectedMonth, currentData]);

    // Використання хука usePagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData
    } = usePagination(filteredTransactions, 5); // 5 елементів на сторінку

    // Підготовка даних для 12 місяців під дизайн зі скрінів
    const incomesByMonth = MONTHS.map(m => {
        const found = currentData.chart.find(c => c.name === m.code);
        return { ...m, income: found ? found.income : 0 };
    });
    const maxIncome = incomesByMonth.reduce((mx, m) => Math.max(mx, m.income), 0) || 1;

    return (
        <div className={styles.walletContainer}>
            <header className={styles.header}>
                <div className={styles.headerActions}>
                    <div className={styles.yearFilterWrapper}>
                        <CategoryFilters
                            categories={years}
                            activeCategory={activeYear}
                            onCategoryClick={(year) => {
                                setActiveYear(year);
                                setSelectedMonth(null);
                                setCurrentPage(0);
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Верхня зона: ліворуч 12 місяців, праворуч картка категорій */}
            <div className={styles.topGrid}>
                <div className={styles.monthsPanel}>
                    {incomesByMonth.map((m) => {
                        const percent = Math.round((m.income / maxIncome) * 100);
                        const active = selectedMonth === m.code;
                        return (
                            <button
                                key={m.label}
                                className={`${styles.monthRow} ${active ? styles.monthActive : ''}`}
                                onClick={() => {
                                    setSelectedMonth(active ? null : m.code);
                                    setCurrentPage(0);
                                }}
                                title={`Income: ${m.income}`}
                            >
                                <div className={styles.barTrack}>
                                    <div className={styles.barFill} style={{ width: `${percent}%` }} />
                                </div>
                                <span className={styles.monthLabel}>{m.label}</span>
                            </button>
                        );
                    })}
                </div>

                <aside className={styles.categoryCard}>
                    <div className={styles.categoryCardInner}>
                        <div className={styles.categoryHeader}>CATEGORY</div>
                        <div className={styles.categoryListCompact}>
                            {categoryStats.map((cat, idx) => (
                                <div key={idx} className={styles.categoryLine}>
                                    <span className={styles.categoryName}>{cat.name}</span>
                                    <span className={styles.categoryPercent}>{cat.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Таблиця транзакцій під верхнім блоком */}
            <div className={styles.transactionsSection}>
                <div className={styles.tableWrapper}>
                    <table className={styles.transactionTableDark}>
                        <thead>
                        <tr>
                            <th>PROFIT</th>
                            <th>DATE</th>
                            <th>PAYER</th>
                            <th>DIGITAL ART</th>
                            <th>CATEGORY</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayedData.length > 0 ? (
                            displayedData.map((t) => (
                                <tr key={t.id} className={styles.rowDark}>
                                    <td className={styles.profitCell}>{t.amount.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td>{t.date}</td>
                                    <td>Anna Kot</td>
                                    <td>{t.title}</td>
                                    <td>{t.category}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.noData}>No transactions for this period</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredTransactions.length > 0 && (
                    <div className={styles.paginationWrapperDark}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;