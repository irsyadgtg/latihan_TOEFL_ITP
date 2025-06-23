import '../../index.css';
import { useState } from 'react';
import DatePicker from 'react-datepicker';


const TanggalPopup = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2025-04-18')); // Initialize with the default date

  return (
    <div className="flex items-center gap-4">
      <label className="text-[18px] w-24">Tanggal</label>
      <div className="relative w-full"> {/* Added relative for potential positioning of the calendar */}
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy" // Format to match your "18/04/2025"
          className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
          // To customize the calendar pop-up, you'll often use `calendarClassName` or provide custom components for header/day
          // This is where you'd apply the custom styles for the calendar part
          calendarClassName="custom-datepicker-calendar" // Apply custom class to the calendar container
          // You might need to adjust pop-up positioning or portal for better control over display
          // For the exact look, you'd likely need to customize the render for the header and days.
          // This example focuses on the basic integration and input styling.
          // You can also use `popperPlacement` to control where the calendar pops up.
          popperPlacement="bottom-start" // Example placement
        />
      </div>
    </div>
  );
};

export default TanggalPopup;

