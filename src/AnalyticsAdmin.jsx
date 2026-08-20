import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  Check,
  Clock3,
  Eye,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";

const ADMIN_SESSION_KEY = "mystery_admin_key";

const formatDuration = (seconds) => {
  const value = Number(seconds) || 0;
  if (value < 60) return `${value} 秒`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return `${minutes} 分 ${rest} 秒`;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")));
};

function TrendChart({ rows }) {
  const width = 720;
  const height = 220;
  const padding = { left: 34, right: 18, top: 22, bottom: 34 };
  const max = Math.max(1, ...rows.flatMap((row) => [Number(row.visitors) || 0, Number(row.views) || 0]));
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / Math.max(1, rows.length - 1);
  const y = (value) => height - padding.bottom - (Number(value) / max) * (height - padding.top - padding.bottom);
  const path = (field) => rows.map((row, index) => `${index ? "L" : "M"}${x(index)},${y(row[field])}`).join(" ");

  if (!rows.length) return <div className="empty-chart">数据将在出现第一位访客后显示</div>;
  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="访客与访问次数趋势">
      {[0, 0.5, 1].map((ratio) => (
        <g key={ratio}>
          <line x1={padding.left} x2={width - padding.right} y1={y(max * ratio)} y2={y(max * ratio)} />
          <text x={padding.left - 8} y={y(max * ratio) + 4} textAnchor="end">{Math.round(max * ratio)}</text>
        </g>
      ))}
      <path className="line-views" d={path("views")} />
      <path className="line-visitors" d={path("visitors")} />
      {rows.map((row, index) => (
        <g key={row.day}>
          <circle className="point-visitors" cx={x(index)} cy={y(row.visitors)} r="4"><title>{row.day} · {row.visitors} 位访客</title></circle>
          {(index === 0 || index === rows.length - 1 || rows.length <= 7) && <text x={x(index)} y={height - 10} textAnchor={index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"}>{row.day.slice(5)}</text>}
        </g>
      ))}
    </svg>
  );
}

function Login({ onLogin, error, busy }) {
  const [key, setKey] = useState("");
  return (
    <main className="admin-login">
      <section className="login-card">
        <div className="login-sigil"><Eye size={30} /></div>
        <p>PRIVATE OBSERVATORY</p>
        <h1>数据观测后台</h1>
        <span>输入部署时生成的管理密钥。密钥只保存在当前浏览器会话中。</span>
        <form onSubmit={(event) => { event.preventDefault(); onLogin(key); }}>
          <label><KeyRound size={16} /><input type="password" autoComplete="current-password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="管理密钥" /></label>
          {error && <div className="login-error"><AlertTriangle size={14} />{error}</div>}
          <button disabled={busy || !key.trim()}>{busy ? "正在验证…" : "进入后台"}</button>
        </form>
      </section>
    </main>
  );
}

export default function AnalyticsAdmin() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) || "");
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedError, setExpandedError] = useState(null);

  const load = useCallback(async (key = adminKey, range = days) => {
    if (!key) return false;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/summary?days=${range}`, { headers: { authorization: `Bearer ${key}` } });
      if (response.status === 401) throw new Error("管理密钥不正确");
      if (!response.ok) throw new Error("数据服务暂时不可用");
      const result = await response.json();
      setData(result);
      return true;
    } catch (caught) {
      setError(caught.message || "加载失败");
      return false;
    } finally {
      setBusy(false);
    }
  }, [adminKey, days]);

  useEffect(() => { if (adminKey) load(); }, [adminKey, load]);

  const login = async (key) => {
    const ok = await load(key.trim(), days);
    if (ok) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, key.trim());
      setAdminKey(key.trim());
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminKey("");
    setData(null);
  };

  const changeDays = (value) => {
    const next = Number(value);
    setDays(next);
    load(adminKey, next);
  };

  const resolveError = async (id, status) => {
    const response = await fetch(`/api/admin/errors/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ status }),
    });
    if (response.ok) load();
  };

  const sourceMax = useMemo(() => Math.max(1, ...(data?.sources || []).map((item) => Number(item.sessions) || 0)), [data]);
  if (!adminKey || (!data && error)) return <Login onLogin={login} error={error} busy={busy} />;
  if (!data) return <div className="admin-loading"><RefreshCw className="spin" />正在读取观测记录…</div>;

  const overview = data.overview || {};
  const metricCards = [
    { label: "今日访客", value: overview.visitors_today || 0, note: `累计 ${overview.visitors_total || 0} 位`, icon: Users },
    { label: "今日浏览", value: overview.views_today || 0, note: `累计 ${overview.sessions_total || 0} 个会话`, icon: Eye },
    { label: "平均有效停留", value: formatDuration(overview.avg_active_today), note: "仅统计活跃前台时间", icon: Clock3 },
    { label: "未处理错误", value: overview.open_errors || 0, note: overview.open_errors ? "需要查看" : "运行正常", icon: Bug, alert: Number(overview.open_errors) > 0 },
  ];

  return (
    <div className="analytics-admin">
      <header className="admin-header">
        <div className="admin-brand"><Eye size={23} /><span><strong>诡秘世界</strong><small>DATA OBSERVATORY</small></span></div>
        <nav>
          <a href="/mystery.html" target="_blank" rel="noreferrer">打开游戏<ArrowUpRight size={14} /></a>
          <button onClick={() => load()} disabled={busy}><RefreshCw className={busy ? "spin" : ""} size={15} />刷新</button>
          <button onClick={logout}><LogOut size={15} />退出</button>
        </nav>
      </header>

      <main className="admin-shell">
        <section className="dashboard-title">
          <div><p>ANONYMOUS PRODUCT ANALYTICS</p><h1>游戏运行观测</h1><span>访客数据按北京时间统计，不采集姓名、邮箱或游戏输入内容。</span></div>
          <label>观察周期<select value={days} onChange={(event) => changeDays(event.target.value)}><option value="7">最近 7 天</option><option value="14">最近 14 天</option><option value="30">最近 30 天</option></select></label>
        </section>

        <section className="metric-grid" aria-label="关键指标">
          {metricCards.map(({ label, value, note, icon: Icon, alert }) => (
            <article className={alert ? "metric-alert" : ""} key={label}><div><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{note}</small></article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="chart-panel trend-panel">
            <div className="panel-title"><div><p>TRAFFIC TREND</p><h2>访客与浏览趋势</h2></div><div className="legend"><span><i className="legend-visitors" />访客</span><span><i className="legend-views" />浏览</span></div></div>
            <TrendChart rows={data.trend || []} />
          </article>
          <article className="chart-panel behavior-panel">
            <div className="panel-title"><div><p>ENGAGEMENT</p><h2>游玩深度</h2></div><MousePointerClick size={18} /></div>
            <div className="engagement-value"><strong>{overview.start_rate || 0}%</strong><span>访问后开始游戏</span></div>
            <div className="engagement-bar"><i style={{ width: `${Math.min(100, Number(overview.start_rate) || 0)}%` }} /></div>
            <div className="behavior-stats"><div><Activity size={16} /><span><strong>{overview.actions_total || 0}</strong>累计行动次数</span></div><div><ShieldCheck size={16} /><span><strong>匿名</strong>不保存玩家输入</span></div></div>
          </article>
        </section>

        <section className="dashboard-grid lower-grid">
          <article className="chart-panel sources-panel">
            <div className="panel-title"><div><p>ACQUISITION</p><h2>访问来源</h2></div><Route size={18} /></div>
            <div className="source-list">{data.sources.length ? data.sources.map((item) => <div key={item.name}><span>{item.name === "direct" ? "直接访问" : item.name}</span><div><i style={{ width: `${(item.sessions / sourceMax) * 100}%` }} /></div><strong>{item.sessions}</strong></div>) : <p className="empty-copy">暂无来源数据</p>}</div>
          </article>
          <article className="chart-panel devices-panel">
            <div className="panel-title"><div><p>DEVICE MIX</p><h2>访问设备</h2></div><MonitorSmartphone size={18} /></div>
            <div className="device-list">{data.devices.length ? data.devices.map((item) => <div key={item.name}><span>{item.name === "mobile" ? "手机" : item.name === "tablet" ? "平板" : item.name === "desktop" ? "电脑" : "未知"}</span><strong>{item.sessions}</strong></div>) : <p className="empty-copy">暂无设备数据</p>}</div>
          </article>
        </section>

        <section className="errors-panel">
          <div className="panel-title"><div><p>ERROR INBOX</p><h2>最近错误</h2></div><span>{data.errors.length} 条记录</span></div>
          {data.errors.length ? <div className="error-list">{data.errors.map((item) => (
            <article className={item.status === "resolved" ? "is-resolved" : ""} key={item.id}>
              <button className="error-main" onClick={() => setExpandedError(expandedError === item.id ? null : item.id)}>
                <span className="error-state"><Bug size={15} /></span><span><strong>{item.message}</strong><small>{formatDate(item.created_at)} · {item.source || "未知来源"}{item.line ? `:${item.line}` : ""}</small></span><em>{item.status === "resolved" ? "已处理" : "待处理"}</em>
              </button>
              {expandedError === item.id && <div className="error-detail"><pre>{item.stack || "未提供调用栈"}</pre><button onClick={() => resolveError(item.id, item.status === "resolved" ? "new" : "resolved")}><Check size={14} />{item.status === "resolved" ? "重新打开" : "标记为已处理"}</button></div>}
            </article>
          ))}</div> : <div className="empty-errors"><ShieldCheck size={26} /><strong>还没有捕获到前端错误</strong><span>页面脚本错误和未处理的异步异常会自动出现在这里。</span></div>}
        </section>

        <footer>最近更新：{formatDate(data.generatedAt)} · 活跃停留在页面处于前台且用户最近有操作时累计</footer>
      </main>
    </div>
  );
}
