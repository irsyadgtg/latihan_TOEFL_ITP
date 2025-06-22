import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  const handleDateChangeAndClose = (date: Date | null) => {
    onSelectDate(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-6">Tanggal</h2>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChangeAndClose}
          inline
          calendarClassName="w-full border-none"
          dayClassName={() => "w-10 h-10 leading-10 rounded-full text-center text-base hover:bg-red-100"}
          monthClassName={() => "w-full"}
          renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
            <div className="flex items-center justify-between px-2 py-2">
                <button onClick={decreaseMonth} className="p-2 rounded-full hover:bg-gray-100">
                    &lt;
                </button>
                <span className="text-lg font-semibold">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={increaseMonth} className="p-2 rounded-full hover:bg-gray-100">
                    &gt;
                </button>
            </div>
          )}
        />
        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#EDC968] hover:bg-yellow-500 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

export default DatePickerModal;
