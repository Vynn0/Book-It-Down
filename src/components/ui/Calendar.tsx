import React from 'react';
import './Calendar.css'; // Anda bisa membuat file CSS terpisah

const Calendar: React.FC = () => {
  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button className="nav-arrow">{'<'}</button>
        <span className="month-year">شهر يور 1404</span>
        <button className="nav-arrow">{'>'}</button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Sabtu', 'Jumat', 'Kamis', 'Rabu', 'Selasa', 'Senin', 'Ahad'];
    return (
      <div className="days-of-week">
        {days.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const totalCells = 35; // 5 baris * 7 hari
    const cells = [];
    const dates = [
      '', '', '', '', 5, 4, 3, 2, 1, 12, 11, 10, 9, 8, 19, 18, 17, 16, 15, 26, 25, 24, 23, 22, 29, 31, 30
    ];

    for (let i = 0; i < totalCells; i++) {
      const date = dates[i] !== undefined ? dates[i] : '';
      const isHighlighted = (date === 13); // Contoh highlight tanggal 13
      const isSelected = (date === 1); // Contoh tanggal yang terpilih
      
      let cellClass = "calendar-cell";
      if (isHighlighted) cellClass += " highlighted";
      if (isSelected) cellClass += " selected";
      
      cells.push(
        <div key={i} className={cellClass}>
          {date}
        </div>
      );
    }
    return <div className="calendar-body">{cells}</div>;
  };

  return (
    <div className="calendar-container">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default Calendar;