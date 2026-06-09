import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Activity, Users, Eye, Download, Heart, Bookmark, BarChart3, Layers, Shield } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import AdSlot from '../components/AdSlot';

/* ─── Count-up animation hook ─── */
const useCountUp = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
};

/* ─── Inline style objects (Obsidian Editorial) ─── */
const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--oe-bg-base)',
    color: 'var(--oe-text-primary)',
    fontFamily: 'var(--font-sans)',
  },
  mainContent: {
    maxWidth: 1400,
    paddingTop: 48,
    paddingBottom: 80,
  },
  card: {
    background: 'var(--oe-bg-surface)',
    border: '1px solid var(--oe-border-subtle)',
    borderRadius: 16,
    padding: '24px 28px',
  },
  cardLarge: {
    background: 'var(--oe-bg-surface)',
    border: '1px solid var(--oe-border-subtle)',
    borderRadius: 16,
    padding: '28px 32px',
  },
  overline: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--oe-text-tertiary)',
    marginBottom: 10,
  },
  h1: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 48,
    lineHeight: 1.1,
    color: 'var(--oe-text-primary)',
    marginBottom: 8,
    fontWeight: 400,
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--oe-text-secondary)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--oe-text-primary)',
  },
  sectionSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--oe-text-secondary)',
    marginTop: 4,
  },
  metricNumber: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 44,
    lineHeight: 1,
    color: 'var(--oe-text-primary)',
    fontWeight: 400,
  },
  monoLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--oe-text-tertiary)',
  },
  liveBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--oe-accent-emerald)',
    background: 'var(--oe-accent-emerald-muted)',
    border: '1px solid rgba(52, 211, 153, 0.20)',
    borderRadius: 6,
    padding: '6px 14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  kpiBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--oe-accent-emerald)',
    background: 'var(--oe-accent-emerald-muted)',
    border: '1px solid rgba(52,211,153,0.15)',
    borderRadius: 6,
    padding: '3px 8px',
  },
  divider: {
    width: '100%',
    height: 1,
    background: 'var(--oe-border-subtle)',
    marginTop: 32,
    border: 'none',
  },
  skeleton: {
    borderRadius: 16,
    height: 140,
    background: 'linear-gradient(90deg, var(--oe-bg-elevated) 0%, var(--oe-bg-hover) 50%, var(--oe-bg-elevated) 100%)',
    backgroundSize: '200% 100%',
    animation: 'oe-skeletonShimmer 1.5s ease-in-out infinite',
    border: '1px solid var(--oe-border-subtle)',
  },
};

/* ─── KPI definitions ─── */
const kpiConfig = [
  { key: 'views',     label: 'IMPRESSIONS', Icon: Eye,      accent: 'var(--oe-accent-blue)',    accentMuted: 'var(--oe-accent-blue-muted)' },
  { key: 'downloads', label: 'COPIES',      Icon: Download,  accent: 'var(--oe-accent-violet)',  accentMuted: 'var(--oe-accent-violet-muted)' },
  { key: 'likes',     label: 'LIKES',       Icon: Heart,     accent: 'var(--oe-accent-rose)',    accentMuted: 'var(--oe-accent-rose-muted)' },
  { key: 'saves',     label: 'SAVES',       Icon: Bookmark,  accent: 'var(--oe-accent-amber)',   accentMuted: 'var(--oe-accent-amber-muted)' },
  { key: 'followers', label: 'FOLLOWERS',   Icon: Users,     accent: 'var(--oe-accent-emerald)', accentMuted: 'var(--oe-accent-emerald-muted)' },
  { key: 'uploads',   label: 'PUBLISHED',   Icon: Layers,    accent: 'var(--oe-text-secondary)', accentMuted: 'rgba(255,255,255,0.05)' },
];

/* ─── Engagement breakdown definitions ─── */
const engagementConfig = [
  { key: 'views',     label: 'Impressions', Icon: Eye,      accent: 'var(--oe-accent-blue)' },
  { key: 'likes',     label: 'Likes',       Icon: Heart,    accent: 'var(--oe-accent-rose)' },
  { key: 'saves',     label: 'Saves',       Icon: Bookmark, accent: 'var(--oe-accent-amber)' },
  { key: 'downloads', label: 'Copies',      Icon: Download, accent: 'var(--oe-accent-violet)' },
];

/* ─── Rank badge styles ─── */
const rankStyles = [
  { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.20)', color: '#fbbf24' },
  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', color: '#c0c0c0' },
  { bg: 'rgba(180,100,50,0.10)', border: 'rgba(180,100,50,0.20)', color: '#cd7f32' },
];

const Analytics = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  const [stats, setStats] = useState({
    views: 0,
    downloads: 0,
    likes: 0,
    saves: 0,
    followers: 0,
    uploads: 0
  });

  const [chartData, setChartData] = useState([]);
  const [topStyles, setTopStyles] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const stylesQ = query(
          collection(db, 'styles'),
          where('authorId', '==', currentUser.uid)
        );

        const snap = await getDocs(stylesQ);
        const styles = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        let views = 0;
        let downloads = 0;
        let likes = 0;
        let saves = 0;

        const timeData = {};

        styles.forEach(style => {
          views += (style.viewsCount || 0);
          downloads += (style.downloadsCount || 0);
          likes += (style.likesCount || 0);
          saves += (style.savedBy?.length || 0);

          if (style.publishedAt) {
            const date = style.publishedAt.toDate();
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!timeData[sortKey]) {
              timeData[sortKey] = { label: monthYear, uploads: 0, likes: 0, views: 0 };
            }
            timeData[sortKey].uploads += 1;
            timeData[sortKey].likes += (style.likesCount || 0);
            timeData[sortKey].views += (style.viewsCount || 0);
          }
        });

        const sortedKeys = Object.keys(timeData).sort();
        const finalChart = sortedKeys.slice(-8).map(key => timeData[key]);

        // Calculate Top Performing Styles
        const sortedStyles = [...styles].sort((a, b) => {
          const scoreA = (a.viewsCount || 0) + (a.likesCount || 0) * 2 + (a.downloadsCount || 0) * 3;
          const scoreB = (b.viewsCount || 0) + (b.likesCount || 0) * 2 + (b.downloadsCount || 0) * 3;
          return scoreB - scoreA;
        });

        setStats({
          views,
          downloads,
          likes,
          saves,
          followers: userData?.followers?.length || userData?.followersCount || 0,
          uploads: styles.length
        });

        setChartData(finalChart);
        setTopStyles(sortedStyles.slice(0, 4));

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser, userData, navigate]);

  if (!currentUser) return null;

  const maxViews = Math.max(...chartData.map(c => c.views), 1);
  const maxEngagementValue = Math.max(stats.views, stats.likes, stats.downloads, stats.saves, 1);

  /* Count-up values */
  const animatedStats = {
    views: useCountUp(stats.views),
    downloads: useCountUp(stats.downloads),
    likes: useCountUp(stats.likes),
    saves: useCountUp(stats.saves),
    followers: useCountUp(stats.followers),
    uploads: useCountUp(stats.uploads),
  };

  return (
    <div style={s.page}>
      <div className="flex flex-col xl:flex-row" style={{ minHeight: '100vh' }}>
        <DashboardSidebar />

        {/* Main content */}
        <div className="flex-grow flex flex-col gap-8 px-6 xl:px-10 min-w-0" style={s.mainContent}>

          {/* ═══ SECTION 6: PAGE HEADER ═══ */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p style={s.overline}>ANALYTICS</p>
              <h1 style={s.h1}>Performance Overview</h1>
              <p style={s.subtitle}>Lifetime metrics across all published components.</p>
            </div>
            <div>
              <span style={s.liveBadge}>
                <span style={{ animation: 'oe-pulseDot 2s ease-in-out infinite' }}>●</span> Live
              </span>
            </div>
          </header>
          <hr style={s.divider} />

          <AdSlot format="horizontal" className="!mt-0" />

          {/* ═══ SECTION 7/8: KPI METRIC STRIP or SKELETON ═══ */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={s.skeleton} />
              ))}
            </div>
          ) : (
            <>
              {/* ─── KPI Cards ─── */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiConfig.map((kpi, index) => {
                  const val = animatedStats[kpi.key];
                  return (
                    <div
                      key={kpi.key}
                      style={{
                        ...s.card,
                        cursor: 'default',
                        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                        animation: `oe-slideUp 300ms ${index * 60}ms both ease-out`,
                      }}
                      className="oe-kpi-card"
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--oe-border-default)';
                        e.currentTarget.style.background = 'var(--oe-bg-elevated)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.background = 'var(--oe-bg-surface)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Row 1: icon + badge */}
                      <div className="flex items-start justify-between">
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'var(--oe-bg-elevated)',
                          border: '1px solid var(--oe-border-default)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <kpi.Icon size={18} style={{ color: kpi.accent }} />
                        </div>
                        <span style={s.kpiBadge}>Live</span>
                      </div>

                      {/* Row 2: number */}
                      <div style={{ ...s.metricNumber, marginTop: 20 }}>
                        {val.toLocaleString()}
                      </div>

                      {/* Row 3: label */}
                      <div style={{ ...s.monoLabel, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: kpi.accent, display: 'inline-block', flexShrink: 0,
                        }} />
                        {kpi.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ═══ SECTION 9 + 10: Chart + Top Assets (2-col) ═══ */}
              <div className="flex flex-col xl:flex-row gap-4" style={{ marginTop: 8 }}>

                {/* ─── Growth Velocity Chart ─── */}
                <div style={{ ...s.cardLarge, flex: 1.4 }}>
                  {/* Header */}
                  <div className="flex items-start justify-between" style={{ marginBottom: 32 }}>
                    <div>
                      <div style={s.sectionTitle}>Growth Velocity</div>
                      <div style={s.sectionSubtitle}>Views mapped to publication timeline</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--oe-accent-blue)', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--oe-text-tertiary)' }}>Views</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--oe-accent-violet)', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--oe-text-tertiary)' }}>Uploads</span>
                      </span>
                    </div>
                  </div>

                  {/* Chart area */}
                  <div style={{ height: 260, position: 'relative' }}>
                    {chartData.length > 0 ? (
                      <>
                        {/* Grid lines */}
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} style={{
                            position: 'absolute', left: 44, right: 0,
                            bottom: `${(i + 1) * 25}%`,
                            borderTop: '1px dashed rgba(255,255,255,0.04)',
                          }} />
                        ))}

                        {/* Y-axis labels */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 28, width: 36 }}>
                          {[4, 3, 2, 1].map(mult => (
                            <div key={mult} style={{
                              position: 'absolute',
                              bottom: `${mult * 25}%`,
                              right: 0,
                              transform: 'translateY(50%)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              color: 'var(--oe-text-tertiary)',
                              textAlign: 'right',
                            }}>
                              {Math.round((maxViews / 4) * mult)}
                            </div>
                          ))}
                        </div>

                        {/* Bottom axis line */}
                        <div style={{
                          position: 'absolute', left: 44, right: 0, bottom: 28,
                          borderTop: '1px solid var(--oe-border-default)',
                        }} />

                        {/* Bar group */}
                        <div style={{
                          position: 'absolute', left: 44, right: 0, bottom: 28, top: 0,
                          display: 'flex', alignItems: 'flex-end', gap: 8,
                        }}>
                          {chartData.map((d, i) => {
                            const heightPct = Math.max((d.views / maxViews) * 100, 5);
                            return (
                              <div key={i} className="flex flex-col items-center flex-1" style={{ position: 'relative', height: '100%', justifyContent: 'flex-end', display: 'flex' }}>
                                {/* Tooltip */}
                                {hoveredBar === i && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: `calc(${heightPct}% + 12px)`,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--oe-bg-elevated)',
                                    border: '1px solid var(--oe-border-default)',
                                    borderRadius: 10,
                                    padding: '12px 16px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(12px)',
                                    zIndex: 20,
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    opacity: 1,
                                    transition: 'opacity 150ms ease',
                                  }}>
                                    <div style={{
                                      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                                      color: 'var(--oe-text-primary)',
                                      borderBottom: '1px solid var(--oe-border-subtle)',
                                      paddingBottom: 8, marginBottom: 8,
                                    }}>{d.label}</div>
                                    {[
                                      { label: 'VIEWS', value: d.views, Icon: Eye, color: 'var(--oe-accent-blue)' },
                                      { label: 'LIKES', value: d.likes, Icon: Heart, color: 'var(--oe-accent-rose)' },
                                      { label: 'UPLOADS', value: d.uploads, Icon: Activity, color: 'var(--oe-accent-violet)' },
                                    ].map(row => (
                                      <div key={row.label} className="flex items-center justify-between" style={{ gap: 24, marginBottom: 4 }}>
                                        <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--oe-text-tertiary)' }}>
                                          <row.Icon size={12} style={{ color: row.color }} />
                                          {row.label}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--oe-text-primary)' }}>
                                          {row.value.toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Bar */}
                                <div
                                  style={{
                                    width: '100%',
                                    maxWidth: 48,
                                    height: `${heightPct}%`,
                                    background: 'linear-gradient(to top, #3060cc, var(--oe-accent-blue))',
                                    borderRadius: '6px 6px 0 0',
                                    cursor: 'pointer',
                                    transition: 'filter 150ms ease, transform 150ms ease',
                                    transformOrigin: 'bottom',
                                    animation: `oe-growBar 500ms ${i * 60}ms both cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    filter: hoveredBar === i ? 'brightness(1.3)' : 'brightness(1)',
                                  }}
                                  onMouseEnter={() => setHoveredBar(i)}
                                  onMouseLeave={() => setHoveredBar(null)}
                                />

                                {/* X label */}
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontSize: 10,
                                  color: 'var(--oe-text-tertiary)',
                                  marginTop: 10, whiteSpace: 'nowrap',
                                }}>{d.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center" style={{ height: '100%', textAlign: 'center' }}>
                        <BarChart3 size={40} style={{ color: 'var(--oe-text-tertiary)' }} />
                        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, color: 'var(--oe-text-secondary)', marginTop: 16 }}>
                          No data yet
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--oe-text-tertiary)', marginTop: 4 }}>
                          Publish your first component to begin tracking.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Top Assets Panel ─── */}
                <div style={{ ...s.cardLarge, flex: 1 }}>
                  {/* Header */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={s.sectionTitle}>Top Assets</div>
                    <div style={s.sectionSubtitle}>Ranked by engagement score</div>
                  </div>

                  {/* Asset rows */}
                  {topStyles.length > 0 ? (
                    <div className="flex flex-col">
                      {topStyles.map((style, i) => {
                        const styleMax = Math.max(style.viewsCount || 0, style.likesCount || 0, 1);
                        const score = (style.viewsCount || 0) + (style.likesCount || 0) * 2;
                        const rank = rankStyles[i] || {
                          bg: 'var(--oe-bg-elevated)',
                          border: 'var(--oe-border-subtle)',
                          color: 'var(--oe-text-tertiary)',
                        };

                        return (
                          <div key={i}>
                            <div
                              className="flex items-center gap-4"
                              style={{
                                padding: '14px 16px',
                                borderRadius: 10,
                                cursor: 'default',
                                transition: 'background 150ms ease',
                                animation: `oe-slideUp 300ms ${i * 80}ms both ease-out`,
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--oe-bg-elevated)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {/* Rank badge */}
                              <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: rank.bg,
                                border: `1px solid ${rank.border}`,
                                color: rank.color,
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700, fontSize: 13,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                #{i + 1}
                              </div>

                              {/* Center */}
                              <div className="flex-grow min-w-0">
                                <div
                                  className="oe-asset-title"
                                  style={{
                                    fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
                                    color: 'var(--oe-text-primary)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    transition: 'color 150ms ease',
                                  }}
                                >{style.title}</div>
                                {/* Mini bar */}
                                <div style={{
                                  marginTop: 8, height: 3,
                                  background: 'var(--oe-bg-hover)',
                                  borderRadius: 2, overflow: 'hidden',
                                  display: 'flex',
                                }}>
                                  <div style={{
                                    width: `${((style.viewsCount || 0) / styleMax) * 100}%`,
                                    height: '100%',
                                    background: 'var(--oe-accent-blue)',
                                  }} />
                                  <div style={{
                                    width: `${((style.likesCount || 0) / styleMax) * 100}%`,
                                    height: '100%',
                                    background: 'var(--oe-accent-rose)',
                                  }} />
                                </div>
                              </div>

                              {/* Score */}
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{
                                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                                  fontSize: 20, color: 'var(--oe-text-primary)',
                                }}>{score.toLocaleString()}</div>
                                <div style={{
                                  fontFamily: 'var(--font-mono)', fontSize: 9,
                                  textTransform: 'uppercase', letterSpacing: '0.1em',
                                  color: 'var(--oe-text-tertiary)', marginTop: 2,
                                }}>SCORE</div>
                              </div>
                            </div>
                            {/* Divider (except last) */}
                            {i < topStyles.length - 1 && (
                              <div style={{ height: 1, background: 'var(--oe-border-subtle)', margin: '0 16px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--oe-border-subtle)',
                      borderRadius: 12,
                      padding: 40,
                      textAlign: 'center',
                    }}>
                      <Layers size={36} style={{ color: 'var(--oe-text-tertiary)', margin: '0 auto' }} />
                      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--oe-text-secondary)', marginTop: 12 }}>
                        No assets published yet
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--oe-text-tertiary)', marginTop: 4 }}>
                        Upload your first component to see rankings.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ SECTION 11: ENGAGEMENT BREAKDOWN ═══ */}
              <div style={s.cardLarge}>
                {/* Header */}
                <div className="flex items-start justify-between" style={{ marginBottom: 32 }}>
                  <div>
                    <div style={s.sectionTitle}>Engagement Breakdown</div>
                    <div style={s.sectionSubtitle}>Relative distribution of interactions across all assets</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--oe-text-tertiary)' }}>All time</span>
                </div>

                {/* Metric rows */}
                <div className="flex flex-col" style={{ gap: 28 }}>
                  {engagementConfig.map((item, i) => {
                    const val = stats[item.key];
                    const pct = Math.max(Math.round((val / maxEngagementValue) * 100), 0);
                    const barWidth = Math.max((val / maxEngagementValue) * 100, 2);

                    return (
                      <div key={item.key} style={{ animation: `oe-slideUp 300ms ${i * 100}ms both ease-out` }}>
                        {/* Row header */}
                        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                          <span className="flex items-center" style={{ gap: 10 }}>
                            <item.Icon size={16} style={{ color: item.accent }} />
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--oe-text-secondary)' }}>
                              {item.label}
                            </span>
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                            fontSize: 22, color: 'var(--oe-text-primary)',
                          }}>
                            {val.toLocaleString()}
                          </span>
                        </div>

                        {/* Bar track */}
                        <div style={{
                          height: 6, width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: 3, overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 3,
                            width: `${barWidth}%`,
                            background: item.accent,
                            transition: 'width 800ms ease-out',
                            animation: `oe-engagementBarGrow 800ms ${i * 100}ms both ease-out`,
                          }} />
                        </div>

                        {/* Percentage */}
                        <div style={{
                          textAlign: 'right', marginTop: 4,
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'var(--oe-text-tertiary)',
                        }}>
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ SECTION 12: UPGRADE CTA STRIP ═══ */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{
                background: 'linear-gradient(135deg, rgba(79,142,255,0.05) 0%, rgba(167,139,250,0.05) 100%)',
                borderTop: '1px solid var(--oe-border-subtle)',
                borderBottom: '1px solid var(--oe-border-subtle)',
                padding: '24px 32px',
              }}>
                <div className="flex flex-col" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <Shield size={18} style={{ color: 'var(--oe-accent-blue)' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--oe-text-primary)' }}>
                      Pro Analytics
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: 'var(--oe-text-secondary)' }}>
                    Unlock viewer demographics, daily breakdowns, and CSV report exports.
                  </span>
                </div>
                <button
                  style={{
                    background: 'var(--oe-accent-blue)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600, fontSize: 14,
                    padding: '10px 22px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6fa3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--oe-accent-blue)'}
                >
                  Upgrade to Pro →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scoped styles for hover effects that can't be done inline */}
      <style>{`
        .oe-kpi-card { will-change: transform; }
        .oe-asset-title { will-change: color; }
        div:hover > .oe-asset-title { color: var(--oe-accent-blue) !important; }

        @media (max-width: 768px) {
          .oe-analytics-h1 { font-size: 32px !important; }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
