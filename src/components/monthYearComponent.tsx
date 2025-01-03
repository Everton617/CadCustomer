import { useState, Dispatch, SetStateAction } from 'react';

function MonthYearPicker({ onSelect }: { onSelect: Dispatch<SetStateAction<Date | undefined>> }) {
  const [month, setMonth] = useState<number>();
  const [year, setYear] = useState<number>();

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i); // 10 anos a partir do atual


  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = parseInt(event.target.value, 10);
    setMonth(selectedMonth);
    if (year) {
      onSelect(new Date(year, selectedMonth - 1));
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value, 10);
    setYear(selectedYear);
    if (month) {
      onSelect(new Date(selectedYear, month - 1));
    }
  };


  return (
    <div>
      <select value={month} onChange={handleMonthChange}>
        <option value="">Mês</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
      <select value={year} onChange={handleYearChange}>
        <option value="">Ano</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
} export default MonthYearPicker;