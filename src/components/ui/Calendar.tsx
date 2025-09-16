// Calendar.tsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarProps {
  events: { title: string; start: string; end: string; status?: string }[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      height="100%"
      eventContent={(eventInfo) => {
        // custom render: hijau = dipesan, biru = menunggu
        const bgColor =
          eventInfo.event.extendedProps.status === "pending"
            ? "#00bfff"
            : "#28a745";
        return (
          <div
            style={{
              backgroundColor: bgColor,
              color: "white",
              borderRadius: "4px",
              padding: "2px 4px",
              fontSize: "0.75rem",
            }}
          >
            {eventInfo.timeText} {eventInfo.event.title}
          </div>
        );
      }}
    />
  );
};

export default Calendar;
