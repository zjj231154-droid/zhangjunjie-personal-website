import React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  Layers3,
  Mail,
  MapPin,
  PenTool,
  Sparkles,
  Workflow,
} from "lucide-react";
import BorderGlow from "./components/BorderGlow.jsx";
import Masonry from "./components/Masonry.jsx";
import PillNav from "./components/PillNav.jsx";
import ShapeBlur from "./components/ShapeBlur.jsx";
import SplitText from "./components/SplitText.jsx";
import VariableTitle from "./components/VariableTitle.jsx";
import Waves from "./components/Waves.jsx";

const contactEmail = "3146715274@qq.com";
const assetUrl = (path) => {
  if (!path) return path;
  const value = String(path);
  if (/^(https?:|data:|blob:|mailto:|#)/.test(value)) return value;

  return `${import.meta.env.BASE_URL}${value.replace(/^\/+/, "")}`;
};

const metrics = [
  { value: "40%+", label: "AI 自动化与 SOP 带来的流转效率提升" },
  { value: "0-1", label: "AI 资产库、品牌框架与执行流程搭建" },
  { value: "3+", label: "产品规划、品牌视觉、供应链执行复合经验" },
];

const projects = [
  {
    title: "Walulu 电商美化升级 SOP",
    tag: "AI Workflow / Brand Operation",
    image: "/assets/project-walulu-sop.webp",
    summary:
      "围绕电商店铺视觉一致性、素材生产与跨团队协作，搭建可复用的美化升级流程，提升需求沟通、脚本生成与执行验收效率。",
  },
  {
    title: "Walulu 小程序 UI 玩法升级",
    tag: "Mini Program / Interaction",
    image: "/assets/project-walulu-miniapp.webp",
    summary:
      "从用户路径、IP 角色表达和玩法转化出发，梳理小程序界面层级与互动触点，为后续运营活动与品牌资产沉淀提供界面基础。",
  },
  {
    title: "AI 赋能 Walulu 品牌搭建",
    tag: "Brand Strategy / AI Asset",
    image: "/assets/project-ai-brand-system.webp",
    summary:
      "建立角色 IP 标准、AI 图像/视频素材库与运营目标框架，把创意发散、视觉提案和品牌执行收敛成稳定生产系统。",
  },
];

const waluluGalleryCards = [
  {
    id: "walulu-visual-assets",
    title: "视觉资产整理",
    eyebrow: "Gallery 01 / Visual Assets",
    image: "/assets/walulu-gallery-1.webp",
    extensionImages: [
      "/assets/k1/k1-01.webp",
      "/assets/k1/k1-02.webp",
      "/assets/k1/k1-03.webp",
      "/assets/k1/k1-04.webp",
      "/assets/k1/k1-05.webp",
      "/assets/k1/k1-06.webp",
      "/assets/k1/k1-07.webp",
    ],
    description: "围绕 Walulu 电商美化升级中生成的主视觉资产，沉淀可复用的图片风格、构图方向和素材标准。",
  },
  {
    id: "walulu-scene-pack",
    title: "场景化素材包",
    eyebrow: "Gallery 02 / Scene Pack",
    image: "/assets/walulu-gallery-2.webp",
    extensionImages: [
      "/assets/k2/k2-01.webp",
      "/assets/k2/k2-02.webp",
      "/assets/k2/k2-03.webp",
      "/assets/k2/k2-04.webp",
      "/assets/k2/k2-05.webp",
      "/assets/k2/k2-06.webp",
    ],
    description: "将产品、玩具和春日场景做成可延展的视觉素材包，方便后续店铺页面和运营活动快速调用。",
  },
  {
    id: "walulu-layout-system",
    title: "页面版式系统",
    eyebrow: "Gallery 03 / Layout System",
    image: "/assets/k3/k3-01.webp",
    extensionImages: [
      "/assets/k3/k3-01.webp",
      "/assets/k3/k3-02.webp",
      "/assets/k3/k3-03.webp",
      "/assets/k3/k3-04.webp",
      "/assets/k3/k3-05.webp",
      "/assets/k3/k3-06.webp",
    ],
    description: "从高信息密度页面中抽取版式骨架，让素材、卖点、氛围和转化按钮拥有更稳定的视觉层级。",
  },
  {
    id: "walulu-brand-extension",
    title: "品牌延展视觉",
    eyebrow: "Gallery 04 / Brand Extension",
    image: "/assets/walulu-gallery-4.webp",
    extensionImages: [
      "/assets/k4/k4-01.webp",
      "/assets/k4/k4-02.webp",
      "/assets/k4/k4-03.webp",
      "/assets/k4/k4-04.webp",
      "/assets/k4/k4-05.webp",
      "/assets/k4/k4-06.webp",
    ],
    description: "把单张素材进一步转化为品牌延展方向，形成适合长期运营的统一视觉语言。",
  },
];

const buildMasonryItems = (activeIndex) => {
  const activeCard = waluluGalleryCards[activeIndex];
  const images = activeCard.extensionImages?.length ? activeCard.extensionImages : [activeCard.image];
  const heights = [760, 560, 700, 520, 660, 600, 720];

  return images.map((image, index) => ({
    id: `${activeCard.id}-${index}`,
    img: assetUrl(image),
    url: "#projects",
    height: heights[index % heights.length],
    label: `${activeCard.title} ${String(index + 1).padStart(2, "0")}`,
  }));
};

const imageSeries = (folder, prefix, count, ext = "webp") =>
  Array.from({ length: count }, (_, index) => `/assets/${folder}/${prefix}-${String(index + 1).padStart(2, "0")}.${ext}`);

const miniProgramCards = [
  {
    id: "mini-user-path",
    className: "crowd-card-a",
    label: "USER PATH",
    title: "界面升级",
    eyebrow: "Mini 01 / User Path",
    description: "围绕用户进入、浏览、理解和转化路径，整理小程序玩法升级中的关键页面与信息触点。",
    images: imageSeries("mini-x1", "mini-x1", 5),
  },
  {
    id: "mini-role-ip",
    className: "crowd-card-b",
    label: "ROLE IP",
    title: "玩法设计",
    eyebrow: "Mini 02 / Role IP",
    description: "从角色视觉、场景素材和情绪表达出发，让小程序中的 IP 角色更容易被识别和延展。",
    images: imageSeries("mini-x2", "mini-x2", 6),
  },
  {
    id: "mini-play-loop",
    className: "crowd-card-c",
    label: "PLAY LOOP",
    title: "功能延展",
    eyebrow: "Mini 03 / Play Loop",
    description: "把玩法入口、互动节奏和运营目标串联起来，让用户在浏览中自然完成参与和转化。",
    images: imageSeries("mini-x3", "mini-x3", 5),
  },
  {
    id: "mini-ui-system",
    className: "crowd-card-d",
    label: "UI SYSTEM",
    title: "IP 资产",
    eyebrow: "Mini 04 / UI System",
    description: "结合熊猫 IP 与景点资产，建立更清晰的内容层级、卡片结构和视觉识别关系。",
    images: imageSeries("mini-places", "mini-places", 71),
  },
  {
    id: "mini-touchpoints",
    className: "crowd-card-e",
    label: "05",
    title: "用户留存",
    eyebrow: "Mini 05 / Touchpoints",
    description: "将运营触点、活动画面和传播素材统一到同一套视觉节奏中，提升后续复用效率。",
    images: [
      "/assets/mini-x4/mini-x4-01.webp",
      "/assets/mini-x4/mini-x4-02.webp",
      "/assets/mini-x4/mini-x4-03.webp",
      "/assets/mini-x4/mini-x4-04.webp",
      "/assets/mini-x4/mini-x4-05.webp",
      "/assets/mini-x4/mini-x4-06.webp",
      "/assets/mini-x4/mini-x4-07.webp",
      "/assets/mini-x4/mini-x4-08.webp",
      "/assets/mini-x4/mini-x4-09.webp",
      "/assets/mini-x4/mini-x4-10.webp",
    ],
  },
];

const buildMiniMasonryItems = (activeIndex) => {
  const activeCard = miniProgramCards[activeIndex];
  const heights = [620, 480, 700, 540, 660, 520, 760, 590, 680, 500];

  return activeCard.images.map((image, index) => ({
    id: `${activeCard.id}-${index}`,
    img: assetUrl(image),
    url: "#project-miniapp",
    height: heights[index % heights.length],
    label: `${activeCard.title} ${String(index + 1).padStart(2, "0")}`,
  }));
};

const brandSystemCards = [
  {
    id: "brand-operation",
    className: "post-card-side",
    title: "品牌运营",
    eyebrow: "Brand 01 / Operation",
    image: "/assets/brand-ip1/brand-ip1-01.webp",
    description: "将品牌日常运营需要的视觉、素材和传播节奏整理成可复用资产，提升后续活动执行效率。",
    images: imageSeries("brand-ip1", "brand-ip1", 6),
  },
  {
    id: "brand-creative",
    className: "post-card-main",
    title: "品牌创意",
    eyebrow: "Brand 02 / Creative",
    image: "/assets/brand-ip2/brand-ip2-01.webp",
    description: "围绕品牌角色和内容调性进行创意发散，形成更完整的视觉提案与素材库方向。",
    images: imageSeries("brand-ip2", "brand-ip2", 19),
  },
  {
    id: "brand-building",
    className: "post-card-main",
    title: "品牌建设",
    eyebrow: "Brand 03 / Building",
    image: "/assets/brand-ip3/brand-ip3-01.mp4",
    description: "用动态视频资产呈现品牌气质和角色叙事，让 IP 从静态形象延展到更完整的内容表达。",
    images: ["/assets/brand-ip3/brand-ip3-01.mp4"],
  },
  {
    id: "brand-ip",
    className: "post-card-side",
    title: "品牌 IP",
    eyebrow: "Brand 04 / IP",
    image: "/assets/brand-ip4/brand-ip4-01.webp",
    description: "围绕 IP 场景、角色资产和外部触点做延展，形成可长期运营的品牌识别系统。",
    images: [
      "/assets/brand-ip4/brand-ip4-01.webp",
      "/assets/brand-ip4/brand-ip4-02.webp",
      "/assets/brand-ip4/brand-ip4-03.webp",
      "/assets/brand-ip4/brand-ip4-04.webp",
      "/assets/brand-ip4/brand-ip4-05.webp",
      "/assets/brand-ip4/brand-ip4-06.webp",
      "/assets/brand-ip4/brand-ip4-07.webp",
      "/assets/brand-ip4/brand-ip4-08.webp",
      "/assets/brand-ip4/brand-ip4-09.webp",
      "/assets/brand-ip4/brand-ip4-10.webp",
    ],
  },
];

const buildBrandMasonryItems = (activeIndex) => {
  const activeCard = brandSystemCards[activeIndex];
  const heights = activeCard.images.length === 1 ? [840] : [660, 520, 760, 560, 700, 500, 620, 580];

  return activeCard.images.map((image, index) => ({
    id: `${activeCard.id}-${index}`,
    img: assetUrl(image),
    url: "#project-brand",
    type: image.endsWith(".mp4") ? "video" : "image",
    height: heights[index % heights.length],
    label: `${activeCard.title} ${String(index + 1).padStart(2, "0")}`,
  }));
};

const strengths = [
  {
    icon: BrainCircuit,
    title: "AI 工具链整合",
    text: "熟练使用 ChatGPT、Midjourney、Codex、Claude 等工具，把提示词、脚本、素材与 Agent 流程转成业务生产力。",
  },
  {
    icon: Workflow,
    title: "从规划到落地",
    text: "具备项目规划、流程 SOP、供应链对接、执行监督的全链路经验，能把模糊目标拆成可交付动作。",
  },
  {
    icon: PenTool,
    title: "品牌与产品表达",
    text: "文创与产品设计背景，理解品牌 IP、视觉系统、用户界面和商业目标之间的连接方式。",
  },
  {
    icon: Layers3,
    title: "跨角色协同",
    text: "能在设计、运营、产品、供应链之间翻译需求，减少沟通损耗，让团队对齐同一套判断标准。",
  },
];

function Nav() {
  const items = [
    { label: "经历", href: "#experience" },
    { label: "项目", href: "#projects" },
    { label: "优势", href: "#strengths" },
    { label: "联系", href: "#contact" },
  ];

  return (
    <PillNav
      logoText="ZJJ"
      items={items}
      activeHref={typeof window !== "undefined" ? window.location.hash || "#top" : "#top"}
      contactHref={`mailto:${contactEmail}`}
      contactLabel="联系我"
      ease="power3.easeOut"
    />
  );
}

function Hero() {
  return (
    <section className="hero section-screen" id="top">
      <div className="hero-video" aria-hidden="true">
        <video autoPlay muted loop playsInline poster={assetUrl("/assets/project-walulu-sop.webp")}>
          <source
            src="https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="video-fallback" />
      </div>
      <div className="hero-shapes" aria-hidden="true">
        <span className="shape-ring ring-one" />
        <span className="shape-ring ring-two" />
        <span className="shape-chip chip-one">AI PRODUCT</span>
        <span className="shape-chip chip-two">BRAND SYSTEM</span>
      </div>
      <Nav />
      <div className="hero-inner page-shell">
        <div className="hero-visual" aria-label="张俊杰个人照片">
          <div className="photo-stage">
            <img src={assetUrl("/assets/zjj-cutout.webp")} alt="张俊杰" />
          </div>
          <div className="hero-mini-card">
            <Sparkles size={18} />
            <span>Chengdu / Remote</span>
          </div>
        </div>
        <div className="hero-copy">
          <p className="corner-note">AI Product Design - Brand Growth</p>
          <SplitText tag="p" text="Hello, I'm" className="hello-badge" onceKey="hero-hello" delay={0.035} />
          <h1>
            <VariableTitle label="张俊杰" className="hero-title-line" radius={160} />
            <span className="hero-title-line">
              <VariableTitle label="Product" className="hero-title-inline" radius={150} />{" "}
              <mark className="hero-shape-mark">
                <ShapeBlur
                  className="hero-mark-blur"
                  variation={0}
                  shapeSize={1.05}
                  roundness={0.18}
                  borderSize={0.045}
                  circleSize={0.36}
                  circleEdge={0.7}
                />
                <VariableTitle label="Designer" className="hero-title-inline" radius={150} />
              </mark>
            </span>
            <span className="hero-title-line">
              <VariableTitle label="and" className="hero-title-inline" radius={120} />{" "}
              <mark className="mark-purple hero-shape-mark">
                <ShapeBlur
                  className="hero-mark-blur"
                  variation={0}
                  shapeSize={1}
                  roundness={0.22}
                  borderSize={0.055}
                  circleSize={0.38}
                  circleEdge={0.72}
                />
                <VariableTitle label="PM" className="hero-title-inline" radius={110} />
              </mark>
            </span>
          </h1>
          <SplitText
            tag="p"
            text="文创设计师出身，具备从项目规划、供应链对接到落地执行的全流程能力。"
            className="hero-statement"
            splitType="words"
            onceKey="hero-statement"
            delay={0.06}
            duration={0.7}
            from={{ opacity: 0, y: 20, filter: "blur(7px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          />
          <div className="hero-actions">
            <a className="primary-link" href="#projects">
              查看项目
              <ArrowUpRight size={18} />
            </a>
            <a className="ghost-link" href="#contact">
              发送邮件
            </a>
            <a className="ghost-link resume-link" href={assetUrl("/assets/zjj-resume.pdf")} target="_blank" rel="noreferrer">
              简历
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
      <a className="scroll-cue" href="#experience" aria-label="滚动到经历">
        <ArrowDown size={19} />
      </a>
    </section>
  );
}

function Experience() {
  return (
    <section className="experience section-block poster-experience" id="experience">
      <div className="page-shell experience-poster">
        <div className="poster-kicker-row" aria-hidden="true">
          <span>Product</span>
          <span>Design</span>
          <span>Brand</span>
        </div>
        <div className="poster-title-stack">
          <p className="eyebrow">Profile</p>
          <VariableTitle label="全流程能力" as="h2" radius={180} />
          <VariableTitle label="GROWTH" as="strong" radius={220} />
        </div>
        <BorderGlow
          className="poster-side poster-left"
          backgroundColor="rgba(8, 10, 13, 0.78)"
          glowColor="84 100 52"
          colors={["#b8ff08", "#6d2cff", "#f6f8f3"]}
          animated
        >
          <div className="poster-card-content">
            <span className="poster-label">定位</span>
            <p>产品设计师 / 产品经理 / 品牌经理</p>
            <small>成都 / 远程协作</small>
          </div>
        </BorderGlow>
        <BorderGlow
          className="poster-side poster-right"
          backgroundColor="rgba(8, 10, 13, 0.78)"
          glowColor="262 100 70"
          colors={["#6d2cff", "#b8ff08", "#f6f8f3"]}
          animated
          fillOpacity={0.52}
        >
          <div className="poster-card-content">
            <span className="poster-label">方法</span>
            <p>把 AI 工具、品牌叙事、产品流程和供应链执行整合成可落地系统。</p>
            <small>AI Workflow / SOP / Brand IP</small>
          </div>
        </BorderGlow>
        <div className="poster-person">
          <img src={assetUrl("/assets/zjj-crossed-cutout.webp")} alt="张俊杰完整人物抠图" />
          <div className="poster-eye-label">AI + PRODUCT</div>
        </div>
        <BorderGlow
          className="poster-caption"
          backgroundColor="rgba(3, 4, 6, 0.9)"
          borderRadius={18}
          glowColor="84 100 52"
          glowRadius={34}
          colors={["#b8ff08", "#6d2cff", "#f6f8f3"]}
          fillOpacity={0.36}
        >
          <div className="poster-caption-content">
            <strong>把设计判断、AI 效率和项目执行放在同一张工作台上。</strong>
            <p>
              我是张俊杰，文创设计师出身，具备从项目规划、品牌视觉、AI 自动化流程到供应链对接和落地验收的完整推进能力。
            </p>
            <div className="info-row poster-info">
              <span>
                <MapPin size={17} />
                成都
              </span>
              <a href={`mailto:${contactEmail}`}>
                <Mail size={17} />
                {contactEmail}
              </a>
            </div>
          </div>
        </BorderGlow>
        <div className="metric-grid poster-metrics">
          {metrics.map((metric, index) => (
            <BorderGlow
              className="metric-card"
              key={metric.label}
              backgroundColor="rgba(8, 10, 13, 0.7)"
              borderRadius={16}
              glowRadius={22}
              edgeSensitivity={40}
              glowColor={index === 1 ? "262 100 70" : "84 100 52"}
              colors={index === 1 ? ["#6d2cff", "#b8ff08", "#f6f8f3"] : ["#b8ff08", "#6d2cff", "#f6f8f3"]}
              fillOpacity={0.16}
            >
              <div className="metric-card-content">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const [sopProject, miniappProject, brandProject] = projects;
  const [expandedGalleryIndex, setExpandedGalleryIndex] = React.useState(null);
  const [expandedMiniIndex, setExpandedMiniIndex] = React.useState(null);
  const [expandedBrandIndex, setExpandedBrandIndex] = React.useState(null);
  const expandedGalleryCard = expandedGalleryIndex === null ? null : waluluGalleryCards[expandedGalleryIndex];
  const expandedMiniCard = expandedMiniIndex === null ? null : miniProgramCards[expandedMiniIndex];
  const expandedBrandCard = expandedBrandIndex === null ? null : brandSystemCards[expandedBrandIndex];

  return (
    <>
      <section className={`project-page project-page-unique section-screen ${expandedGalleryCard ? "has-gallery-expander" : ""}`} id="projects">
        <div className={`project-shell project-unique-shell ${expandedGalleryCard ? "has-gallery-expander" : ""}`}>
          <header className="project-mini-nav">
            <strong>Walulu</strong>
            <span>AI Workflow</span>
            <span>Brand Operation</span>
            <span>SOP System</span>
            <a href="#project-miniapp">
              Next
              <ArrowUpRight size={16} />
            </a>
          </header>
          <div className="project-unique-copy">
            <p>{sopProject.summary}</p>
            <p>围绕素材生产、团队协作、页面美化和执行验收，建立可复制的电商视觉升级工作流。</p>
          </div>
          <div className="project-orbit-cta">
            <span>Explore</span>
            <strong>SOP</strong>
            <ArrowUpRight size={18} />
          </div>
          <VariableTitle label="WALULU SOP" as="h2" className="project-display-title" radius={220} />
          <div className="project-unique-gallery" aria-label={`${sopProject.title} 项目视觉`}>
            {waluluGalleryCards.slice(0, 2).map((card, index) => (
              <button
                className={`project-gallery-card ${expandedGalleryIndex === index ? "is-active" : ""}`}
                key={card.id}
                onClick={() => setExpandedGalleryIndex(expandedGalleryIndex === index ? null : index)}
                type="button"
              >
                <img src={assetUrl(card.image)} alt={card.title} />
              </button>
            ))}
            <a className="project-round-link" href="#project-miniapp">
              查看下个项目
              <ArrowUpRight size={34} />
            </a>
            {waluluGalleryCards.slice(2).map((card, index) => {
              const cardIndex = index + 2;
              return (
                <button
                  className={`project-gallery-card ${expandedGalleryIndex === cardIndex ? "is-active" : ""}`}
                  key={card.id}
                  onClick={() => setExpandedGalleryIndex(expandedGalleryIndex === cardIndex ? null : cardIndex)}
                  type="button"
                >
                <img src={assetUrl(card.image)} alt={card.title} />
                </button>
              );
            })}
          </div>

          <div className={`gallery-expander ${expandedGalleryCard ? "is-open" : ""}`} aria-hidden={!expandedGalleryCard}>
            {expandedGalleryCard && (
              <>
                <div className="gallery-expander-copy">
                  <p className="eyebrow">{expandedGalleryCard.eyebrow}</p>
                  <VariableTitle label={expandedGalleryCard.title} as="h2" radius={180} />
                  <p>{expandedGalleryCard.description}</p>
                  <div className="gallery-extension-actions">
                    <button onClick={() => setExpandedGalleryIndex(null)} type="button">
                      收回
                    </button>
                    <button
                      onClick={() => setExpandedGalleryIndex((expandedGalleryIndex + 1) % waluluGalleryCards.length)}
                      type="button"
                    >
                      NEXT
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="gallery-masonry-stage">
                  <Masonry
                    items={buildMasonryItems(expandedGalleryIndex)}
                    animateFrom={expandedGalleryIndex % 2 === 0 ? "bottom" : "right"}
                    blurToFocus
                    colorShiftOnHover
                    duration={0.7}
                    hoverScale={0.96}
                    stagger={0.055}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className={`project-page project-page-crowd section-screen ${expandedMiniCard ? "has-mini-expander" : ""}`} id="project-miniapp">
        <div className={`project-shell project-crowd-shell ${expandedMiniCard ? "has-mini-expander" : ""}`}>
          {miniProgramCards.map((card, index) => (
            <button
              aria-expanded={expandedMiniIndex === index}
              className={`crowd-card ${card.className} ${expandedMiniIndex === index ? "is-active" : ""}`}
              key={card.id}
              onClick={() => setExpandedMiniIndex(expandedMiniIndex === index ? null : index)}
              type="button"
            >
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <img src={assetUrl(card.images[0])} alt={`${card.title} 预览`} />
            </button>
          ))}
          <div className="crowd-center">
            <p className="eyebrow">Mini Program / Interaction</p>
            <VariableTitle label="Walulu 小程序 UI 玩法升级" as="h2" radius={190} />
            <p>{miniappProject.summary}</p>
            <div className="project-chip-row">
              <a href="#projects">SOP</a>
              <a href="#project-brand">Brand</a>
            </div>
          </div>
          <div className={`mini-expander ${expandedMiniCard ? "is-open" : ""}`} aria-hidden={!expandedMiniCard}>
            {expandedMiniCard && (
              <>
                <div className="mini-expander-copy">
                  <p className="eyebrow">{expandedMiniCard.eyebrow}</p>
                  <VariableTitle label={expandedMiniCard.title} as="h2" radius={170} />
                  <p>{expandedMiniCard.description}</p>
                  <div className="gallery-extension-actions">
                    <button onClick={() => setExpandedMiniIndex(null)} type="button">
                      收回
                    </button>
                    <button onClick={() => setExpandedMiniIndex((expandedMiniIndex + 1) % miniProgramCards.length)} type="button">
                      NEXT
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="mini-masonry-stage">
                  <Masonry
                    items={buildMiniMasonryItems(expandedMiniIndex)}
                    animateFrom={expandedMiniIndex % 2 === 0 ? "bottom" : "right"}
                    blurToFocus
                    colorShiftOnHover
                    duration={0.7}
                    hoverScale={0.96}
                    stagger={0.035}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className={`project-page project-page-posts section-screen ${expandedBrandCard ? "has-brand-expander" : ""}`} id="project-brand">
        <div className={`project-shell project-posts-shell ${expandedBrandCard ? "has-brand-expander" : ""}`}>
          <div className="project-posts-heading">
            <p className="eyebrow">Brand Strategy / AI Asset</p>
            <VariableTitle label="AI 赋能 Walulu 品牌搭建" as="h2" radius={190} />
            <p>{brandProject.summary}</p>
          </div>
          <div className="project-posts-carousel" aria-label={`${brandProject.title} 项目视觉`}>
            {brandSystemCards.map((card, index) => (
              <button
                aria-expanded={expandedBrandIndex === index}
                className={`post-card ${card.className} ${expandedBrandIndex === index ? "is-active" : ""}`}
                key={card.id}
                onClick={() => setExpandedBrandIndex(expandedBrandIndex === index ? null : index)}
                type="button"
              >
                {card.image.endsWith(".mp4") ? (
                  <video autoPlay loop muted playsInline src={assetUrl(card.image)} />
                ) : (
                  <img src={assetUrl(card.image)} alt={`${card.title} 预览`} />
                )}
                <span>{card.title}</span>
              </button>
            ))}
          </div>
          <div className={`brand-expander ${expandedBrandCard ? "is-open" : ""}`} aria-hidden={!expandedBrandCard}>
            {expandedBrandCard && (
              <>
                <div className="brand-expander-copy">
                  <p className="eyebrow">{expandedBrandCard.eyebrow}</p>
                  <VariableTitle label={expandedBrandCard.title} as="h2" radius={170} />
                  <p>{expandedBrandCard.description}</p>
                  <div className="gallery-extension-actions">
                    <button onClick={() => setExpandedBrandIndex(null)} type="button">
                      收回
                    </button>
                    <button onClick={() => setExpandedBrandIndex((expandedBrandIndex + 1) % brandSystemCards.length)} type="button">
                      NEXT
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="brand-masonry-stage">
                  <Masonry
                    items={buildBrandMasonryItems(expandedBrandIndex)}
                    animateFrom={expandedBrandIndex % 2 === 0 ? "bottom" : "right"}
                    blurToFocus
                    colorShiftOnHover
                    duration={0.7}
                    hoverScale={0.96}
                    stagger={0.035}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Strengths() {
  return (
    <section className="strengths section-block" id="strengths">
      <div className="page-shell">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <VariableTitle label="个人优势" as="h2" radius={170} />
        </div>
        <div className="strength-grid">
          {strengths.map(({ icon: Icon, title, text }) => (
            <article className="strength-card" key={title}>
              <div className="icon-box">
                <Icon size={24} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact section-screen" id="contact">
      <div className="page-shell contact-inner">
        <p className="eyebrow">Contact</p>
        <VariableTitle
          label="期待把复杂问题，变成清晰、可执行、能被体验到的产品与品牌结果。"
          as="h2"
          radius={210}
        />
        <div className="contact-actions">
          <a className="primary-link" href={`mailto:${contactEmail}`}>
            <Mail size={19} />
            {contactEmail}
          </a>
          <span>
            <BadgeCheck size={18} />
            成都 / 远程协作
          </span>
          <a className="back-top-link" href="#top" aria-label="回到首页">
            <ArrowUp size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Hero />
      <main className="site-content">
        <Waves
          className="content-waves"
          lineColor="rgba(184, 255, 8, 0.16)"
          backgroundColor="transparent"
          waveSpeedX={0.01}
          waveSpeedY={0.006}
          waveAmpX={34}
          waveAmpY={18}
          friction={0.92}
          tension={0.006}
          maxCursorMove={90}
          xGap={14}
          yGap={40}
        />
        <Experience />
        <Projects />
        <Strengths />
        <Contact />
      </main>
    </>
  );
}
