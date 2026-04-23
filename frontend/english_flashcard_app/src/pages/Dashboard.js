import { memo, useMemo } from "react";

const formatMinutes = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

const BarChart = memo(({ data, height = 160 }) => {
  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const chartHeight = height;
  const chartWidth = 520;
  const padding = { top: 8, right: 8, bottom: 26, left: 8 };
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const innerWidth = chartWidth - padding.left - padding.right;
  const barGap = 10;
  const barWidth = Math.max(18, (innerWidth - barGap * (data.length - 1)) / data.length);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      width="100%"
      height={chartHeight}
      role="img"
      aria-label="Study minutes over the last 7 days"
    >
      <title>Study minutes (last 7 days)</title>
      {data.map((d, index) => {
        const barHeight = Math.round((d.value / maxValue) * innerHeight);
        const x = padding.left + index * (barWidth + barGap);
        const y = padding.top + (innerHeight - barHeight);

        return (
          <g key={d.key}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill={d.isToday ? "var(--bs-primary)" : "var(--bs-primary-bg-subtle)"}
              stroke="var(--bs-primary)"
              strokeWidth={d.isToday ? 0 : 1}
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="12"
              fill="var(--bs-secondary-color)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
});

const DonutChart = memo(({ segments, size = 160, strokeWidth = 18 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, segments.reduce((sum, s) => sum + s.value, 0));

  let accumulated = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Vocabulary status breakdown"
    >
      <title>Vocabulary status breakdown</title>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bs-secondary-bg-subtle)"
          strokeWidth={strokeWidth}
        />
        {segments.map((segment) => {
          const length = (segment.value / total) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const dashoffset = -accumulated;
          accumulated += length;

          return (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
            />
          );
        })}
      </g>
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="var(--bs-body-color)"
      >
        {total}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 18}
        textAnchor="middle"
        fontSize="12"
        fill="var(--bs-secondary-color)"
      >
        words
      </text>
    </svg>
  );
});

const StatCard = memo(({ title, value, subtext, icon }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex align-items-start justify-content-between">
        <div>
          <div className="text-secondary small">{title}</div>
          <div className="fs-4 fw-semibold">{value}</div>
          {subtext ? <div className="small text-secondary">{subtext}</div> : null}
        </div>
        <div className="fs-3 text-primary">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
});

const Dashboard = memo(() => {
  const mock = useMemo(() => {
    const weeklyStudy = [
      { key: "mon", label: "Mon", value: 25 },
      { key: "tue", label: "Tue", value: 40 },
      { key: "wed", label: "Wed", value: 15 },
      { key: "thu", label: "Thu", value: 55 },
      { key: "fri", label: "Fri", value: 35 },
      { key: "sat", label: "Sat", value: 60 },
      { key: "sun", label: "Sun", value: 30, isToday: true },
    ];

    const weeklyTotal = weeklyStudy.reduce((sum, d) => sum + d.value, 0);

    const vocabSegments = [
      { key: "known", label: "Known", value: 320, color: "var(--bs-success)" },
      { key: "learning", label: "Learning", value: 180, color: "var(--bs-warning)" },
      { key: "new", label: "New", value: 95, color: "var(--bs-primary)" },
    ];

    return {
      streakDays: 9,
      accuracyPercent: 86,
      weeklyTotal,
      newWordsThisWeek: 42,
      weeklyStudy,
      vocabSegments,
      goals: [
        { key: "minutes", label: "Study time", current: weeklyTotal, target: 300, unit: "min" },
        { key: "words", label: "New words", current: 42, target: 60, unit: "words" },
        { key: "reviews", label: "Reviews", current: 38, target: 50, unit: "cards" },
      ],
      recent: [
        { key: "1", title: "Topic: Travel", detail: "Reviewed 18 cards", when: "Today" },
        { key: "2", title: "Topic: Food", detail: "Added 6 new words", when: "Yesterday" },
        { key: "3", title: "Quick session", detail: "10 minutes listening practice", when: "2 days ago" },
      ],
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div>
          <h2 className="text-start mb-0">Learning Progress</h2>
          <div className="text-secondary">Mock dashboard (not connected to backend yet)</div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" type="button" disabled>
            Last 7 days
          </button>
          <button className="btn btn-primary btn-sm" type="button" disabled>
            Export
          </button>
        </div>
      </div>

      <hr className="mt-3" />

      <div className="row g-3">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Streak"
            value={`${mock.streakDays} days`}
            subtext="Keep it going"
            icon="bi-fire"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Accuracy"
            value={`${mock.accuracyPercent}%`}
            subtext="Last 30 reviews"
            icon="bi-bullseye"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Study time"
            value={formatMinutes(mock.weeklyTotal)}
            subtext="This week"
            icon="bi-clock-history"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="New words"
            value={mock.newWordsThisWeek}
            subtext="This week"
            icon="bi-plus-circle"
          />
        </div>

        <div className="col-12 col-xl-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="fw-semibold">Study minutes</div>
                  <div className="small text-secondary">Last 7 days</div>
                </div>
                <div className="small text-secondary">Total: {formatMinutes(mock.weeklyTotal)}</div>
              </div>
              <BarChart data={mock.weeklyStudy} />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="fw-semibold">Vocabulary status</div>
              <div className="small text-secondary mb-3">Known vs learning vs new</div>
              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                <DonutChart segments={mock.vocabSegments} />
                <div className="d-flex flex-column gap-2">
                  {mock.vocabSegments.map((s) => (
                    <div key={s.key} className="d-flex align-items-center gap-2">
                      <span
                        className="rounded"
                        style={{ width: 12, height: 12, backgroundColor: s.color, display: "inline-block" }}
                      ></span>
                      <div>
                        <div className="small fw-semibold">{s.label}</div>
                        <div className="small text-secondary">{s.value} words</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="fw-semibold">Weekly goals</div>
              <div className="small text-secondary mb-3">Mock targets for motivation</div>
              <div className="d-flex flex-column gap-3">
                {mock.goals.map((g) => {
                  const percent = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100));
                  return (
                    <div key={g.key}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="fw-semibold">{g.label}</div>
                        <div className="small text-secondary">
                          {g.current}/{g.target} {g.unit}
                        </div>
                      </div>
                      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="fw-semibold">Recent activity</div>
              <div className="small text-secondary mb-3">Last sessions (mock)</div>
              <div className="list-group">
                {mock.recent.map((r) => (
                  <div key={r.key} className="list-group-item d-flex align-items-start justify-content-between">
                    <div>
                      <div className="fw-semibold">{r.title}</div>
                      <div className="small text-secondary">{r.detail}</div>
                    </div>
                    <span className="badge text-bg-light border">{r.when}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
