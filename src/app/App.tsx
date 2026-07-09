import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Download, Linkedin, Menu, Play, X } from "lucide-react";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  desc: string;
  tags: string[];
  bullets: string[];
  icon?: string;
  screenshots?: string[];
  screenshotLayout?: "phone" | "desktop";
  video?: string;
  youtubeEmbed?: string;
  accent: string;
  actionLabel: string;
  actionHref: string;
  actionDownload?: boolean;
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

const PROJECTS: Project[] = [
  {
    id: "01",
    name: "DoPalette",
    type: "Android Coloring Application",
    status: "Closed Beta Testing",
    desc: "A coloring app built around creativity, offline saving, image export, Firebase accounts, and community sharing.",
    tags: ["Kotlin", "Firebase Authentication", "Firestore", "Android SDK", "AdMob"],
    bullets: [
      "Designed and developed an Android coloring application with brush tools, bucket fill, offline artwork saving, and image export.",
      "Integrated Firebase Authentication, user profiles, achievements, and a community artwork-sharing system.",
      "Focused on responsive UI, usability, performance, and a smooth coloring experience across phones and tablets.",
    ],
    icon: "/assets/projects/dopalette/icon.png",
    screenshots: [
      "/assets/projects/dopalette/screenshot-1.jpg",
      "/assets/projects/dopalette/screenshot-2.jpg",
      "/assets/projects/dopalette/screenshot-3.jpg",
      "/assets/projects/dopalette/screenshot-4.jpg",
      "/assets/projects/dopalette/screenshot-5.jpg",
      "/assets/projects/dopalette/screenshot-6.jpg",
    ],
    accent: "#8B5CF6",
    actionLabel: "Become a Tester",
    actionHref: "https://play.google.com/apps/testing/com.dopalette.app",
  },
  {
    id: "02",
    name: "Dosevia",
    type: "Medication Reminder Application",
    status: "Open Beta Testing",
    desc: "A reminder app focused on clear scheduling, persistent local data, and simple daily medication tracking.",
    tags: ["React", "TypeScript", "Capacitor", "Android", "Local Notifications"],
    bullets: [
      "Built a medication reminder application with customizable schedules and notification settings.",
      "Implemented persistent local storage and reminder management for offline functionality.",
      "Designed a clean, accessible, and user-friendly interface optimized for Android devices.",
    ],
    icon: "/assets/projects/dosevia/icon.png",
    screenshots: [
      "/assets/projects/dosevia/screenshot-1.jpg",
      "/assets/projects/dosevia/screenshot-2.jpg",
      "/assets/projects/dosevia/screenshot-3.jpg",
      "/assets/projects/dosevia/screenshot-4.jpg",
    ],
    accent: "#EC4899",
    actionLabel: "Become a Beta Tester",
    actionHref: "https://play.google.com/apps/testing/com.dosevia.app",
  },
  {
    id: "03",
    name: "Sama Na U Wedding",
    type: "Responsive Wedding Website",
    status: "Live Website",
    desc: "A responsive wedding website built to present event details, countdown, venues, gallery, and RSVP information in a clean and elegant layout.",
    tags: ["HTML", "CSS", "JavaScript", "Responsive Design", "GitHub Pages"],
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
    screenshotLayout: "desktop",
    accent: "#D4AF37",
    actionLabel: "Live Preview",
    actionHref: "https://kyahdj.github.io/SamaNaUWedding/",
  },
  {
    id: "04",
    name: "PolyPath",
    type: "Educational 3D Learning Game",
    status: "School Capstone Project",
    desc: "An educational PC game created as a capstone project to teach beginners 3D modeling fundamentals through progression-based learning.",
    tags: ["Unity", "C#", "Blender", "Game Development", "Educational Software"],
    bullets: [
      "Developed an educational 3D game that teaches beginners the fundamentals of 3D modeling.",
      "Designed progression-based learning mechanics to improve engagement and retention.",
      "Created 3D assets, environments, lighting, and animations using Blender and Unity.",
    ],
    youtubeEmbed: "https://www.youtube.com/embed/DXXD1eb3ZZY",
    accent: "#F97316",
    actionLabel: "Download Game (Windows)",
    actionHref: "https://github.com/KYAHDJ/david-benitez/releases/download/v1.0/PolyPath.zip",
  },
];

function ImageLightbox({ images, index, projectName, onClose, onMove }: { images: string[]; index: number; projectName: string; onClose: () => void; onMove: (index: number) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onMove((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onMove((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, index, onClose, onMove]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${projectName} screenshot viewer`}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close image viewer"><X size={22} /></button>
      <button className="lightbox-arrow left" onClick={() => onMove((index - 1 + images.length) % images.length)} aria-label="Previous image"><ChevronLeft size={28} /></button>
      <img src={images[index]} alt={`${projectName} screenshot ${index + 1}`} decoding="async" />
      <button className="lightbox-arrow right" onClick={() => onMove((index + 1) % images.length)} aria-label="Next image"><ChevronRight size={28} /></button>
      <div className="lightbox-count">{index + 1} / {images.length}</div>
    </div>
  );
}

function MediaShowcase({ project }: { project: Project }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (project.youtubeEmbed) {
    return (
      <div className="video-frame product-video">
        <iframe
          src={project.youtubeEmbed}
          title={`${project.name} promotional video`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="video-label"><Play size={14} /> YouTube preview</div>
      </div>
    );
  }

  if (project.video) {
    return (
      <div className="video-frame product-video">
        <video src={project.video} controls preload="metadata" playsInline />
        <div className="video-label"><Play size={14} /> Project video</div>
      </div>
    );
  }

  const shots = project.screenshots ?? [];
  const previewShots = shots.slice(0, 4);
  const isDesktopGallery = project.screenshotLayout === "desktop";

  return (
    <>
      <div className={`screenshot-stage gallery-stage compact-gallery ${isDesktopGallery ? "desktop-gallery" : ""}`} style={{ ["--accent" as any]: project.accent }}>
        <div className="gallery-top">
          {project.icon && <img className="app-icon inline" src={project.icon} alt={`${project.name} icon`} loading="lazy" decoding="async" />}
          <div>
            <strong>{project.name}</strong>
            <span>{shots.length} screenshots available</span>
          </div>
        </div>

        <div className={isDesktopGallery ? "preview-desktop-grid" : "preview-phone-grid"} aria-label={`${project.name} screenshot previews`}>
          {previewShots.map((src, i) => (
            <button
              className={isDesktopGallery ? "preview-desktop-card" : "preview-phone-card"}
              key={src}
              onClick={() => {
                setActiveIndex(i);
                setLightboxIndex(i);
              }}
              aria-label={`Open ${project.name} screenshot ${i + 1}`}
            >
              <img src={src} alt={`${project.name} screenshot ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            </button>
          ))}
        </div>

        <div className="gallery-actions">
          <button
            className="view-gallery-button"
            onClick={() => setLightboxIndex(activeIndex)}
            aria-label={`View all ${project.name} screenshots`}
          >
            View all screenshots <span>{shots.length}</span>
          </button>
          <p>Click any preview to open the full image.</p>
        </div>
      </div>
      {lightboxIndex !== null && <ImageLightbox images={shots} index={lightboxIndex} projectName={project.name} onClose={() => setLightboxIndex(null)} onMove={(i) => { setLightboxIndex(i); setActiveIndex(i); }} />}
    </>
  );
}

function ProjectSection({ project, index }: { project: Project; index: number }) {
  const { ref, inView } = useInView(0.18);
  const reverse = index % 2 === 1;

  return (
    <article ref={ref as any} className={`project-section ${reverse ? "reverse" : ""}`} style={{ ["--accent" as any]: project.accent }}>
      <div className={`project-copy ${inView ? "show" : ""}`}>
        <div className="project-meta"><span>{project.id}</span><b>{project.status}</b></div>
        <h3>{project.name}</h3>
        <p className="project-type">{project.type}</p>
        <p className="project-desc">{project.desc}</p>
        <div className="chips">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <ul>{project.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        <div className="project-actions">
          <a href={project.actionHref} target={project.actionDownload ? undefined : "_blank"} rel={project.actionDownload ? undefined : "noreferrer"} download={project.actionDownload ? true : undefined}>
            {project.actionDownload ? <Download size={14} /> : null}{project.actionLabel} <ArrowUpRight size={14} />
          </a>
          <a href="#contact">Ask About This</a>
        </div>
      </div>
      <div className={`project-media ${inView ? "show" : ""}`}><MediaShowcase project={project} /></div>
    </article>
  );
}

function SelectedWork() {
  return (
    <section id="work" className="work">
      <div className="section-head">
        <Reveal><p className="eyebrow">Selected Work</p><h2>Things I've built.</h2><p>Honest, hands-on work: one Android app in closed beta, one reminder app in open beta, and one capstone game built to help beginners learn 3D modeling.</p></Reveal>
      </div>
      {PROJECTS.map((project, index) => <ProjectSection key={project.name} project={project} index={index} />)}
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
  ["2026", "Apps in Testing", "Developed DoPalette in Closed Beta Testing and Dosevia in Open Beta Testing."],
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
      <div><a href="#contact">Contact</a><a href="/resume/David_Benitez_Resume.pdf">Resume</a></div>
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
    html { scroll-behavior: smooth; }
    body { margin: 0; background: #090909; color: #fff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
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
    .hero { height: 100dvh; min-height: 620px; display: grid; place-items: center; position: relative; overflow: hidden; padding: 32px; }
    .grain { position: absolute; inset: 0; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,.055), transparent 45%); }
    .hero-inner { position: relative; text-align: center; max-width: 1100px; }
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
    .scroll-cue { position: absolute; bottom: 38px; left: 50%; transform: translate(-50%, 12px); color: #b5b5b5; text-transform: uppercase; font-size: 10px; letter-spacing: .22em; opacity: 0; transition: .9s .55s; display: grid; place-items: center; gap: 10px; }
    .scroll-cue div { width: 1px; height: 44px; background: linear-gradient(#b5b5b5, transparent); }
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
    .project-section { max-width: 1200px; margin: 0 auto; min-height: 88vh; display: grid; grid-template-columns: .9fr 1.1fr; gap: 72px; align-items: center; padding: 80px 48px; border-top: 1px solid #242424; }
    .project-section.reverse { grid-template-columns: 1.1fr .9fr; }
    .project-section.reverse .project-copy { order: 2; }
    .project-copy, .project-media { opacity: 0; transform: translateY(28px); transition: .9s cubic-bezier(.22,1,.36,1); }
    .project-media { transition-delay: .12s; }
    .project-copy.show, .project-media.show { opacity: 1; transform: none; }
    .project-meta { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
    .project-meta span { color: #777; font-weight: 900; font-size: 12px; letter-spacing: .14em; }
    .project-meta b { color: var(--accent); font-size: 11px; text-transform: uppercase; letter-spacing: .12em; }
    .project-copy h3 { font-size: clamp(48px, 6vw, 88px); margin: 0; line-height: .88; letter-spacing: -.065em; }
    .project-type { color: #fff; margin: 18px 0 8px; font-weight: 800; }
    .project-desc { color: #b5b5b5; line-height: 1.7; max-width: 520px; margin-bottom: 20px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
    .chips span { border: 1px solid #242424; background: #141414; color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .project-copy ul { margin: 22px 0 28px; padding-left: 18px; color: #d9d9d9; line-height: 1.65; font-size: 14px; }
    .project-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .screenshot-stage, .video-frame { content-visibility: auto; contain-intrinsic-size: 720px; position: relative; border: 1px solid #242424; background: radial-gradient(circle at 50% 0, color-mix(in srgb, var(--accent) 20%, transparent), transparent 45%), #121212; border-radius: 28px; padding: 22px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.35); }
    .gallery-stage { display: grid; gap: 18px; }
    .compact-gallery { gap: 22px; }
    .preview-phone-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: stretch; }
    .preview-phone-card { min-width: 0; border: 1px solid #303030; border-radius: 22px; padding: 8px; background: linear-gradient(180deg, #181818, #070707); cursor: zoom-in; box-shadow: 0 18px 44px rgba(0,0,0,.28); transition: transform .25s cubic-bezier(.22,1,.36,1), border-color .25s; }
    .preview-phone-card:hover { transform: translateY(-6px); border-color: var(--accent); }
    .preview-phone-card img { width: 100%; aspect-ratio: 9/19.5; object-fit: contain; object-position: center; border-radius: 16px; background: #000; display: block; }
    .preview-desktop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
    .preview-desktop-card { min-width: 0; border: 1px solid #303030; border-radius: 18px; padding: 8px; background: linear-gradient(180deg, #181818, #070707); cursor: zoom-in; box-shadow: 0 18px 44px rgba(0,0,0,.28); transition: transform .25s cubic-bezier(.22,1,.36,1), border-color .25s; }
    .preview-desktop-card:hover { transform: translateY(-6px); border-color: var(--accent); }
    .preview-desktop-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; object-position: top center; border-radius: 12px; background: #000; display: block; }
    .gallery-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
    .gallery-actions p { margin: 0; color: #8f8f8f; font-size: 12px; line-height: 1.5; }
    .view-gallery-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #fff; background: #fff; color: #090909; border-radius: 999px; padding: 12px 18px; font-weight: 900; font-size: 12px; cursor: pointer; transition: .22s; }
    .view-gallery-button:hover { transform: translateY(-2px); }
    .view-gallery-button span { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px; background: #090909; color: #fff; font-size: 11px; }
    .gallery-top { display: flex; align-items: center; gap: 14px; }
    .gallery-top strong { display: block; font-size: 15px; }
    .gallery-top span { display: block; color: #8f8f8f; font-size: 12px; margin-top: 3px; }
    .app-icon { position: absolute; width: 76px; height: 76px; object-fit: cover; border-radius: 20px; top: 20px; right: 20px; z-index: 2; box-shadow: 0 12px 30px rgba(0,0,0,.35); }
    .app-icon.inline { position: static; width: 54px; height: 54px; border-radius: 15px; flex: 0 0 auto; }
    .featured-phone { justify-self: center; border: 0; padding: 0; background: linear-gradient(180deg, #181818, #070707); border-radius: 34px; cursor: zoom-in; width: min(100%, 330px); box-shadow: 0 26px 70px rgba(0,0,0,.45); transition: .28s cubic-bezier(.22,1,.36,1); }
    .featured-phone:hover { transform: translateY(-5px) scale(1.01); }
    .featured-phone img { width: 100%; aspect-ratio: 9/19.5; object-fit: contain; object-position: center; border-radius: 34px; border: 1px solid #303030; background: #000; display: block; }
    .phone-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(78px, 1fr)); gap: 10px; align-items: center; }
    .thumbnail-strip { padding: 4px; border: 1px solid #242424; background: rgba(0,0,0,.22); border-radius: 20px; }
    .phone-shot { border: 0; padding: 0; background: transparent; cursor: pointer; border-radius: 16px; transition: .25s; opacity: .58; }
    .phone-shot:hover, .phone-shot.active { transform: translateY(-3px); opacity: 1; }
    .phone-shot.active img { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent); }
    .phone-shot img { width: 100%; aspect-ratio: 9/19.5; object-fit: contain; object-position: center; border-radius: 16px; border: 1px solid #303030; background: #000; display: block; }
    .video-frame { padding: 10px; }
    .product-video { min-height: unset; }
    .video-frame video, .video-frame iframe { width: 100%; aspect-ratio: 16/9; display: block; object-fit: contain; border: 0; border-radius: 20px; background: #000; }
    .video-label { position: absolute; left: 24px; bottom: 24px; background: rgba(0,0,0,.72); border: 1px solid rgba(255,255,255,.16); backdrop-filter: blur(10px); padding: 8px 12px; border-radius: 999px; display: flex; gap: 8px; align-items: center; font-size: 12px; font-weight: 800; }
    .lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,.92); display: grid; place-items: center; padding: 34px; }
    .lightbox img { max-width: min(92vw, 1400px); max-height: 88vh; width: auto; height: auto; object-fit: contain; border-radius: 24px; border: 1px solid rgba(255,255,255,.14); box-shadow: 0 30px 100px rgba(0,0,0,.65); }
    .lightbox-close, .lightbox-arrow { position: fixed; z-index: 1001; border: 1px solid rgba(255,255,255,.18); background: rgba(20,20,20,.86); color: white; border-radius: 999px; display: grid; place-items: center; cursor: pointer; backdrop-filter: blur(12px); }
    .lightbox-close { top: 22px; right: 22px; width: 46px; height: 46px; }
    .lightbox-arrow { top: 50%; transform: translateY(-50%); width: 52px; height: 52px; }
    .lightbox-arrow.left { left: 22px; }
    .lightbox-arrow.right { right: 22px; }
    .lightbox-count { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: #b5b5b5; font-size: 12px; font-weight: 800; letter-spacing: .12em; }
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
      .about-section, .project-section, .project-section.reverse, .journey { grid-template-columns: 1fr; gap: 44px; }
      .project-section.reverse .project-copy { order: initial; }
      .section, .project-section, .section-head, .contact-section { padding-left: 22px; padding-right: 22px; }
      .section-head { padding-top: 104px; padding-bottom: 62px; }
      .section-head h2 { margin-bottom: 18px; }
      .phone-grid { grid-template-columns: repeat(4, 1fr); }
      .preview-phone-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .preview-desktop-grid { grid-template-columns: 1fr; }
      .featured-phone { width: min(100%, 300px); }
      .beyond-grid, .cap-grid { grid-template-columns: 1fr; }
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
      .project-copy h3 { font-size: 46px; }
      .phone-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .preview-phone-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .preview-desktop-grid { grid-template-columns: 1fr; gap: 10px; }
      .preview-phone-card { border-radius: 18px; padding: 6px; }
      .preview-phone-card img { border-radius: 13px; }
      .gallery-actions { align-items: stretch; }
      .view-gallery-button { width: 100%; }
      .featured-phone { width: min(100%, 260px); border-radius: 26px; }
      .featured-phone img { border-radius: 26px; }
      .app-icon { width: 58px; height: 58px; border-radius: 16px; }
      .lightbox-arrow { width: 44px; height: 44px; }
      .lightbox-arrow.left { left: 10px; }
      .lightbox-arrow.right { right: 10px; }
      .lightbox { padding: 20px; }
      .contact-options, .cta-row, .project-actions, .hero-actions { align-items: stretch; }
      .contact-options > *, .cta-row > *, .project-actions > *, .hero-actions > * { width: 100%; }
    }
  `}</style>;
}
