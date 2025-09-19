// Calendar.tsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateTimeUtils } from "../../utils/dateUtils";

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
      case 'Completed':
        return { backgroundColor: '#17a2b8', borderColor: '#17a2b8' };
      case 'Expired':
        return { backgroundColor: '#fd7e14', borderColor: '#fd7e14' };
      default:
        // Legacy support for old events
        return status === 'pending' 
          ? { backgroundColor: '#00bfff', borderColor: '#00bfff' }
          : { backgroundColor: '#28a745', borderColor: '#28a745' };
    }
  };

  // Handle date click with past date validation
  const handleDateClick = (dateInfo: any) => {
    const clickedDate = dateInfo.date;
    
    // Check if the clicked date is in the past
    if (DateTimeUtils.isPastDate(clickedDate)) {
      // Show a informative message for past dates
      alert('This date is in the past.\n\nYou can view past bookings but cannot create new bookings for past dates.\n\nPlease select today or a future date to make a new booking.');
      return;
    }
    
    // Only call the onDateClick callback if date is valid
    if (onDateClick) {
      onDateClick(clickedDate);
    }
  };

  return (
    <div>
      <style>
        {`
          .past-date-disabled {
            background-color: #f8f9fa !important;
            color: #6c757d !important;
            cursor: not-allowed !important;
            opacity: 0.7 !important;
          }
          .past-date-disabled:hover {
            background-color: #f8f9fa !important;
            cursor: not-allowed !important;
          }
          .fc-day-past {
            background-color: #f8f9fa !important;
            color: #6c757d !important;
            cursor: not-allowed !important;
            opacity: 0.7 !important;
          }
          /* Make past events slightly transparent but still visible */
          .past-event {
            opacity: 0.8 !important;
            border-style: dashed !important;
          }
          /* Add a subtle indicator for past dates */
          .past-date-disabled::after {
            content: "";
            font-size: 0.7em;
            color: #adb5bd;
          }
        `}
      </style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        events={events.map(event => ({
          ...event,
          ...(event.backgroundColor && event.borderColor 
            ? { backgroundColor: event.backgroundColor, borderColor: event.borderColor }
            : getEventColor(event.status)
          )
        }))}
        height="500px"
        dateClick={handleDateClick}
        // Remove validRange to allow viewing past dates, but prevent booking through handleDateClick
        eventContent={(eventInfo) => {
          const event = eventInfo.event;
          const status = event.extendedProps.status;
          const userName = event.extendedProps.user_name;
          const eventDate = event.start;
          
          // Check if this event is in the past
          const isPastEvent = eventDate ? DateTimeUtils.isPastDate(eventDate) : false;
          
          // Get colors based on status or use provided colors
          const colors = event.backgroundColor && event.borderColor
            ? { backgroundColor: event.backgroundColor, borderColor: event.borderColor }
            : getEventColor(status);

          return (
            <div
              className={isPastEvent ? 'past-event' : ''}
              style={{
                backgroundColor: colors.backgroundColor,
                color: status === 'Pending' ? '#000' : '#fff',
                borderRadius: "4px",
                padding: "4px 6px",
                fontSize: "0.75rem",
                fontWeight: '500',
                border: isPastEvent 
                  ? `2px dashed ${colors.borderColor}` 
                  : `1px solid ${colors.borderColor}`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: isPastEvent ? 0.8 : 1
              }}
              title={`${event.title}${userName ? ` - ${userName}` : ''}${isPastEvent ? ' (Past Event)' : ''}`}
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
          // Handle event click for viewing details
          const event = info.event;
          const userName = event.extendedProps.user_name;
          const status = event.extendedProps.status;
          const eventDate = event.start;
          const isPastEvent = eventDate ? DateTimeUtils.isPastDate(eventDate) : false;
          
          const timeInfo = `${info.event.start?.toLocaleString()} - ${info.event.end?.toLocaleString()}`;
          const pastIndicator = isPastEvent ? '\n(This is a past booking)' : '';
          
          alert(`Booking Details:\n\nRoom: ${event.title}\nStatus: ${status}\nUser: ${userName || 'Unknown'}\nTime: ${timeInfo}${pastIndicator}`);
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
        dayCellClassNames={(dateInfo) => {
          // Add custom CSS class for past dates to gray them out
          if (DateTimeUtils.isPastDate(dateInfo.date)) {
            return ['past-date-disabled'];
          }
          return [];
        }}
      />
    </div>
  );
};

export default Calendar;
