// Calendar.tsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  status?: string;
  backgroundColor?: string;
  borderColor?: string;
  user_name?: string;
  booking_id?: number;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateClick }) => {
  const getEventColor = (status?: string): { backgroundColor: string; borderColor: string } => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#28a745', borderColor: '#28a745' };
      case 'Pending':
        return { backgroundColor: '#ffc107', borderColor: '#ffc107' };
      case 'Rejected':
        return { backgroundColor: '#dc3545', borderColor: '#dc3545' };
      case 'Cancelled':
        return { backgroundColor: '#6c757d', borderColor: '#6c757d' };
      default:
        // Legacy support for old events
        return status === 'pending' 
          ? { backgroundColor: '#00bfff', borderColor: '#00bfff' }
          : { backgroundColor: '#28a745', borderColor: '#28a745' };
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events.map(event => ({
        ...event,
        ...(event.backgroundColor && event.borderColor 
          ? { backgroundColor: event.backgroundColor, borderColor: event.borderColor }
          : getEventColor(event.status)
        )
      }))}
      height="500px"
      dateClick={(dateInfo) => {
        if (onDateClick) {
          onDateClick(dateInfo.date);
        }
      }}
      eventContent={(eventInfo) => {
        const event = eventInfo.event;
        const status = event.extendedProps.status;
        const userName = event.extendedProps.user_name;
        
        // Get colors based on status or use provided colors
        const colors = event.backgroundColor && event.borderColor
          ? { backgroundColor: event.backgroundColor, borderColor: event.borderColor }
          : getEventColor(status);

        return (
          <div
            style={{
              backgroundColor: colors.backgroundColor,
              color: status === 'Pending' ? '#000' : '#fff',
              borderRadius: "4px",
              padding: "4px 6px",
              fontSize: "0.75rem",
              fontWeight: '500',
              border: `1px solid ${colors.borderColor}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={`${event.title}${userName ? ` - ${userName}` : ''}`}
          >
            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
              {eventInfo.timeText}
            </div>
            <div>
              {event.title}
            </div>
            {userName && (
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                {userName}
              </div>
            )}
          </div>
        );
      }}
      eventClick={(info) => {
        // Optional: Handle event click for more details
        const event = info.event;
        const userName = event.extendedProps.user_name;
        const status = event.extendedProps.status;
        
        alert(`Booking: ${event.title}\nStatus: ${status}\nUser: ${userName || 'Unknown'}\nTime: ${info.event.start?.toLocaleString()} - ${info.event.end?.toLocaleString()}`);
      }}
      dayMaxEvents={3}
      moreLinkClick="popover"
      eventDisplay="block"
      displayEventTime={true}
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }}
    />
  );
};

export default Calendar;
