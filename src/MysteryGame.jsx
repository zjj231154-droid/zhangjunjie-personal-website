import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackGameEvent } from "./analytics.js";
import {
  BedDouble,
  BookOpenText,
  BriefcaseBusiness,
  ChevronDown,
  CircleEllipsis,
  Coins,
  Compass,
  Eye,
  Footprints,
  HandCoins,
  HeartPulse,
  History,
  MapPin,
  Menu,
  MessageCircleMore,
  MoonStar,
  Newspaper,
  NotebookTabs,
  Save,
  ShieldAlert,
  Soup,
  Sparkles,
  SunMedium,
  Users,
  X,
} from "lucide-react";

const SAVE_KEY = "mystery-world-v2-save";

const BACKGROUNDS = [
  {
    id: "clerk",
    name: "失业文员",
    line: "识字、会算账，穿着还算体面，但口袋里只剩几天的余地。",
    money: 86,
    body: 54,
    spirit: 63,
    skills: ["识字", "记账", "文书"],
    inventory: ["旧钢笔", "便笺本", "普通外套"],
  },
  {
    id: "docker",
    name: "码头搬运工",
    line: "体力和街头经验是你仅有的本钱，旧伤会在阴雨天提醒你。",
    money: 47,
    body: 72,
    spirit: 49,
    skills: ["重体力", "街头经验", "辨认货物"],
    inventory: ["粗布手套", "短木棍", "旧外套"],
  },
  {
    id: "apprentice",
    name: "钟表学徒",
    line: "手稳、眼细，认识几位工匠；师傅去世后，铺子也没能留下。",
    money: 65,
    body: 58,
    spirit: 68,
    skills: ["精密修理", "观察", "估价"],
    inventory: ["小螺丝刀", "放大镜", "旧怀表"],
  },
  {
    id: "nurse",
    name: "诊所杂役",
    line: "见过伤口、病人和贫穷，也知道什么时候不该继续追问。",
    money: 58,
    body: 60,
    spirit: 71,
    skills: ["基础包扎", "察言观色", "清洁"],
    inventory: ["干净绷带", "小剪刀", "深色围巾"],
  },
];

const WEATHER = [
  { name: "阴冷", detail: "云层压得很低，煤烟停在屋脊之间。", work: 0, bread: 0 },
  { name: "小雨", detail: "细雨让石板路发亮，车轮经过时溅起脏水。", work: -1, bread: 0 },
  { name: "多云", detail: "风从烟囱之间穿过，街上比昨日干爽。", work: 1, bread: 0 },
  { name: "大雾", detail: "雾气吞掉了半条街，马车都放慢了速度。", work: -2, bread: 1 },
  { name: "晴冷", detail: "难得的阳光照在红砖墙上，空气仍带着寒意。", work: 1, bread: 0 },
];

const DISTRICTS = {
  room: "北区 · 水仙花街出租屋",
  market: "东区 · 街市",
  docks: "码头区 · 货运栈桥",
  tavern: "金梧桐区 · 老橡木酒馆",
  library: "北区 · 市立图书馆",
};

const CATEGORY_META = {
  survival: { label: "生存", icon: Soup },
  work: { label: "工作", icon: BriefcaseBusiness },
  social: { label: "人际", icon: Users },
  information: { label: "信息", icon: Newspaper },
  explore: { label: "探索", icon: Compass },
  retreat: { label: "回避", icon: Footprints },
  goal: { label: "长期", icon: NotebookTabs },
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const pad = (value) => String(value).padStart(2, "0");
const formatMoney = (pence) => {
  const safe = Math.max(0, Math.floor(pence));
  const pounds = Math.floor(safe / 240);
  const shillings = Math.floor((safe % 240) / 12);
  const pennies = safe % 12;
  const parts = [];
  if (pounds) parts.push(`${pounds}镑`);
  if (shillings) parts.push(`${shillings}苏勒`);
  if (pennies || !parts.length) parts.push(`${pennies}便士`);
  return parts.join(" ");
};

function rngFrom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function timeLabel(day, minute) {
  return `第 ${day} 日 · ${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;
}

function createGame(name, backgroundId) {
  const background = BACKGROUNDS.find((item) => item.id === backgroundId) ?? BACKGROUNDS[0];
  const seed = Math.floor(Math.random() * 0x7fffffff);
  return {
    version: 2,
    seed,
    turn: 0,
    player: {
      name: name.trim() || "无名者",
      backgroundId: background.id,
      background: background.name,
      skills: background.skills,
    },
    day: 1,
    minute: 7 * 60 + 20,
    location: "room",
    money: background.money,
    meters: {
      body: background.body,
      energy: 78,
      satiety: 64,
      spirit: background.spirit,
    },
    weather: WEATHER[0],
    inventory: [...background.inventory, "半块陈面包"],
    contacts: 0,
    familiarity: 0,
    evidence: 0,
    rentDue: 7,
    rentDebt: 0,
    injuries: [],
    flags: {
      readNewsToday: false,
      workedToday: false,
      suspiciousNotice: false,
      landlordWarned: false,
    },
    known: ["你租住的单间周租 2 苏勒，房租在第 7 日早晨到期。"],
    journal: [
      {
        id: `${seed}-0`,
        stamp: "第 1 日 · 07:20",
        title: "雾中的廷根",
        tone: "plain",
        text: `你是${background.name}${name.trim() ? `“${name.trim()}”` : ""}。窗外传来送奶车的铃声。桌上有半块陈面包，口袋里的钱足够撑一阵子——如果不出意外。`,
      },
    ],
  };
}

function meterTone(value) {
  if (value <= 25) return "danger";
  if (value <= 48) return "warn";
  return "steady";
}

function statusText(game) {
  if (game.meters.body <= 15) return "身体状况很差，继续逞强会有现实后果。";
  if (game.meters.energy <= 18) return "困倦让注意力和反应明显下降。";
  if (game.meters.satiety <= 18) return "饥饿已经开始削弱你的体力。";
  if (game.meters.spirit <= 22) return "精神紧绷，你很难可靠地判断细节。";
  if (game.flags.suspiciousNotice) return "你的暴力行为留下了目击者和血迹；后果尚未消失。";
  if (game.rentDebt > 0) return `欠租 ${formatMoney(game.rentDebt)}；房东不会无限等待。`;
  if (game.injuries.length > 0) return `你仍带着伤：${game.injuries[game.injuries.length - 1]}。`;
  return "目前没有迫在眉睫的危险。";
}

function StartScreen({ onStart, hasSave, onContinue }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("clerk");

  return (
    <main className="mystery-start">
      <div className="start-noise" aria-hidden="true" />
      <section className="start-intro">
        <div className="sigil" aria-hidden="true"><Eye size={42} strokeWidth={1.15} /></div>
        <p className="roman-kicker">THE WORLD REMEMBERS · V2</p>
        <h1><span>诡秘世界</span>模拟</h1>
        <blockquote>“这一次，原著只是过去。你真正接触过的每一件事，都会留下痕迹。”</blockquote>
        <div className="principle-strip">
          <span>现实因果</span><i />
          <span>人物利益</span><i />
          <span>已发生事实</span><i />
          <span>世界逻辑</span>
        </div>
      </section>

      <section className="creation-panel" aria-labelledby="creation-title">
        <div className="section-number">01</div>
        <div>
          <p className="panel-kicker">建立一个普通人的起点</p>
          <h2 id="creation-title">进入廷根</h2>
        </div>
        <label className="name-field">
          <span>你的名字</span>
          <input value={name} maxLength={18} onChange={(event) => setName(event.target.value)} placeholder="留空则称作“无名者”" />
        </label>
        <fieldset className="backgrounds">
          <legend>你的现状</legend>
          {BACKGROUNDS.map((background) => (
            <label className={`background-card ${selected === background.id ? "is-selected" : ""}`} key={background.id}>
              <input type="radio" name="background" value={background.id} checked={selected === background.id} onChange={() => setSelected(background.id)} />
              <span className="radio-mark" />
              <strong>{background.name}</strong>
              <small>{background.line}</small>
              <em>{formatMoney(background.money)} · {background.skills.join(" / ")}</em>
            </label>
          ))}
        </fieldset>
        <div className="start-actions">
          <button className="enter-button" onClick={() => onStart(name, selected)}>
            <span>开始生活</span><ChevronDown size={18} />
          </button>
          {hasSave && <button className="continue-button" onClick={onContinue}>继续上次存档</button>}
        </div>
        <p className="start-warning"><ShieldAlert size={14} /> 你可以影响世界，但不能直接宣布结果。</p>
      </section>
    </main>
  );
}

function Meter({ label, value, icon: Icon }) {
  return (
    <div className={`meter meter-${meterTone(value)}`}>
      <div className="meter-label"><span><Icon size={14} />{label}</span><strong>{Math.round(value)}</strong></div>
      <div className="meter-track" aria-label={`${label} ${Math.round(value)}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin="0" aria-valuemax="100">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MysteryGame() {
  const [game, setGame] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);
  const logEndRef = useRef(null);

  const storedGame = useMemo(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const save = (value = game) => {
    if (!value) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(value));
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
  };

  useEffect(() => {
    if (!game) return undefined;
    const timer = window.setTimeout(() => localStorage.setItem(SAVE_KEY, JSON.stringify(game)), 350);
    return () => window.clearTimeout(timer);
  }, [game]);

  const applyAction = (actionId, customText = "") => {
    trackGameEvent("action", { actionId });
    setGame((previous) => {
      if (!previous) return previous;
      const random = rngFrom(previous.seed + previous.turn * 7919 + actionId.length * 131);
      const next = structuredClone(previous);
      next.turn += 1;
      let minutes = 45;
      let title = "一段时间过去";
      let text = "你做了能做的事。没有足够证据表明这带来了额外变化。";
      let tone = "plain";
      let location = next.location;
      const addKnown = (line) => {
        if (!next.known.includes(line)) next.known.push(line);
      };
      const spend = (amount) => {
        if (next.money < amount) return false;
        next.money -= amount;
        return true;
      };
      const hasItem = (item) => next.inventory.includes(item);
      const removeItem = (item) => {
        const index = next.inventory.indexOf(item);
        if (index >= 0) next.inventory.splice(index, 1);
      };

      if (actionId === "eat") {
        minutes = 25;
        location = "market";
        if (hasItem("半块陈面包")) {
          removeItem("半块陈面包");
          next.meters.satiety = clamp(next.meters.satiety + 19);
          title = "吃掉剩下的面包";
          text = "面包又干又硬，蘸过凉水后勉强能咽下去。它解决了眼前的饥饿，没有更多事情发生。";
        } else {
          const price = 1 + (next.weather.bread || 0);
          if (spend(price)) {
            next.meters.satiety = clamp(next.meters.satiety + 27);
            title = "在街角买面包";
            text = `你花了 ${formatMoney(price)} 买到一只普通面包，当场吃掉大半。店主忙着招呼后面的客人，没有与你多谈。`;
          } else {
            title = "买不起面包";
            text = "你问了价格，最终只能把钱重新攥回手里。店主没有赊账的意思。";
            tone = "bad";
          }
        }
      } else if (actionId === "work") {
        minutes = 9 * 60;
        location = "docks";
        next.flags.workedToday = true;
        const fit = next.meters.body + next.meters.energy + (next.player.backgroundId === "docker" ? 24 : 0);
        if (fit < 72) {
          next.meters.body = clamp(next.meters.body - 8);
          next.meters.energy = clamp(next.meters.energy - 28);
          next.meters.satiety = clamp(next.meters.satiety - 22);
          title = "没有撑完这班活";
          text = "领工看出你动作发虚，只让你搬了两趟就换了人。你得到 3 便士，但肩背的疼痛更明显了。";
          next.money += 3;
          tone = "bad";
        } else {
          const earned = Math.max(10, 15 + Math.floor(random() * 7) + next.weather.work + (next.player.backgroundId === "docker" ? 2 : 0));
          next.money += earned;
          next.meters.energy = clamp(next.meters.energy - 36);
          next.meters.satiety = clamp(next.meters.satiety - 27);
          next.meters.body = clamp(next.meters.body - (next.player.backgroundId === "docker" ? 2 : 5));
          title = "码头的一整班活";
          text = `你和另外五个人把麻袋从驳船搬进仓库。领工按做完的趟数结了 ${formatMoney(earned)}。这是一笔真实的劳动收入，也确实耗掉了你大半天的体力。`;
          if (random() < 0.16 && next.meters.energy < 45) {
            next.injuries.push("左掌擦伤");
            next.meters.body = clamp(next.meters.body - 7);
            text += " 最后一趟时麻绳滑脱，你的左掌被粗纤维擦开了皮。";
            tone = "bad";
          }
        }
      } else if (actionId === "meal") {
        minutes = 55;
        location = "market";
        if (spend(4)) {
          next.meters.satiety = clamp(next.meters.satiety + 42);
          next.meters.spirit = clamp(next.meters.spirit + 3);
          title = "一份热炖菜";
          text = "廉价餐馆的炖菜里主要是土豆和胡萝卜，但足够热。邻桌谈的是工钱、孩子和房租，没有任何神秘意味。";
        } else {
          title = "在餐馆门外停步";
          text = "你闻到了热汤的气味，却付不起这一餐。店员看了你一眼，没有招呼你进去。";
          tone = "bad";
        }
      } else if (actionId === "newspaper") {
        minutes = 40;
        location = "market";
        if (!spend(1)) {
          title = "没能买报纸";
          text = "报童没有接受你的赊欠请求。消息也是有价格的。";
          tone = "bad";
        } else {
          next.flags.readNewsToday = true;
          title = "廷根市诚实报";
          const newsRoll = random();
          if (newsRoll < 0.66) {
            text = "头版是市议会的争论，次版刊登了几则招工广告和一桩普通盗窃案。你认真读完，没有发现与自己处境直接相关的东西。";
            addKnown("近期码头仍有零散短工，但领工更偏爱熟面孔。");
          } else {
            text = "一则不起眼的启事提到东区两家杂货铺因运输延误上调面粉售价。它可能影响面包价格，但远不是稳赚不赔的内幕。";
            addKnown("东区有两家杂货铺报告面粉运输延误。");
          }
        }
      } else if (actionId === "tavern") {
        minutes = 95;
        location = "tavern";
        if (!spend(3)) {
          title = "酒馆不提供免费座位";
          text = "侍者在你占住桌子前就走了过来。你没有点单，只能离开。";
          tone = "bad";
        } else {
          next.contacts += random() < 0.28 ? 1 : 0;
          next.meters.spirit = clamp(next.meters.spirit + 4);
          title = "老橡木酒馆的闲谈";
          if (random() < 0.72) {
            text = "你喝了一杯很淡的啤酒。周围的人谈论球队、领工脾气和一场拖欠工资的纠纷。没有人向陌生人透露秘密。";
          } else {
            text = "一个做马车修理的男人抱怨，昨晚有辆没有徽记的货车在西郊折断车轴。那更像走私商人的麻烦，不足以证明任何超自然事件。";
            addKnown("有人说昨夜一辆无徽记货车在西郊折断车轴；消息未经证实。");
          }
        }
      } else if (actionId === "observe") {
        minutes = 110;
        location = "market";
        next.familiarity += 1;
        next.meters.energy = clamp(next.meters.energy - 8);
        next.meters.satiety = clamp(next.meters.satiety - 6);
        title = "沿街观察";
        if (random() < 0.78 || next.familiarity < 3) {
          text = "你走过两条商业街和一片普通住宅区。煤车、洗衣妇、巡警和赶时间的职员各自忙碌。你没有发现值得追查的异常。";
        } else {
          text = "你记住了巡警换岗的大致时间，也认出几家清晨营业的店铺。这是对街区的了解，不是神秘线索。";
          addKnown("东区巡警通常在傍晚六点前后换岗。");
        }
      } else if (actionId === "investigate") {
        minutes = 150;
        location = "library";
        next.meters.energy = clamp(next.meters.energy - 10);
        const basis = next.known.length + next.familiarity + next.contacts;
        title = "核对已有消息";
        if (basis < 5 || random() < 0.68) {
          text = "你把记下的消息逐条核对，但来源太少，许多说法彼此没有关系。谨慎的结论是：目前没有可靠线索。";
        } else {
          next.evidence += 1;
          text = "你从旧报纸和街区记录里确认，其中一条消息的时间与地点能够互相印证。它仍不足以说明幕后原因，但至少不再只是传闻。";
          addKnown("一条旧消息已被独立来源部分印证，但原因不明。");
          tone = "notable";
        }
      } else if (actionId === "rest") {
        minutes = 8 * 60;
        location = "room";
        next.meters.energy = clamp(next.meters.energy + 58);
        next.meters.body = clamp(next.meters.body + (next.meters.satiety > 30 ? 7 : 2));
        next.meters.spirit = clamp(next.meters.spirit + 7);
        next.meters.satiety = clamp(next.meters.satiety - 16);
        title = "关门休息";
        text = "你把门闩插好，睡了过去。夜里有马车经过，也有人在楼下争吵，但没有事情专门找上你。";
      } else if (actionId === "notes") {
        minutes = 70;
        location = "room";
        next.meters.spirit = clamp(next.meters.spirit + 3);
        title = "整理见闻与账目";
        text = next.known.length < 4
          ? "你把花销和见过的人记进便笺本。目前的信息太少，整理没有凭空产生新的结论。"
          : "你按时间重新整理了见闻，划掉两处互相矛盾的猜测。留下来的事实不多，但比自欺欺人可靠。";
      } else if (actionId === "rent") {
        minutes = 20;
        location = "room";
        const amount = next.rentDebt || 24;
        if (spend(amount)) {
          next.rentDebt = 0;
          next.rentDue = next.day + 7;
          next.flags.landlordWarned = false;
          title = "付清房租";
          text = `房东数清了 ${formatMoney(amount)}，给你一张潦草收据。住处因此保留到第 ${next.rentDue} 日。`;
        } else {
          title = "钱不够付租";
          text = `你拿不出 ${formatMoney(amount)}。房东没有被你的处境打动，只提醒欠租会继续累积。`;
          tone = "bad";
        }
      } else if (actionId === "custom") {
        const raw = customText.trim();
        const lower = raw.toLowerCase();
        title = `尝试：${raw.slice(0, 24) || "未说明的行动"}`;
        if (!raw) {
          minutes = 0;
          text = "你需要说明自己准备做什么。";
          tone = "bad";
        } else if (/睡|休息|躺/.test(lower)) {
          minutes = 180;
          next.meters.energy = clamp(next.meters.energy + 28);
          location = "room";
          text = "你回到住处休息了三个小时。疲劳有所缓解，时间也确实过去了。";
        } else if (/杀|抢劫|捅|开枪|殴打|打死/.test(lower)) {
          minutes = 35;
          const armed = next.inventory.some((item) => /木棍|剪刀/.test(item));
          const fit = next.meters.body + next.meters.energy + (armed ? 18 : 0);
          next.meters.body = clamp(next.meters.body - (fit > 105 ? 12 : 25));
          next.meters.energy = clamp(next.meters.energy - 22);
          next.meters.spirit = clamp(next.meters.spirit - 10);
          title = "暴力尝试的后果";
          text = fit > 105
            ? "你的突然袭击让对方受了伤，却远没有等同于“你杀了他”。呼喊声引来了旁人，你只能在巡警抵达前逃开；衣袖上的血迹和目击者都已经成为痕迹。"
            : "对方在你靠近时就察觉了意图。扭打中你挨了几记重击，只能狼狈逃走。你说出的结果没有发生，伤势却真实留下。";
          next.injuries.push(fit > 105 ? "肋部挫伤" : "面部与肋部多处淤伤");
          next.flags.suspiciousNotice = true;
          tone = "bad";
        } else if (/魔药|配方|非凡|占卜|仪式|召唤/.test(lower)) {
          minutes = 80;
          next.meters.energy = clamp(next.meters.energy - 5);
          text = "你按自己的想法寻找相关事物，但没有知识、材料或可靠渠道。世界没有因为你的需要而送来配方或神秘人物。你只得到一次没有结果的尝试。";
        } else if (/跟踪|调查|查找|搜查|观察/.test(lower)) {
          minutes = 120;
          next.meters.energy = clamp(next.meters.energy - 8);
          text = random() < 0.82
            ? "你在能力和情报允许的范围内进行了查找。目标的活动看上去符合普通生活，没有发现可确认的异常。"
            : "你注意到一个细节与先前听到的说法不一致，便把它记了下来。它暂时只能算疑点，不能算结论。";
          if (text.includes("疑点")) next.evidence += 1;
        } else if (/工作|赚钱|打工/.test(lower)) {
          minutes = 240;
          const earned = 5 + Math.floor(random() * 5);
          next.money += earned;
          next.meters.energy = clamp(next.meters.energy - 19);
          next.meters.satiety = clamp(next.meters.satiety - 13);
          text = `你花时间四处询问，最后得到一份半天的清扫杂活，收入 ${formatMoney(earned)}。这份钱不多，但来源清楚。`;
        } else if (/吃|面包|食物|餐/.test(lower)) {
          minutes = 35;
          if (spend(2)) {
            next.meters.satiety = clamp(next.meters.satiety + 23);
            text = "你买到一份便宜食物并吃了下去。它改善了饥饿，没有附带秘密或好运。";
          } else {
            text = "你没有足够的钱买到想要的食物。店家拒绝赊欠。";
            tone = "bad";
          }
        } else {
          minutes = 60;
          next.meters.energy = clamp(next.meters.energy - 4);
          text = `你尝试了“${raw.slice(0, 48)}”。在现有身份、资源和信息范围内，这次行动没有产生可确认的特殊结果，但耗去的时间已经过去。`;
        }
      }

      next.location = location;
      const oldDay = next.day;
      next.minute += minutes;
      while (next.minute >= 24 * 60) {
        next.minute -= 24 * 60;
        next.day += 1;
        next.flags.readNewsToday = false;
        next.flags.workedToday = false;
        next.meters.satiety = clamp(next.meters.satiety - 8);
        const weatherRandom = rngFrom(next.seed + next.day * 3571)();
        next.weather = WEATHER[Math.floor(weatherRandom * WEATHER.length)];
      }

      if (next.day > oldDay && next.day >= next.rentDue) {
        next.rentDebt += 24;
        next.rentDue += 7;
        text += ` 房租账期已过，新增欠租 ${formatMoney(24)}。`;
        next.flags.landlordWarned = true;
        tone = "bad";
      }
      if (next.meters.satiety < 20 && minutes > 120) next.meters.body = clamp(next.meters.body - 4);
      if (next.meters.energy < 14 && actionId !== "rest") next.meters.spirit = clamp(next.meters.spirit - 3);

      const eventRoll = random();
      if (minutes >= 90 && eventRoll < 0.055 && actionId !== "custom") {
        text += " 你回程时遇到一段临时封路，只得绕行半小时。事故发生在两个街区外，与你没有直接关系。";
        next.minute += 30;
      }

      next.journal.push({
        id: `${next.seed}-${next.turn}`,
        stamp: timeLabel(next.day, next.minute),
        title,
        tone,
        text,
      });
      if (next.journal.length > 80) next.journal = next.journal.slice(-80);
      return next;
    });
    setCustomAction("");
    window.setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const start = (name, backgroundId) => {
    trackGameEvent("game_start", { backgroundId });
    setGame(createGame(name, backgroundId));
  };
  if (!game) return <StartScreen onStart={start} hasSave={Boolean(storedGame)} onContinue={() => setGame(storedGame)} />;

  const actionList = [
    { id: "eat", category: "survival", title: game.inventory.includes("半块陈面包") ? "吃掉陈面包" : "买一只普通面包", note: "约 25 分钟" },
    { id: "work", category: "work", title: "去码头找一班搬运活", note: "约 9 小时" },
    { id: "tavern", category: "social", title: "去老橡木酒馆坐一会", note: "3 便士 · 约 1.5 小时" },
    { id: "newspaper", category: "information", title: "买一份今日报纸", note: "1 便士 · 约 40 分钟" },
    { id: "observe", category: "explore", title: "沿街区慢慢观察", note: "约 2 小时" },
    { id: "rest", category: "retreat", title: "回出租屋睡一觉", note: "约 8 小时" },
    { id: "notes", category: "goal", title: "整理见闻与账目", note: "约 1 小时" },
  ];

  const latest = game.journal[game.journal.length - 1];
  const recent = game.journal.slice(-6);

  return (
    <div className="mystery-app">
      <header className="game-header">
        <div className="game-brand"><Eye size={24} strokeWidth={1.4} /><span><strong>诡秘世界</strong><small>因果真实版 · V2</small></span></div>
        <div className="world-clock"><span>{timeLabel(game.day, game.minute)}</span><i /> <span>{game.weather.name}</span></div>
        <nav aria-label="游戏功能">
          <button onClick={() => setShowRules(true)}>世界规则</button>
          <button onClick={() => setShowJournal(true)}><History size={15} />全部记录</button>
          <button className={savedPulse ? "is-saved" : ""} onClick={() => save()}><Save size={15} />{savedPulse ? "已保存" : "保存"}</button>
          <button className="mobile-menu" aria-label="打开角色状态" onClick={() => setMobilePanel(true)}><Menu size={19} /></button>
        </nav>
      </header>

      <div className="game-layout">
        <main className="story-column">
          <section className="location-banner">
            <div><MapPin size={15} /><span>{DISTRICTS[game.location]}</span></div>
            <p>{game.weather.detail}</p>
          </section>

          <section className="latest-scene" aria-live="polite">
            <div className="scene-index">{pad(game.turn + 1)}</div>
            <p className="scene-time">{latest.stamp}</p>
            <h1>{latest.title}</h1>
            <p className="scene-body">{latest.text}</p>
            <div className={`reality-note tone-${latest.tone}`}>
              <CircleEllipsis size={16} />
              <span>{statusText(game)}</span>
            </div>
          </section>

          <section className="actions-section" aria-labelledby="actions-heading">
            <div className="section-heading-row">
              <div><p>REFERENCE ACTIONS</p><h2 id="actions-heading">你接下来准备做什么？</h2></div>
              <span>选择意图，不保证结果</span>
            </div>
            <div className="action-grid">
              {actionList.map((action) => {
                const meta = CATEGORY_META[action.category];
                const Icon = meta.icon;
                return (
                  <button className="action-card" key={action.id} onClick={() => applyAction(action.id)}>
                    <span className="action-icon"><Icon size={18} /></span>
                    <span className="action-copy"><small>{meta.label}</small><strong>{action.title}</strong><em>{action.note}</em></span>
                    <span className="action-arrow">↗</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="custom-action">
            <div className="custom-heading"><MessageCircleMore size={18} /><span><strong>自由行动</strong><small>描述你尝试做什么，世界只承认实际发生的结果。</small></span></div>
            <div className="custom-entry">
              <textarea value={customAction} maxLength={180} onChange={(event) => setCustomAction(event.target.value)} placeholder="例如：我去东区寻找半天的清扫工作……" />
              <button disabled={!customAction.trim()} onClick={() => applyAction("custom", customAction)}>尝试行动</button>
            </div>
          </section>

          <section className="recent-log">
            <div className="log-title"><History size={16} /><h2>近期痕迹</h2><span>世界不会替你撤销已发生的事</span></div>
            {recent.slice(0, -1).reverse().map((entry) => (
              <article key={entry.id}><time>{entry.stamp}</time><div><strong>{entry.title}</strong><p>{entry.text}</p></div></article>
            ))}
            <div ref={logEndRef} />
          </section>
        </main>

        <aside className={`status-column ${mobilePanel ? "is-mobile-open" : ""}`}>
          <button className="close-mobile" aria-label="关闭角色状态" onClick={() => setMobilePanel(false)}><X size={20} /></button>
          <section className="identity-card">
            <div className="portrait-mark">{game.player.name.slice(0, 1)}</div>
            <div><p>当前身份</p><h2>{game.player.name}</h2><span>{game.player.background}</span></div>
          </section>
          <section className="money-card">
            <div><span><Coins size={15} />持有现金</span><strong>{formatMoney(game.money)}</strong></div>
            <small>下次房租：第 {game.rentDue} 日 · 2 苏勒</small>
            {game.rentDebt > 0 && <p>已欠 {formatMoney(game.rentDebt)}</p>}
            {(game.rentDebt > 0 || game.day >= game.rentDue - 1) && <button onClick={() => applyAction("rent")}><HandCoins size={14} />支付房租</button>}
          </section>
          <section className="meters-card">
            <div className="side-title"><span>身心状态</span><small>会影响行动结果</small></div>
            <Meter label="身体" value={game.meters.body} icon={HeartPulse} />
            <Meter label="精力" value={game.meters.energy} icon={SunMedium} />
            <Meter label="饱腹" value={game.meters.satiety} icon={Soup} />
            <Meter label="精神" value={game.meters.spirit} icon={MoonStar} />
          </section>
          <section className="facts-card">
            <div className="side-title"><span>你确实知道的事</span><small>{game.known.length} 条</small></div>
            <ul>{game.known.slice(-5).reverse().map((fact) => <li key={fact}>{fact}</li>)}</ul>
          </section>
          <section className="inventory-card">
            <div className="side-title"><span>随身物品</span><small>{game.inventory.length} 件</small></div>
            <div className="inventory-list">{game.inventory.map((item) => <span key={item}>{item}</span>)}</div>
            {game.injuries.length > 0 && <div className="injuries"><strong>伤势</strong>{game.injuries.map((item) => <span key={item}>{item}</span>)}</div>}
          </section>
          <p className="simulation-footnote"><Sparkles size={13} />后台世界持续运行，但你不会直接看到未获知的事件。</p>
        </aside>
      </div>

      {mobilePanel && <button className="mobile-scrim" aria-label="关闭角色状态" onClick={() => setMobilePanel(false)} />}

      {showRules && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowRules(false)}>
          <section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label="关闭" onClick={() => setShowRules(false)}><X size={20} /></button>
            <p className="panel-kicker">WORLD CONSTITUTION</p>
            <h2 id="rules-title">世界不为玩家而存在</h2>
            <p className="rules-lead">你说的是尝试，结果由身份、状态、资源、距离、环境、他人利益与既成事实共同决定。</p>
            <ol>
              <li><strong>现实优先</strong><span>现实因果 ＞ 人物利益 ＞ 已发生事实 ＞ 世界逻辑 ＞ 原著基线 ＞ 玩家期待 ＞ 戏剧性。</span></li>
              <li><strong>允许平淡</strong><span>酒馆可以只是酒馆，普通人可以只是普通人，调查也可能没有任何发现。</span></li>
              <li><strong>持续后果</strong><span>钱、伤势、欠租、传闻与目击都不会在下一回合自动复原。</span></li>
              <li><strong>真实经济</strong><span>1 金镑 = 20 苏勒 = 240 便士。收入必须来自劳动、货物或服务。</span></li>
              <li><strong>信息有来源</strong><span>停留会增加接触信息的机会，但时间从不自动兑换关键线索。</span></li>
            </ol>
          </section>
        </div>
      )}

      {showJournal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowJournal(false)}>
          <section className="journal-modal" role="dialog" aria-modal="true" aria-labelledby="journal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label="关闭" onClick={() => setShowJournal(false)}><X size={20} /></button>
            <p className="panel-kicker">CHRONICLE</p>
            <h2 id="journal-title">已经发生的事</h2>
            <div className="journal-list">{[...game.journal].reverse().map((entry) => <article key={entry.id}><time>{entry.stamp}</time><div><strong>{entry.title}</strong><p>{entry.text}</p></div></article>)}</div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MysteryGame;
