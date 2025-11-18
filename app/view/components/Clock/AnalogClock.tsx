"use client";

type AnalogClockProps = {
  time: Date;
  timezone: string;
  size: number;
  color: string;
  showSeconds?: boolean;
};

export function AnalogClock({ time, timezone, size, color, showSeconds = true }: AnalogClockProps) {
  // Get time in the specified timezone
  const timeInTimezone = new Date(
    time.toLocaleString("en-US", { timeZone: timezone })
  );

  const hours = timeInTimezone.getHours() % 12;
  const minutes = timeInTimezone.getMinutes();
  const seconds = timeInTimezone.getSeconds();

  // Calculate angles (0 degrees = 12 o'clock, clockwise)
  const secondAngle = (seconds * 6 - 90) * (Math.PI / 180);
  const minuteAngle = (minutes * 6 + seconds * 0.1 - 90) * (Math.PI / 180);
  const hourAngle = (hours * 30 + minutes * 0.5 - 90) * (Math.PI / 180);

  const center = size / 2;
  const radius = size * 0.4;
  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.75;
  const secondHandLength = radius * 0.85;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Clock face circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = ((i * 30 - 90) * Math.PI) / 180;
        const markerLength = i % 3 === 0 ? radius * 0.15 : radius * 0.08;
        const x1 = center + (radius - markerLength) * Math.cos(angle);
        const y1 = center + (radius - markerLength) * Math.sin(angle);
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={i % 3 === 0 ? "2" : "1"}
            opacity="0.6"
          />
        );
      })}

      {/* Hour hand */}
      <line
        x1={center}
        y1={center}
        x2={center + hourHandLength * Math.cos(hourAngle)}
        y2={center + hourHandLength * Math.sin(hourAngle)}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={center}
        y1={center}
        x2={center + minuteHandLength * Math.cos(minuteAngle)}
        y2={center + minuteHandLength * Math.sin(minuteAngle)}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Second hand */}
      {showSeconds && (
        <line
          x1={center}
          y1={center}
          x2={center + secondHandLength * Math.cos(secondAngle)}
          y2={center + secondHandLength * Math.sin(secondAngle)}
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}

      {/* Center dot */}
      <circle cx={center} cy={center} r="3" fill={color} />
    </svg>
  );
}

