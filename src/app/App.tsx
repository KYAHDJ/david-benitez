import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Download, Linkedin, Lock, Menu, Play, X } from "lucide-react";

type ProjectAction =
  | { kind: "play"; href: string }
  | { kind: "beta"; label: string; href: string }
  | { kind: "download"; label: string; href: string }
  | { kind: "link"; label: string; href: string }
  | { kind: "soon"; label: string };

type ProjectIcon = { type: "img"; src: string } | { type: "svg"; node: React.ReactNode };

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  desc: string;
  tags: string[];
  bullets: string[];
  icon?: ProjectIcon;
  screenshots: string[];
  youtubeEmbed?: string;
  accent: string;
  action: ProjectAction;
  notice?: string;
};

function useInView(threshold = 0.12, once = true) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduce;
}

function ScrollProgress() {
  const y = useScrollY();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    setProgress(Math.min(1, Math.max(0, y / height)));
  }, [y]);
  return <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />;
}

const SEQUENCE = [
  { text: "LEARN.", pause: 560 },
  { text: "ADAPT.", pause: 560 },
  { text: "BUILD.", pause: 680 },
  { text: "Every project\nstarted with\n“What if...”", pause: 99999 },
];

function useTypewriter() {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(SEQUENCE[SEQUENCE.length - 1].text);
      setDone(true);
      return;
    }
    let timeout: ReturnType<typeof setTimeout>;

    function eraseThenType(prev: string, next: string, onDone: () => void) {
      let eraseIndex = prev.length;
      const erase = () => {
        if (eraseIndex <= 0) return type(0);
        eraseIndex -= 1;
        setDisplay(prev.slice(0, eraseIndex));
        timeout = setTimeout(erase, 20);
      };
      const type = (idx: number) => {
        if (idx >= next.length) return onDone();
        setDisplay(next.slice(0, idx + 1));
        timeout = setTimeout(() => type(idx + 1), next.includes("What if") ? 34 : 48);
      };
      erase();
    }

    function run(index: number, prev = "") {
      const item = SEQUENCE[index];
      eraseThenType(prev, item.text, () => {
        if (index === SEQUENCE.length - 1) {
          timeout = setTimeout(() => setDone(true), 550);
          return;
        }
        timeout = setTimeout(() => run(index + 1, item.text), item.pause);
      });
    }

    timeout = setTimeout(() => run(0), 350);
    return () => clearTimeout(timeout);
  }, [reduceMotion]);

  return { display, done, skip: () => { setDisplay(SEQUENCE[SEQUENCE.length - 1].text); setDone(true); } };
}

function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: keyof JSX.IntrinsicElements }) {
  const { ref, inView } = useInView(0.1);
  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(28px)",
        transition: `opacity .85s cubic-bezier(.22,1,.36,1) ${delay}s, transform .85s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </Tag>
  );
}

function Nav({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Work", "#work"],
    ["Beyond Code", "#beyond"],
    ["Journey", "#journey"],
    ["Contact", "#contact"],
  ];
  return (
    <nav className={`nav ${show ? "visible" : ""} ${open ? "open" : ""}`}>
      <a href="#top" className="brand" onClick={() => setOpen(false)}>Hi, I&apos;m David.</a>
      <div className="nav-links">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </div>
      <a className="nav-cta" href="#contact">Say hello</a>
      <button className="nav-menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
      <div className="mobile-panel">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </div>
    </nav>
  );
}

function Hero({ onPast }: { onPast: (v: boolean) => void }) {
  const { display, done, skip } = useTypewriter();
  const ref = useRef<HTMLElement>(null);
  const y = useScrollY();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    if (!done) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.touchAction = "none";
    } else {
      const top = body.style.top;
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.touchAction = "";
      if (top) window.scrollTo(0, Math.abs(parseInt(top, 10)) || 0);
    }

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.touchAction = "";
    };
  }, [done]);

  useEffect(() => {
    const el = ref.current;
    if (el) onPast(y > el.clientHeight * 0.58);
  }, [y, onPast]);

  return (
    <section id="top" ref={ref} className="hero">
      <div className="grain" />
      <div className="hero-inner">
        <p className={`hero-name ${done ? "show" : ""}`}>DAVID JERANO GARCIA BENITEZ</p>
        <h1>{display}<span className={`cursor ${done ? "hide" : ""}`} /></h1>
        <p className={`hero-kicker ${done ? "show" : ""}`}>Scroll to discover how curiosity became creation.</p>
        <p className={`hero-subtitle ${done ? "show" : ""}`}>Software Developer · Digital Creator · Always learning</p>
        <div className={`hero-actions ${done ? "show" : ""}`}>
          <a href="#work">Explore Work <ArrowDown size={16} /></a>
          <a href="#contact">Contact Options</a>
        </div>
      </div>
      <button className={`intro-skip ${done ? "hide" : ""}`} onClick={skip}>Skip intro</button>
      <div className={`scroll-cue ${done ? "show" : ""}`}>Scroll<div /></div>
    </section>
  );
}

const TECH_WORDS = ["ANDROID", "WEB", "UNITY", "BLENDER", "FIREBASE", "VIDEO", "2D", "3D", "AR", "VR"];

function WhyIBuild() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((v) => (v + 1) % TECH_WORDS.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section about-section">
      <div>
        <Reveal><p className="eyebrow">Why I Build</p></Reveal>
        <Reveal delay={0.1}><h2>I like learning by building real things.</h2></Reveal>
        <Reveal delay={0.2}>
          <p className="lead">
            I enjoy turning ideas into something real. Whether it is an Android application, a Unity game, an animation, or a creative experiment, every project begins with curiosity.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="lead philosophy">
            Curiosity starts the journey. Learning shapes it. Building proves it.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="about-buttons">
            <a href="/assets/profile/david-benitez.jpg" target="_blank" rel="noreferrer">View Photo</a>
            <a href="#contact">Contact Me</a>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.15}>
        <div className="portrait-card">
          <img src="/assets/profile/david-benitez.jpg" alt="David Jerano Garcia Benitez" loading="lazy" decoding="async" />
          <div className="portrait-meta">
            <strong>David Jerano Garcia Benitez</strong>
            <span>Software Developer · Digital Creator</span>
          </div>
        </div>
        <div className="word-stack">
          {TECH_WORDS.map((word, i) => (
            <button key={word} onMouseEnter={() => setActive(i)} className={active === i ? "active" : ""}>{word}</button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function PolyMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M24 5l17 10v18L24 43 7 33V15z" />
      <path d="M24 5v19M7 15l17 9M41 15l-17 9M24 43V24" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 100 100" width="20" height="20">
      <path d="M18 8 L18 92 L50 50 Z" fill="#00c8ff" />
      <path d="M18 8 L68 33 L50 50 Z" fill="#00e676" />
      <path d="M18 92 L68 67 L50 50 Z" fill="#ff3b5c" />
      <path d="M68 33 L86 43 A6 6 0 0 1 86 57 L68 67 L50 50 Z" fill="#ffcc00" />
    </svg>
  );
}

const PROJECTS: Project[] = [
  {
    id: "01",
    name: "DoPalette",
    type: "Android · Coloring app",
    status: "Live on Google Play",
    desc: "A coloring app built around creativity: brush and bucket-fill tools, offline artwork saving, image export, and Firebase-backed accounts with community sharing.",
    tags: ["Kotlin", "Firebase Auth", "Firestore", "Android SDK", "AdMob"],
    bullets: [
      "Designed and developed an Android coloring application with brush tools, bucket fill, offline artwork saving, and image export.",
      "Integrated Firebase Authentication, user profiles, achievements, and a community artwork-sharing system.",
      "Focused on responsive UI, usability, performance, and a smooth coloring experience across phones and tablets.",
      "Published and live on Google Play after closed and open testing phases.",
    ],
    icon: { type: "img", src: "/assets/projects/dopalette/icon.png" },
    screenshots: [
      "/assets/projects/dopalette/screenshot-1.png",
      "/assets/projects/dopalette/screenshot-2.png",
      "/assets/projects/dopalette/screenshot-3.png",
      "/assets/projects/dopalette/screenshot-4.png",
      "/assets/projects/dopalette/screenshot-5.png",
    ],
    accent: "#8B5CF6",
    action: { kind: "play", href: "https://play.google.com/store/apps/details?id=com.dopalette.app" },
  },
  {
    id: "02",
    name: "Money Marathon",
    type: "Android · Group savings tracker",
    status: "Live on Google Play",
    desc: "A savings race for you and your friends: everyone gets a lane and the same finish line. Built with Preact and htm on top of Cloud Firestore, so every open device gets live updates as racers save toward a shared goal.",
    tags: ["Preact", "htm", "Firebase", "Firestore", "Capacitor", "AdMob"],
    bullets: [
      "Host a 'race' toward a shared goal, like a trip, and share a join code so friends can add themselves as racers.",
      "Each racer sets their own savings goal, cadence, and bank or wallet, tracked in real time as an actual race track with a customizable running character.",
      "Savings calendar, per-racer dashboards, and one-tap PDF export of a racer's savings summary.",
      "Local notifications for savings reminders, AdMob-supported free tier, and Firestore offline persistence so progress still loads without a connection.",
    ],
    icon: { type: "img", src: "/assets/projects/moneymarathon/icon.png" },
    screenshots: [
      "/assets/projects/moneymarathon/screenshot-1.png",
      "/assets/projects/moneymarathon/screenshot-2.png",
      "/assets/projects/moneymarathon/screenshot-3.png",
      "/assets/projects/moneymarathon/screenshot-4.png",
      "/assets/projects/moneymarathon/screenshot-5.png",
    ],
    accent: "#2E7D5B",
    action: { kind: "play", href: "https://play.google.com/store/apps/details?id=com.moneymarathon.app" },
  },
  {
    id: "03",
    name: "Dosevia",
    type: "Android · Medication reminders",
    status: "Open Beta Testing",
    desc: "A reminder app focused on clear scheduling, persistent local data, and simple daily medication tracking so nothing gets missed.",
    tags: ["React", "TypeScript", "Capacitor", "Local Notifications"],
    bullets: [
      "Built a medication reminder application with customizable schedules and notification settings.",
      "Implemented persistent local storage and reminder management for offline functionality.",
      "Designed a clean, accessible, and user-friendly interface optimized for Android devices.",
      "Currently open to public beta testers ahead of a full Play Store release.",
    ],
    icon: { type: "img", src: "/assets/projects/dosevia/icon.png" },
    screenshots: [
      "/assets/projects/dosevia/screenshot-1.jpg",
      "/assets/projects/dosevia/screenshot-2.jpg",
      "/assets/projects/dosevia/screenshot-3.jpg",
      "/assets/projects/dosevia/screenshot-4.jpg",
    ],
    accent: "#EC4899",
    action: { kind: "beta", label: "Join the open beta", href: "https://play.google.com/apps/testing/com.dosevia.app" },
  },
  {
    id: "04",
    name: "Sama Na U Wedding",
    type: "Website",
    status: "Sample Website",
    desc: "A responsive wedding website built to present event details, countdown, venues, gallery, and RSVP information in a clean and elegant layout.",
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    bullets: [
      "Built a clean wedding website with sections for the countdown, save the date, venues, gallery, and RSVP.",
      "Designed the layout to work across desktop and mobile devices with simple navigation and organized event information.",
      "Included an RSVP form area that can be connected directly to Google Forms so guests can submit without opening a separate Google Form page.",
    ],
    screenshots: [
      "/assets/projects/samanau/hero.png",
      "/assets/projects/samanau/countdown.png",
      "/assets/projects/samanau/gallery.png",
      "/assets/projects/samanau/rsvp.png",
    ],
    accent: "#D4AF37",
    action: { kind: "link", label: "View live site", href: "https://kyahdj.github.io/SamaNaUWedding/" },
  },
  {
    id: "05",
    name: "PolyPath",
    type: "PC · Educational 3D game",
    status: "School Capstone Project",
    desc: "An educational PC game created as a capstone project to teach beginners 3D modeling fundamentals through progression-based learning.",
    tags: ["Unity", "C#", "Blender"],
    bullets: [
      "Developed an educational 3D game that teaches beginners the fundamentals of 3D modeling.",
      "Designed progression-based learning mechanics to improve engagement and retention.",
      "Created 3D assets, environments, lighting, and animations using Blender and Unity.",
    ],
    icon: { type: "svg", node: <PolyMark /> },
    screenshots: [],
    youtubeEmbed: "https://www.youtube.com/embed/DXXD1eb3ZZY",
    accent: "#F97316",
    action: { kind: "download", label: "Download for Windows", href: "https://github.com/KYAHDJ/david-benitez/releases/download/v1.0/PolyPath.zip" },
  },
  {
    id: "06",
    name: "DryNav",
    type: "Android · Flood-aware navigation",
    status: "In Development",
    desc: "A Waze-style navigation app that routes drivers around flooded roads in real time, built with Jetpack Compose, the Mapbox Navigation SDK, and Firebase. Started as a favor for my sister's school project, still actively in progress.",
    tags: ["Kotlin", "Jetpack Compose", "Mapbox Nav SDK", "Firebase"],
    bullets: [
      "Turn-by-turn directions that automatically avoid roads marked flooded or blocked, with silent rerouting and no interrupting popups.",
      "Live traffic, satellite, and terrain map layers alongside the flood-aware routing.",
      "Community flood reporting: tap-to-pin or brush-draw the affected stretch, mark it slow or blocked, attach a photo and description.",
      "Admin moderation queue for reports, filterable by city and barangay, with reports auto-expiring after 6 hours.",
      "Live map presence with selectable mood-character markers that switch to a directional arrow once you start driving.",
      "Saved Places for one-tap navigation, plus email and Google sign-in with in-app password change and account deletion.",
    ],
    icon: { type: "img", src: "/assets/projects/drynav/icon.png" },
    screenshots: [
      "/assets/projects/drynav/screenshot-1.jpg",
      "/assets/projects/drynav/screenshot-2.png",
      "/assets/projects/drynav/screenshot-3.png",
      "/assets/projects/drynav/screenshot-4.jpg",
    ],
    accent: "#14B8A6",
    action: { kind: "download", label: "Download APK", href: "https://media.githubusercontent.com/media/KYAHDJ/david-benitez/main/public/downloads/DryNav.apk" },
  },
  {
    id: "07",
    name: "DoLumin",
    type: "Website · Shopify store",
    status: "Live Demo Store",
    desc: "A fictional clean-beauty skincare brand built as a fully working Shopify storefront: a custom home page, real product pages with cart and checkout, and a filterable, sortable collection page. The brand and products are not real, this is a portfolio sample.",
    tags: ["Shopify", "Liquid", "JavaScript", "CSS", "E-commerce"],
    bullets: [
      "Built a custom Shopify theme from scratch: hero, bestsellers grid, brand philosophy section, ingredient spotlight, and a rotating customer-testimonials carousel.",
      "Fully functional product pages with quantity selection, add-to-cart, and Shopify's native checkout flow.",
      "Collection page wired to Shopify's storefront filtering and sorting, by availability, price, and alphabetical order.",
      "Password-protected as a development store since it's a design sample and not a real, operating business.",
    ],
    icon: undefined,
    screenshots: [
      "/assets/projects/dolumin/screenshot-1.png",
      "/assets/projects/dolumin/screenshot-2.png",
    ],
    accent: "#8FA37E",
    action: { kind: "link", label: "View live site", href: "https://dolumin.myshopify.com/" },
    notice: "Password: DoLuminShopifySamplePageByKyaiko",
  },
];

type WorkCategory = { id: string; label: string; accent: string; projectIds: string[] };

const WORK_CATEGORIES: WorkCategory[] = [
  { id: "apps", label: "Apps", accent: "#8B5CF6", projectIds: ["01", "02", "03", "06"] },
  { id: "websites", label: "Websites", accent: "#D4AF37", projectIds: ["04", "07"] },
  { id: "games", label: "Games", accent: "#F97316", projectIds: ["05"] },
];

function categoryImages(projectIds: string[]): string[] {
  const images: string[] = [];
  projectIds.forEach((id) => {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) return;
    if (project.screenshots.length) images.push(...project.screenshots);
    else if (project.youtubeEmbed) images.push(youtubeThumb(project.youtubeEmbed));
    else if (project.icon?.type === "img") images.push(project.icon.src);
  });
  return images;
}

function ActionButton({ project }: { project: Project }) {
  const a = project.action;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  if (a.kind === "play") {
    return (
      <a className="play-badge" href={a.href} target="_blank" rel="noreferrer" onClick={stop}>
        <PlayMark />
        <span className="txt"><span className="g">Get it on</span><span className="n">Google Play</span></span>
      </a>
    );
  }
  if (a.kind === "beta") {
    return (
      <a className="beta-badge" href={a.href} target="_blank" rel="noreferrer" onClick={stop}>
        <Play size={16} /><span>{a.label}</span>
      </a>
    );
  }
  if (a.kind === "download") {
    return (
      <a className="btn solid" href={a.href} download onClick={stop}>
        <Download size={13} />{a.label}
      </a>
    );
  }
  if (a.kind === "soon") {
    return <span className="btn soon" onClick={stop}>{a.label}</span>;
  }
  return (
    <a className="btn" href={a.href} target="_blank" rel="noreferrer" onClick={stop}>
      <ArrowUpRight size={13} />{a.label}
    </a>
  );
}

function ProjectIconTile({ project }: { project: Project }) {
  if (!project.icon) return null;
  return (
    <div className="card-icon" style={{ color: project.accent }}>
      {project.icon.type === "img"
        ? <img src={project.icon.src} alt={`${project.name} icon`} loading="lazy" decoding="async" />
        : project.icon.node}
    </div>
  );
}

function Slideshow({ project, variant }: { project: Project; variant: "card" | "modal" }) {
  const shots = project.screenshots;
  const hasShots = shots.length > 0;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!hasShots || shots.length < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % shots.length), 3200);
    return () => clearInterval(t);
  }, [hasShots, shots.length, paused]);

  const go = (n: number) => setI(((n % shots.length) + shots.length) % shots.length);

  return (
    <div
      className="slideshow"
      style={{ ["--accent" as any]: project.accent }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(e) => { touchX.current = e.clientX; setPaused(true); }}
      onPointerUp={(e) => {
        if (touchX.current === null) return;
        const dx = e.clientX - touchX.current;
        if (hasShots && Math.abs(dx) > 30) go(i + (dx < 0 ? 1 : -1));
        touchX.current = null;
        setPaused(false);
      }}
    >
      <span className="idx-pill">{project.id}</span>
      <span className="status-pill"><span className="dot" />{project.status}</span>
      {hasShots ? (
        shots.map((src, idx) => (
          <div key={src} className={`slide ${idx === i ? "active" : ""}`}>
            <img src={src} alt={`${project.name} screenshot ${idx + 1}`} loading={variant === "card" && idx === 0 ? "eager" : "lazy"} decoding="async" />
          </div>
        ))
      ) : project.youtubeEmbed ? (
        <div className="slide active video-preview">
          <img src={youtubeThumb(project.youtubeEmbed)} alt={`${project.name} gameplay preview`} loading="lazy" decoding="async" />
          <span className="play-overlay"><Play size={18} fill="#fff" /></span>
        </div>
      ) : (
        <div className="slide placeholder active">
          <ImgIcon />
          <span>Screens coming soon</span>
        </div>
      )}
      {hasShots && shots.length > 1 && (
        <>
          <button className="nav-arrow prev" onClick={(e) => { e.stopPropagation(); go(i - 1); }} aria-label="Previous screenshot"><ChevronLeft size={13} /></button>
          <button className="nav-arrow next" onClick={(e) => { e.stopPropagation(); go(i + 1); }} aria-label="Next screenshot"><ChevronRight size={13} /></button>
          <div className="dots">
            {shots.map((_, idx) => (
              <button key={idx} className={idx === i ? "active" : ""} onClick={(e) => { e.stopPropagation(); go(idx); }} aria-label={`Screenshot ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function youtubeThumb(embedUrl: string) {
  const id = embedUrl.split("/embed/")[1]?.split("?")[0];
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function ImgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width="30%" height="30%">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.4" />
      <path d="M21 16l-5.5-5.5L9 17" />
    </svg>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="card" style={{ ["--accent" as any]: project.accent }} onClick={onOpen}>
      <Slideshow project={project} variant="card" />
      <div className="card-body">
        <div className="card-head">
          <ProjectIconTile project={project} />
          <div><h3>{project.name}</h3><p className="card-type">{project.type}</p></div>
        </div>
        <p className="card-desc">{project.desc}</p>
        <div className="chips">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {project.notice && <p className="store-notice"><Lock size={12} />{project.notice}</p>}
        <div className="card-foot">
          <ActionButton project={project} />
          <button className="details-link" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Full details <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${project.name} details`} style={{ ["--accent" as any]: project.accent }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={14} /></button>
        {project.youtubeEmbed ? (
          <div className="video-frame modal-video">
            <iframe
              src={project.youtubeEmbed}
              title={`${project.name} promotional video`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <Slideshow project={project} variant="modal" />
        )}
        <div className="modal-body">
          <div className="card-head">
            <ProjectIconTile project={project} />
            <div><h3>{project.name}</h3><p className="card-type" style={{ color: project.accent }}>{project.type}</p></div>
          </div>
          <p className="card-desc">{project.desc}</p>
          <div className="chips">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <ul className="bullets">{project.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          {project.notice && <p className="store-notice"><Lock size={13} />{project.notice}</p>}
          <div className="modal-bottom">
            <div className="actions">
              <ActionButton project={project} />
              <a className="btn" href="#contact" onClick={onClose}>Ask about this</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBg({ images }: { images: string[] }) {
  const shuffled = useMemo(() => {
    const arr = [...images];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [images]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (shuffled.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % shuffled.length), 1000);
    return () => clearInterval(t);
  }, [shuffled.length]);

  return (
    <span className="cat-bg">
      {shuffled.map((src, idx) => (
        <img key={src} src={src} className={idx === i ? "active" : ""} alt="" loading="lazy" decoding="async" />
      ))}
    </span>
  );
}

function CategoryButton({ cat, count, state, onClick }: { cat: WorkCategory; count: number; state: string; onClick: () => void }) {
  return (
    <button className={`category-btn ${state}`} style={{ ["--cat-accent" as any]: cat.accent }} onClick={onClick}>
      <CategoryBg images={categoryImages(cat.projectIds)} />
      <span className="cat-overlay" />
      <span className="cat-label">
        {cat.label}
        <small>{count} project{count === 1 ? "" : "s"}</small>
      </span>
    </button>
  );
}

function SelectedWork() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [phase, setPhase] = useState<"categories" | "toDetail" | "detail" | "toCategories">("categories");
  const [openId, setOpenId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const compute = () => setCols(getComputedStyle(el).gridTemplateColumns.split(" ").length);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [phase]);

  const category = WORK_CATEGORIES.find((c) => c.id === activeCat) || null;
  const filtered = category ? PROJECTS.filter((p) => category.projectIds.includes(p.id)) : [];
  const remainder = filtered.length ? filtered.length % cols : 0;
  const splitAt = remainder === 0 ? filtered.length : filtered.length - remainder;
  const mainItems = filtered.slice(0, splitAt);
  const leftoverItems = filtered.slice(splitAt);

  const openProject = PROJECTS.find((p) => p.id === openId) || null;
  const activeIdx = WORK_CATEGORIES.findIndex((c) => c.id === activeCat);

  function selectCategory(id: string) {
    setActiveCat(id);
    setPhase("toDetail");
    setTimeout(() => setPhase("detail"), 480);
  }
  function goBack() {
    setPhase("toCategories");
    setTimeout(() => {
      setPhase("categories");
      setActiveCat(null);
    }, 380);
  }

  return (
    <section id="work" className="work">
      <div className="section-head">
        <Reveal>
          <p className="eyebrow">Selected Work</p>
          <h2>Things I've built.</h2>
          <p>Seven projects, organized into apps, websites, and games. Pick a lane to explore.</p>
        </Reveal>
      </div>

      {phase !== "detail" && (
        <Reveal delay={0.1}>
          <div className={`category-grid ${phase === "toDetail" ? "leaving" : ""}`}>
            {WORK_CATEGORIES.map((cat, i) => {
              let state = "";
              if (phase === "toDetail") state = cat.id === activeCat ? "zoom" : i < activeIdx ? "out-left" : "out-right";
              return (
                <CategoryButton
                  key={cat.id}
                  cat={cat}
                  count={cat.projectIds.length}
                  state={state}
                  onClick={() => selectCategory(cat.id)}
                />
              );
            })}
          </div>
        </Reveal>
      )}

      {(phase === "detail" || phase === "toCategories") && category && (
        <div className={`category-detail ${phase === "toCategories" ? "leaving" : ""}`} style={{ ["--cat-accent" as any]: category.accent }}>
          <div className="category-detail-head">
            <button className="btn back-btn" onClick={goBack}><ArrowLeft size={14} /> Back to categories</button>
          </div>
          <div className="project-grid" ref={gridRef}>
            {mainItems.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => setOpenId(project.id)} />
            ))}
            {leftoverItems.length > 0 && (
              <div className="orphan-row">
                {leftoverItems.map((project) => (
                  <ProjectCard key={project.id} project={project} onOpen={() => setOpenId(project.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openProject && <ProjectModal project={openProject} onClose={() => setOpenId(null)} />}
    </section>
  );
}

const BEYOND_VIDEOS = [
  { category: "Video Editing", title: "Video Editing Project 1", embed: "https://www.youtube.com/embed/al6Dwgq2A7k", watch: "https://youtu.be/al6Dwgq2A7k" },
  { category: "Video Editing", title: "Video Editing Project 2", embed: "https://www.youtube.com/embed/_RVOVZFKeV0", watch: "https://youtu.be/_RVOVZFKeV0" },
  { category: "Video Editing", title: "Video Editing Project 3", embed: "https://www.youtube.com/embed/_WY26Z90cTQ", watch: "https://youtu.be/_WY26Z90cTQ" },
  { category: "Video Editing", title: "Video Editing Project 4", embed: "https://www.youtube.com/embed/XL_pVYNgd50", watch: "https://youtu.be/XL_pVYNgd50" },

  { category: "3D Animation", title: "3D Animation Project 1", embed: "https://www.youtube.com/embed/8YstbmN69Lw", watch: "https://youtu.be/8YstbmN69Lw" },
  { category: "3D Animation", title: "3D Animation Project 2", embed: "https://www.youtube.com/embed/CWZBVh-xtdE", watch: "https://youtu.be/CWZBVh-xtdE" },
  { category: "3D Animation", title: "3D Animation Project 3", embed: "https://www.youtube.com/embed/bqiD69hS8ME", watch: "https://youtu.be/bqiD69hS8ME" },
  { category: "3D Animation", title: "3D Animation Project 4", embed: "https://www.youtube.com/embed/SRur2MFhFIY", watch: "https://youtu.be/SRur2MFhFIY" },

  { category: "3D + 2D Animation", title: "Mixed 3D and 2D Animation", embed: "https://www.youtube.com/embed/rSWZgsfVhKo", watch: "https://youtu.be/rSWZgsfVhKo" },

  { category: "2D Animation", title: "2D Animation Project", embed: "https://www.youtube.com/embed/J1V3cVBeyXc", watch: "https://youtu.be/J1V3cVBeyXc" },

  { category: "AR", title: "AR Project 1", embed: "https://www.youtube.com/embed/sgi3tY9rKx0", watch: "https://youtu.be/sgi3tY9rKx0" },
  { category: "AR", title: "AR Project 2", embed: "https://www.youtube.com/embed/bR-KwS22mm0", watch: "https://youtu.be/bR-KwS22mm0" },
  { category: "AR", title: "AR Project 3", embed: "https://www.youtube.com/embed/Ac4BvK4X1Wo", watch: "https://youtu.be/Ac4BvK4X1Wo" },
  { category: "AR", title: "AR Project 4", embed: "https://www.youtube.com/embed/Q6cBZ9R19BE", watch: "https://youtu.be/Q6cBZ9R19BE" },

  { category: "VR", title: "VR Project 1", embed: "https://www.youtube.com/embed/fzq6x5G9H7U", watch: "https://youtu.be/fzq6x5G9H7U" },
  { category: "VR", title: "VR Project 2", embed: "https://www.youtube.com/embed/7g8_FhQXvXY", watch: "https://youtu.be/7g8_FhQXvXY" },

  { category: "Arduino", title: "Arduino Vehicle Camera Project", embed: "https://www.youtube.com/embed/apXg_BemLjg", watch: "https://youtu.be/apXg_BemLjg" },
];

const BEYOND_CATEGORIES = ["All", "Video Editing", "2D Animation", "3D Animation", "3D + 2D Animation", "AR", "VR", "Arduino"];

function BeyondVideoCard({ video, delay }: { video: typeof BEYOND_VIDEOS[0]; delay: number }) {
  const { ref, inView } = useInView(0.08);
  return (
    <article ref={ref as any} className={`beyond-video-card ${inView ? "show" : ""}`} style={{ transitionDelay: `${delay}s` }}>
      <div className="youtube-frame">
        <iframe
          src={video.embed}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="beyond-video-meta">
        <span>{video.category}</span>
        <h3>{video.title}</h3>
        <a href={video.watch} target="_blank" rel="noreferrer">Watch on YouTube <ArrowUpRight size={14} /></a>
      </div>
    </article>
  );
}

function BeyondCode() {
  const [category, setCategory] = useState("All");
  const filteredVideos = category === "All" ? BEYOND_VIDEOS : BEYOND_VIDEOS.filter((video) => video.category === category);

  return (
    <section id="beyond" className="section beyond-section">
      <div className="section-head compact">
        <Reveal>
          <p className="eyebrow">Beyond Code</p>
          <h2>Software is only one way I express creativity.</h2>
          <p>A collection of personal and school projects in video editing, 2D animation, 3D animation, AR, VR, Arduino, and creative experiments. This portfolio does not include everything I have created, because some older projects were experimental, stored on old devices, lost, or no longer easy to find. These are embedded from YouTube so the website stays fast and easy to deploy.</p>
        </Reveal>
      </div>
      <div className="beyond-filters" aria-label="Beyond Code video categories">
        {BEYOND_CATEGORIES.map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="beyond-grid video-gallery">
        {filteredVideos.map((video, i) => <BeyondVideoCard key={`${video.category}-${video.embed}`} video={video} delay={(i % 3) * 0.04} />)}
      </div>
    </section>
  );
}

const CATEGORIES = [
  ["Applications", "Android apps and web applications built around practical problems and clean user experience.", ["Kotlin", "React", "TypeScript", "Firebase", "Capacitor"]],
  ["Games", "Unity projects, game systems, progression-based learning, and interactive 3D environments.", ["Unity", "C#", "Game Design", "Level Systems"]],
  ["Animation", "2D/3D animation, video editing, motion graphics, and visual storytelling.", ["Blender", "Editing", "Motion", "2D", "3D"]],
  ["Creative Technology", "AR, VR, Arduino, and experiments that help me learn new tools by building.", ["AR", "VR", "Arduino", "New Tools"]],
];

function LoveBuilding() {
  return (
    <section className="section capabilities">
      <div className="section-head compact"><Reveal><p className="eyebrow">Capabilities</p><h2>Things I love building.</h2></Reveal></div>
      <div className="cap-grid">
        {CATEGORIES.map(([name, desc, tech]) => (
          <Reveal key={name as string} className="cap-card">
            <h3>{name}</h3><p>{desc as string}</p><div className="chips">{(tech as string[]).map((t) => <span key={t}>{t}</span>)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const JOURNEY = [
  ["2021", "Game Development", "Started learning Unity and game development."],
  ["2022", "Editing, 2D/3D Animation & Blender", "Learned video editing, started learning both 2D and 3D animation, and began exploring Blender."],
  ["2023", "Gaming Edits & 2D Animation", "Combined animation with gaming edits and personal projects, then continued improving 2D animation."],
  ["2024", "School Projects, AR, VR & Arduino", "Produced animation projects for school, learned AR and VR development, built Arduino projects with camera integration, expanded Unity game development, and created an identity theft awareness video."],
  ["2025", "Graduation & PolyPath", "Graduated with a Bachelor of Science in Information Technology and completed PolyPath as our undergraduate capstone project."],
  ["2026", "Live Apps & New Projects", "Published DoPalette on Google Play, opened Dosevia to public beta testers, and started building DryNav, a flood-aware navigation app."],
];

function Journey() {
  return (
    <section id="journey" className="section journey">
      <div className="journey-sticky"><Reveal><p className="eyebrow">Journey</p><h2>Learn. Adapt. Build.</h2><p>Not famous. Not pretending. Just building, learning, and improving one project at a time.</p></Reveal></div>
      <div className="timeline">
        {JOURNEY.map(([year, title, note], i) => <Reveal key={title as string} className="timeline-item" delay={i * 0.03}><span>{year}</span><h3>{title}</h3><p>{note}</p></Reveal>)}
      </div>
    </section>
  );
}

function CopyButton({ value, children }: { value: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return <button className="copy-button" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{children}</button>;
}

function FinalCTA() {
  return (
    <section id="contact" className="contact-section">
      <Reveal><p className="eyebrow">Contact Options</p></Reveal>
      <Reveal delay={0.1}><h2>Let&apos;s build something<br /><span>meaningful.</span></h2></Reveal>
      <Reveal delay={0.2}><p>Open to junior developer roles, internships, freelance work, and creative collaborations where I can keep learning and contribute through real projects.</p></Reveal>
      <Reveal delay={0.3}>
        <div className="cta-row">
          <a href="/resume/BENITEZ,DAVID_RESUME.pdf" className="primary" target="_blank" rel="noreferrer"><Download size={15} /> Download Resume</a>
          <a href="https://www.linkedin.com/in/david-jerano-benitez-150351349" target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a>
        </div>  
      </Reveal>
      <Reveal delay={0.4}>
        <div className="contact-options">
          <CopyButton value="benitezdavid663@gmail.com">Email: benitezdavid663@gmail.com</CopyButton>
          <CopyButton value="+63 976 300 5101">Phone: +63 976 300 5101</CopyButton>
          <a href="https://www.linkedin.com/in/david-jerano-benitez-150351349" target="_blank" rel="noreferrer">LinkedIn: david-jerano-benitez-150351349 <ArrowUpRight size={14} /></a>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <strong>Hi, I&apos;m David.</strong>
      <span>© 2026 David Jerano Garcia Benitez — Built with curiosity.</span>
      <div><a href="#contact">Contact</a><a href="/resume/BENITEZ,DAVID_RESUME.pdf" target="_blank" rel="noreferrer">Resume</a></div>
    </footer>
  );
}

export default function App() {
  const [navVisible, setNavVisible] = useState(false);
  const handlePast = useCallback((v: boolean) => setNavVisible(v), []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.background = "#090909";
  }, []);

  return (
    <main>
      <ScrollProgress />
      <Nav show={navVisible} />
      <Hero onPast={handlePast} />
      <WhyIBuild />
      <SelectedWork />
      <BeyondCode />
      <LoveBuilding />
      <Journey />
      <FinalCTA />
      <Footer />
      <Style />
    </main>
  );
}

function Style() {
  return <style>{`
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body { margin: 0; background: #090909; color: #fff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; }
    a:focus-visible, button:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
    ::selection { background: rgba(255,255,255,.18); }
    .scroll-progress { position: fixed; top: 0; left: 0; width: 100%; height: 2px; background: #fff; transform-origin: left center; z-index: 2000; opacity: .85; }
    .nav-menu { display: none; width: 38px; height: 38px; border: 1px solid #242424; background: #111; color: #fff; border-radius: 999px; align-items: center; justify-content: center; }
    .mobile-panel { display: none; position: absolute; top: 64px; left: 16px; right: 16px; padding: 14px; border: 1px solid #242424; border-radius: 20px; background: rgba(15,15,15,.96); backdrop-filter: blur(18px); box-shadow: 0 20px 70px rgba(0,0,0,.42); }
    .mobile-panel a { display: block; padding: 14px 12px; color: #fff; font-size: 14px; font-weight: 800; border-radius: 12px; }
    .mobile-panel a:hover { background: rgba(255,255,255,.06); }
    .intro-skip { position: absolute; right: 28px; bottom: 28px; z-index: 4; border: 1px solid #242424; color: #b5b5b5; background: rgba(20,20,20,.75); backdrop-filter: blur(12px); border-radius: 999px; padding: 10px 14px; font-weight: 800; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: .25s; }
    .intro-skip:hover { color: #fff; border-color: #777; transform: translateY(-2px); }
    .intro-skip.hide { opacity: 0; pointer-events: none; transform: translateY(6px); }

    .nav { position: fixed; inset: 0 0 auto 0; height: 64px; padding: 0 48px; z-index: 100; display: flex; align-items: center; justify-content: space-between; background: rgba(9,9,9,.86); border-bottom: 1px solid #242424; backdrop-filter: blur(18px); transform: translateY(-110%); opacity: 0; transition: .45s cubic-bezier(.22,1,.36,1); }
    .nav.visible { transform: translateY(0); opacity: 1; }
    .brand { font-weight: 900; letter-spacing: -.04em; animation: softBounce 2.8s ease-in-out infinite; }
    .nav-links { display: flex; gap: 34px; color: #b5b5b5; font-size: 12px; }
    .nav-links a:hover { color: #fff; }
    .nav-cta { background: #fff; color: #090909; border-radius: 999px; padding: 8px 18px; font-size: 12px; font-weight: 800; }
    .hero { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; overflow: hidden; padding: 60px 32px 24px; }
    .grain { position: absolute; inset: 0; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,.055), transparent 45%); }
    .hero-inner { position: relative; text-align: center; max-width: 1100px; margin: auto 0; }
    .hero-name { color: #777; font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; margin: 0 0 22px; opacity: 0; transform: translateY(12px); transition: .8s .1s; }
    .hero-name.show { opacity: 1; transform: none; }
    .hero h1 { font-size: clamp(48px, 9vw, 120px); line-height: .9; letter-spacing: -.07em; font-weight: 950; margin: 0; min-height: 1em; white-space: pre-line; }
    .cursor { display: inline-block; width: 4px; height: .85em; margin-left: 6px; background: #fff; vertical-align: middle; animation: blink 1s step-end infinite; }
    .cursor.hide { opacity: 0; }
    .hero-kicker { margin: 34px 0 0; color: #fff; letter-spacing: .02em; font-size: clamp(15px, 2vw, 20px); opacity: 0; transform: translateY(12px); transition: .8s .2s; }
    .hero-subtitle { margin: 12px 0 0; color: #b5b5b5; letter-spacing: .12em; text-transform: uppercase; font-size: 11px; opacity: 0; transform: translateY(12px); transition: .8s .28s; }
    .hero-kicker.show, .hero-subtitle.show, .hero-actions.show, .scroll-cue.show { opacity: 1; transform: none; }
    .hero-actions { margin-top: 36px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; opacity: 0; transform: translateY(12px); transition: .8s .35s; }
    .hero-actions a, .project-actions a, .about-buttons a, .cta-row a, .copy-button, .contact-options a { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 22px; border: 1px solid #242424; border-radius: 999px; font-weight: 800; font-size: 13px; transition: .2s; background: transparent; color: #fff; cursor: pointer; }
    .hero-actions a:first-child, .project-actions a:first-child, .cta-row .primary { background: #fff; color: #090909; border-color: #fff; }
    .hero-actions a:hover, .project-actions a:hover, .about-buttons a:hover, .cta-row a:hover, .copy-button:hover, .contact-options a:hover { transform: translateY(-2px); border-color: #777; }
    .scroll-cue { margin: 24px 0 0; color: #b5b5b5; text-transform: uppercase; font-size: 10px; letter-spacing: .22em; opacity: 0; transform: translateY(12px); transition: .9s .55s; display: grid; place-items: center; gap: 10px; }
    .scroll-cue div { width: 1px; height: 32px; background: linear-gradient(#b5b5b5, transparent); }
    @media (max-width: 520px) { .scroll-cue { margin: 20px 0 0; } }
    .section { max-width: 1200px; margin: 0 auto; padding: 130px 48px; }
    .about-section { display: grid; grid-template-columns: 1fr .9fr; gap: 80px; align-items: center; }
    .eyebrow { color: #b5b5b5; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; margin: 0 0 18px; }
    h2 { font-size: clamp(38px, 5vw, 68px); line-height: .96; letter-spacing: -.055em; margin: 0; font-weight: 950; }
    .lead, .section-head p, .journey-sticky p, .contact-section p { color: #b5b5b5; line-height: 1.75; font-size: 16px; }
    .lead { max-width: 560px; margin: 30px 0; }
    .lead.philosophy { color: #fff; font-size: 18px; font-weight: 700; }
    .about-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
    .portrait-card { border: 1px solid #242424; background: #141414; border-radius: 24px; overflow: hidden; }
    .portrait-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; object-position: center 18%; display: block; }
    .portrait-meta { padding: 22px; display: grid; gap: 4px; }
    .portrait-meta span { color: #b5b5b5; font-size: 13px; }
    .word-stack { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
    .word-stack button { border: 1px solid #242424; background: #0f0f0f; color: #555; padding: 8px 14px; border-radius: 999px; font-weight: 900; font-size: 12px; cursor: default; }
    .word-stack button.active { color: #fff; border-color: #fff; }
    .work { border-top: 1px solid #242424; }
    .section-head { max-width: 1200px; margin: 0 auto; padding: 150px 48px 82px; }
    .section-head h2 { margin: 0 0 22px; }
    .section-head p { max-width: 980px; margin: 0; }
    .section-head.compact { padding: 0 0 60px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
    .chips span { border: 1px solid #242424; background: #141414; color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; }

    .project-grid { max-width: 1200px; margin: 0 auto; padding: 0 48px 150px; display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 20px; }
    @media (min-width: 640px) { .project-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; } }
    @media (min-width: 1024px) { .project-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
    .orphan-row { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
    @media (min-width: 640px) { .orphan-row { gap: 22px; } }
    @media (min-width: 1024px) { .orphan-row { gap: 24px; } }
    .orphan-row > .card { flex: 0 1 340px; }

    .category-grid { max-width: 1200px; margin: 0 auto; padding: 0 48px 60px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; animation: catGridIn .5s cubic-bezier(.22,1,.36,1) both; }
    .category-grid.leaving .category-btn { pointer-events: none; }
    .category-btn { position: relative; aspect-ratio: 1; min-width: 0; border: 2px solid #242424; border-radius: 20px; overflow: hidden; cursor: pointer; background: #141414; padding: 0; transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .45s ease, border-color .3s ease, box-shadow .3s ease; }
    .category-btn:hover, .category-btn:focus-visible { border-color: var(--cat-accent); box-shadow: 0 22px 50px -22px color-mix(in srgb, var(--cat-accent) 55%, transparent); transform: translateY(-4px); }
    .category-btn.zoom { transform: scale(1.2); opacity: 0; }
    .category-btn.out-left { transform: translateX(-70px) scale(.82); opacity: 0; }
    .category-btn.out-right { transform: translateX(70px) scale(.82); opacity: 0; }
    .cat-bg { position: absolute; inset: 0; }
    .cat-bg img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transform: scale(1.12); filter: blur(6px); transition: opacity 1s ease; }
    .cat-bg img.active { opacity: 1; }
    .cat-overlay { position: absolute; inset: 0; background: rgba(9,9,9,.4); }
    .cat-label { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 6px; padding: 18px; color: #fff; font-weight: 950; font-size: clamp(20px, 4.2vw, 36px); letter-spacing: -.03em; text-shadow: 0 2px 14px rgba(0,0,0,.6); }
    .cat-label small { font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: var(--cat-accent); }
    @keyframes catGridIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

    .category-detail { animation: catDetailIn .5s cubic-bezier(.22,1,.36,1) both; }
    .category-detail.leaving { animation: none; opacity: 0; transform: translateY(14px) scale(.98); transition: opacity .35s ease, transform .35s ease; }
    .category-detail-head { max-width: 1200px; margin: 0 auto; padding: 0 48px 22px; }
    .back-btn { display: inline-flex; }
    @keyframes catDetailIn { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }

    .card { position: relative; background: #141414; border: 1px solid #242424; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; cursor: pointer; transition: border-color .3s, transform .3s, box-shadow .3s; }
    .card:hover, .card:focus-within { border-color: color-mix(in srgb, var(--accent) 45%, #333); box-shadow: 0 22px 44px -26px color-mix(in srgb, var(--accent) 45%, transparent); transform: translateY(-3px); }

    .slideshow { position: relative; aspect-ratio: 4/3; overflow: hidden; background: radial-gradient(120% 100% at 15% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%), #101010; border-bottom: 1px solid #242424; touch-action: pan-y; user-select: none; }
    .slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 18px; opacity: 0; transition: opacity .55s ease; }
    .slide.active { opacity: 1; }
    .slide img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block; border-radius: 8px; box-shadow: 0 16px 32px -16px rgba(0,0,0,.65); }
    .slide.placeholder { flex-direction: column; gap: 8px; color: #666; }
    .slide.placeholder svg { color: var(--accent); opacity: .55; }
    .slide.placeholder span { font-size: 11px; letter-spacing: .03em; }
    .video-preview { padding: 0; }
    .video-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; box-shadow: none; }
    .play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .play-overlay svg { width: 20px; height: 20px; margin-left: 2px; }
    .play-overlay { color: #fff; }
    .play-overlay::before { content: ""; position: absolute; width: 52px; height: 52px; border-radius: 50%; background: rgba(9,9,9,.55); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,.25); transition: transform .25s ease, background .25s ease; }
    .card:hover .play-overlay::before, .card:focus-within .play-overlay::before { transform: scale(1.08); background: rgba(9,9,9,.72); }
    .play-overlay svg { position: relative; z-index: 1; }
    .idx-pill, .status-pill { position: absolute; top: 10px; z-index: 3; font-size: 10.5px; letter-spacing: .04em; color: #fff; background: rgba(9,9,9,.6); backdrop-filter: blur(6px); padding: 5px 9px; border-radius: 999px; border: 1px solid #242424; display: flex; align-items: center; gap: 6px; }
    .idx-pill { left: 10px; color: #b5b5b5; }
    .status-pill { right: 10px; }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex: none; }
    .dots { position: absolute; bottom: 10px; left: 0; right: 0; z-index: 3; display: flex; justify-content: center; gap: 5px; }
    .dots button { border: 0; padding: 0; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.35); cursor: pointer; transition: all .25s ease; }
    .dots button.active { background: var(--accent); width: 14px; border-radius: 3px; }
    .nav-arrow { position: absolute; top: 50%; translate: 0 -50%; z-index: 3; width: 28px; height: 28px; border: 1px solid #242424; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(9,9,9,.6); backdrop-filter: blur(6px); color: #fff; cursor: pointer; opacity: 0; transition: opacity .2s ease; }
    .slideshow:hover .nav-arrow { opacity: 1; }
    .nav-arrow.prev { left: 8px; } .nav-arrow.next { right: 8px; }

    .card-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
    .card-head { display: flex; align-items: center; gap: 12px; }
    .card-icon { width: 42px; height: 42px; border-radius: 12px; overflow: hidden; flex: none; border: 1px solid #242424; }
    .card-icon img, .card-icon svg { width: 100%; height: 100%; display: block; }
    .card-head h3 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -.01em; }
    .card-type { margin: 2px 0 0; font-size: 12px; color: #777; }
    .card-desc { margin: 0; font-size: 13.5px; line-height: 1.6; color: #b5b5b5; }
    .store-notice { display: flex; align-items: center; gap: 6px; margin: -4px 0 0; font-size: 11.5px; color: var(--accent); }
    .store-notice svg { flex: none; }
    .card-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 6px; flex-wrap: wrap; }
    .details-link { border: 0; background: none; padding: 0; cursor: pointer; font-size: 12.5px; font-weight: 800; color: #b5b5b5; display: inline-flex; align-items: center; gap: 5px; transition: color .2s; }
    .details-link:hover { color: #fff; }

    .btn { border: 1px solid #333; background: transparent; color: #fff; cursor: pointer; font-size: 12.5px; font-weight: 800; text-decoration: none; padding: 8px 13px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; transition: opacity .2s, transform .2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn.solid { background: #fff; color: #090909; border-color: #fff; }
    .btn.soon { border-style: dashed; color: #777; cursor: default; }
    .btn.soon:hover { transform: none; }

    .play-badge { display: inline-flex; align-items: center; gap: 9px; background: #000; border: 1px solid #3d3d3f; border-radius: 10px; padding: 7px 13px 7px 11px; text-decoration: none; transition: transform .2s, border-color .2s; }
    .play-badge:hover { border-color: #6b6b6b; transform: translateY(-2px); }
    .play-badge .txt { display: flex; flex-direction: column; line-height: 1.1; }
    .play-badge .txt .g { font-size: 8.5px; letter-spacing: .05em; color: #cfcfcf; text-transform: uppercase; }
    .play-badge .txt .n { font-size: 15px; color: #fff; font-weight: 700; }
    .beta-badge { display: inline-flex; align-items: center; gap: 8px; background: #191919; border: 1px solid #333; border-radius: 10px; padding: 8px 13px; text-decoration: none; color: #fff; font-size: 12.5px; font-weight: 800; transition: border-color .2s, transform .2s; }
    .beta-badge:hover { border-color: var(--accent); transform: translateY(-2px); }

    .overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(6,6,7,.75); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { width: 100%; max-width: 640px; max-height: 88vh; overflow-y: auto; background: #141414; border: 1px solid #333; border-radius: 22px; }
    .modal .slideshow { aspect-ratio: 4/3; border-radius: 22px 22px 0 0; }
    .modal-close { position: absolute; top: 14px; right: 14px; z-index: 4; border: 1px solid #242424; background: rgba(9,9,9,.6); backdrop-filter: blur(6px); color: #fff; cursor: pointer; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .modal-close:hover { border-color: #555; }
    .modal-video { border-radius: 22px 22px 0 0; border-bottom: 1px solid #242424; margin: 0; }
    .modal-body { padding: 28px 30px 30px; }
    .modal-body .card-head { margin-bottom: 14px; }
    .modal-body h3 { font-size: 23px; }
    .modal-body .card-desc { font-size: 14.5px; line-height: 1.7; max-width: 60ch; }
    .bullets { list-style: none; margin: 4px 0 26px; padding: 0; display: grid; gap: 11px; }
    .bullets li { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.6; color: #b5b5b5; }
    .bullets li::before { content: ""; flex: none; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); margin-top: 7px; }
    .modal-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; border-top: 1px solid #242424; padding-top: 20px; margin-top: 4px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .video-frame { content-visibility: auto; contain-intrinsic-size: 480px; position: relative; background: #000; overflow: hidden; }
    .video-frame iframe { width: 100%; aspect-ratio: 16/9; display: block; border: 0; background: #000; }
    .beyond-section, .capabilities, .journey { border-top: 1px solid #242424; }
    .beyond-filters { display: flex; flex-wrap: wrap; gap: 10px; margin: -24px auto 28px; max-width: 1200px; padding: 0 48px; }
    .beyond-filters button { border: 1px solid #242424; background: #111; color: #9a9a9a; border-radius: 999px; padding: 9px 14px; font-size: 12px; font-weight: 900; cursor: pointer; transition: .22s; }
    .beyond-filters button:hover, .beyond-filters button.active { color: #fff; border-color: rgba(255,255,255,.55); background: #191919; }
    .beyond-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; max-width: 1200px; margin: 0 auto; padding: 0 48px; }
    .beyond-video-card { content-visibility: auto; contain-intrinsic-size: 360px; border-radius: 24px; border: 1px solid #242424; background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.015)); overflow: hidden; opacity: 0; transform: translateY(22px); transition: .75s cubic-bezier(.22,1,.36,1); }
    .beyond-video-card.show { opacity: 1; transform: none; }
    .youtube-frame { background: #000; border-bottom: 1px solid #242424; }
    .youtube-frame iframe { width: 100%; aspect-ratio: 16/9; display: block; border: 0; background: #000; }
    .beyond-video-meta { padding: 18px; }
    .beyond-video-meta span { color: #8f8f8f; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
    .beyond-video-meta h3 { color: #fff; font-size: 20px; line-height: 1.05; letter-spacing: -.04em; margin: 10px 0 14px; }
    .beyond-video-meta a { color: #fff; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 900; text-decoration: none; }
    .cap-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .cap-card { border: 1px solid #242424; background: #111; border-radius: 22px; padding: 28px; }
    .cap-card h3 { font-size: 26px; letter-spacing: -.03em; margin: 0 0 12px; }
    .cap-card p { color: #b5b5b5; line-height: 1.65; }
    .journey { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }
    .journey-sticky { position: sticky; top: 100px; align-self: start; }
    .timeline-item { border-left: 1px solid #242424; padding: 0 0 48px 32px; position: relative; }
    .timeline-item:before { content: ''; position: absolute; left: -5px; top: 0; width: 9px; height: 9px; background: #fff; border-radius: 50%; }
    .timeline-item span { color: #b5b5b5; font-size: 12px; font-weight: 900; }
    .timeline-item h3 { font-size: 25px; letter-spacing: -.03em; margin: 8px 0; }
    .timeline-item p { color: #b5b5b5; line-height: 1.65; margin: 0; }
    .contact-section { text-align: center; padding: 160px 48px; border-top: 1px solid #242424; }
    .contact-section h2 { font-size: clamp(52px, 9vw, 110px); }
    .contact-section h2 span { color: #b5b5b5; }
    .contact-section p { max-width: 560px; margin: 34px auto 48px; }
    .cta-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
    .contact-options { margin: 24px auto 0; max-width: 760px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    footer { border-top: 1px solid #242424; padding: 32px 48px; display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; color: #b5b5b5; font-size: 12px; }
    footer strong { color: #fff; } footer div { display: flex; gap: 18px; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes softBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @media (max-width: 900px) {
      .nav { padding: 0 20px; } .nav-links, .nav-cta { display: none; } .nav-menu { display: inline-flex; } .nav.open .mobile-panel { display: block; }
      .about-section, .journey { grid-template-columns: 1fr; gap: 44px; }
      .section, .section-head, .contact-section { padding-left: 22px; padding-right: 22px; }
      .project-grid { padding-left: 22px; padding-right: 22px; padding-bottom: 104px; }
      .category-grid { padding-left: 22px; padding-right: 22px; gap: 10px; }
      .category-detail-head { padding-left: 22px; padding-right: 22px; }
      .section-head { padding-top: 104px; padding-bottom: 62px; }
      .section-head h2 { margin-bottom: 18px; }
      .beyond-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding-left: 22px; padding-right: 22px; }
      .beyond-video-meta { padding: 12px; }
      .beyond-video-meta h3 { font-size: 15px; margin: 6px 0 8px; }
      .cap-grid { grid-template-columns: 1fr; }
      .beyond-filters { padding: 0 22px; }
      .journey-sticky { position: static; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .001ms !important; }
    }
    @media (max-width: 520px) {
      .hero { min-height: 100svh; height: 100svh; padding: 20px; place-items: center; }
      .hero-inner { width: 100%; }
      .hero-name { font-size: 9px; margin-bottom: 18px; }
      .hero h1 { font-size: clamp(40px, 13vw, 58px); line-height: .93; }
      .hero-kicker { font-size: 14px; margin-top: 24px; }
      .hero-subtitle { font-size: 9px; line-height: 1.8; }
      .intro-skip { right: 18px; bottom: 18px; }
      .modal-body h3 { font-size: 20px; }
      .category-grid { gap: 8px; }
      .category-btn { border-radius: 14px; }
      .cat-label { padding: 10px; }
      .modal-bottom { flex-direction: column; align-items: stretch; }
      .card-foot { align-items: stretch; }
      .contact-options, .cta-row, .hero-actions { align-items: stretch; }
      .contact-options > *, .cta-row > *, .hero-actions > * { width: 100%; }
    }
  `}</style>;
}
