import React, { useState } from "react";
import "./CreateInvitation.css";

export default function CreateInvitation() {

  // Store selected event
  const [selectedEvent, setSelectedEvent] = useState("");

  // Event list
  const eventTypes = [
    "Wedding",
    "Birthday",
    "Engagement",
    "Anniversary",
    "Housewarming",
    "Graduation",
    "Baptism",
    "Corporate",
    "Custom"
  ];

  return (
    <div className="create-page">

      <div className="create-container">

        {/* Heading */}

        <h1>Create Invitation</h1>

        <p className="subtitle">
          Fill in the event details and create your beautiful invitation.
        </p>

        {/* Progress */}

        <div className="progress-container">

          <div className="step active">
            <div className="circle">1</div>
            <span>Event</span>
          </div>

          <div className="line"></div>

          <div className="step">
            <div className="circle">2</div>
            <span>Details</span>
          </div>

          <div className="line"></div>

          <div className="step">
            <div className="circle">3</div>
            <span>Design</span>
          </div>

          <div className="line"></div>

          <div className="step">
            <div className="circle">4</div>
            <span>Review</span>
          </div>

        </div>

        {/* Card */}

        <div className="content-card">

          <h2>Step 1</h2>

          <h3>Choose Event Type</h3>

          <p>
            Select the type of invitation you want to create.
          </p>

          {/* Event Cards */}

          <div className="event-grid">

            {eventTypes.map((event) => (

              <div
                key={event}
                className={`event-card ${
                  selectedEvent === event ? "selected" : ""
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                {event}
              </div>

            ))}

          </div>

          {/* Buttons */}

          <div className="button-group">

            <button className="back-btn">
              Back
            </button>

            <button
              className="next-btn"
              disabled={!selectedEvent}
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}