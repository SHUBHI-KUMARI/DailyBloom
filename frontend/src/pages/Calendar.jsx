import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { moodAPI } from "../services/api";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineHeart,
} from "react-icons/hi";
import "../styles/Calendar.css";

export default function Calendar() {
  const { currentUser } = useAuth();
  const [calendarData, setCalendarData] = useState({
    journals: [],
    habits: [],
    moods: [],
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await moodAPI.getCalendarData();
        if (response.success && response.data) {
          setCalendarData({
            journals: response.data.journals || [],
            habits: response.data.habits || [],
            moods: response.data.moods || [],
          });
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentUser]);

  // Get days in month array
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];

    // Find the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Add empty days for days of the week before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days in the month
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);

      // Get all events for this day
      const dayFormatted = dayDate.toISOString().split("T")[0];

      // Journal entries for this day
      const journalEntries = calendarData.journals.filter(
        (entry) =>
          new Date(entry.date).toISOString().split("T")[0] === dayFormatted,
      );

      // Habit completions for this day
      const habitCompletions = calendarData.habits.filter(
        (habit) => habit.progress && habit.progress[dayFormatted],
      );

      // Mood entries for this day
      const moodEntries = calendarData.moods.filter(
        (entry) =>
          new Date(entry.date).toISOString().split("T")[0] === dayFormatted,
      );

      days.push({
        day: i,
        date: dayDate,
        journals: journalEntries,
        habits: habitCompletions,
        moods: moodEntries,
        hasEvents:
          journalEntries.length > 0 ||
          habitCompletions.length > 0 ||
          moodEntries.length > 0,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleDayClick = (day) => {
    if (!day) return;

    setSelectedDay(day);
    setDayEvents(
      [
        ...day.journals.map((entry) => ({
          type: "journal",
          data: entry,
          time: new Date(entry.date),
        })),
        ...day.habits.map((habit) => ({
          type: "habit",
          data: habit,
          time: new Date(),
        })),
        ...day.moods.map((entry) => ({
          type: "mood",
          data: entry,
          time: new Date(entry.date),
        })),
      ].sort((a, b) => a.time - b.time),
    );
  };

  const closeEventSidebar = () => {
    setSelectedDay(null);
    setDayEvents([]);
  };

  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="calendar-page">
      <main className="calendar-main">
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="page-header">
              <h1>Calendar View</h1>
              <p className="page-subtitle">Track your journey at a glance</p>
            </div>
            <div className="calendar-navigation">
              <button onClick={handlePrevMonth} className="month-nav-btn">
                <HiOutlineChevronLeft />
              </button>
              <h2 className="current-month">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={handleNextMonth} className="month-nav-btn">
                <HiOutlineChevronRight />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading calendar data...</div>
          ) : (
            <div className="calendar-grid">
              {weekdays.map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}

              {days.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!day ? "empty-day" : ""} ${
                    day && new Date().toDateString() === day.date.toDateString()
                      ? "today"
                      : ""
                  } ${day && selectedDay?.day === day.day ? "selected" : ""}`}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day && (
                    <>
                      <div className="day-number">{day.day}</div>
                      <div className="day-indicators">
                        {day.journals.length > 0 && (
                          <div
                            className="journal-indicator"
                            title="Journal entries"
                          />
                        )}
                        {day.habits.length > 0 && (
                          <div
                            className="habit-indicator"
                            title="Habits completed"
                          />
                        )}
                        {day.moods.length > 0 && (
                          <div className="mood-indicator" title="Mood logged" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedDay && (
            <div className="day-events-sidebar">
              <div className="events-header">
                <h3>
                  {selectedDay.date.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <button
                  onClick={closeEventSidebar}
                  className="close-sidebar-btn"
                >
                  <HiOutlineX />
                </button>
              </div>

              {dayEvents.length === 0 ? (
                <p className="no-events">No events for this day.</p>
              ) : (
                <div className="events-list">
                  {dayEvents.map((event, idx) => (
                    <div key={idx} className={`event-item ${event.type}-event`}>
                      <div className="event-icon">
                        {event.type === "journal" && <HiOutlineBookOpen />}
                        {event.type === "habit" && <HiOutlineClipboardCheck />}
                        {event.type === "mood" && <HiOutlineHeart />}
                      </div>
                      <div className="event-content">
                        <div className="event-time">
                          {event.time.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        {event.type === "journal" && (
                          <div className="event-details">
                            <h4>Journal Entry</h4>
                            <p>{event.data.title}</p>
                          </div>
                        )}

                        {event.type === "habit" && (
                          <div className="event-details">
                            <h4>Habit Completed</h4>
                            <p>{event.data.name}</p>
                          </div>
                        )}

                        {event.type === "mood" && (
                          <div className="event-details">
                            <h4>
                              Mood:{" "}
                              {event.data.mood.charAt(0).toUpperCase() +
                                event.data.mood.slice(1)}
                            </h4>
                            {event.data.note && <p>{event.data.note}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
