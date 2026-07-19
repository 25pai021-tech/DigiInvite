import './Stats.css';

const STATS = [
  { num: '0+',  label: 'Ready Templates' },
  { num: '0+',  label: 'Cards Generated' },
  { num: '20+', label: 'Event Types' },
  { num: '0★',  label: 'Average Rating' },
];

export default function Stats() {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {STATS.map(({ num, label }) => (
          <div className="stat-item" key={label}>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
