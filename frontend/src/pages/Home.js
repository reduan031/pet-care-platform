import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Adoption feed data ─── */
const FEED_SEED = [
  { name: 'Arif K.',   pet: 'Luna',   type: '🐱', g1: '#7C3AED', g2: '#A78BFA', time: '2m' },
  { name: 'Mitu S.',   pet: 'Bruno',  type: '🐶', g1: '#F97316', g2: '#FCD34D', time: '8m' },
  { name: 'Rashed A.', pet: 'Sky',    type: '🦜', g1: '#06B6D4', g2: '#A5F3FC', time: '15m' },
  { name: 'Nadia H.',  pet: 'Mochi',  type: '🐱', g1: '#F43F5E', g2: '#FDA4AF', time: '23m' },
  { name: 'Karim B.',  pet: 'Rex',    type: '🐶', g1: '#10B981', g2: '#6EE7B7', time: '31m' },
  { name: 'Tasnim R.', pet: 'Pearl',  type: '🕊️', g1: '#8B5CF6', g2: '#C4B5FD', time: '45m' },
];
const NEW_PETS = [
  { name: 'Sara L.',   pet: 'Cookie', type: '🐰', g1: '#F59E0B', g2: '#FDE68A' },
  { name: 'Imran T.',  pet: 'Bolt',   type: '🐶', g1: '#7C3AED', g2: '#06B6D4' },
  { name: 'Faria M.',  pet: 'Kiwi',   type: '🦜', g1: '#10B981', g2: '#F97316' },
];

const QUIZ = [
  { q: "What's your living situation?", opts: ['🏠 House with yard','🏢 Apartment','🌳 Rural / farm','🏨 Shared space'] },
  { q: 'How active is your lifestyle?', opts: ['🏃 Very active','🚶 Moderate','🛋️ Relaxed','🔄 Mixed'] },
  { q: 'How much time for your pet daily?', opts: ['⏰ 1–2 hours','🕑 3–5 hours','🌅 Full day','💤 Minimal'] },
];

const PETS = ['🐶','🐱','🦜'];
const PET_LABELS = ['Dog','Cat','Bird'];

/* ─── Confetti ─── */
function launchConfetti() {
  const colors = ['#8B5CF6','#06B6D4','#F97316','#10B981','#F43F5E','#A78BFA'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${Math.random()*100}vw;
      top:0;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${0.9+Math.random()*0.9}s;
      animation-delay:${Math.random()*0.35}s;
      transform:rotate(${Math.random()*360}deg);
      width:${6+Math.random()*7}px;
      height:${6+Math.random()*7}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

/* ─── Animated Counter ─── */
function useCounter(target, started) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const dur = 2200;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, started]);
  return val;
}

function StatCard({ emoji, target, label }) {
  const [ref, setRef] = useState(null);
  const [started, setStarted] = useState(false);
  const val = useCounter(target, started);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  const display = val >= 1000 ? (val / 1000).toFixed(1) + 'k+' : String(val);
  const targetDisplay = target >= 1000 ? (target / 1000).toFixed(1) + 'k+' : String(target);

  return (
    <div className="stat-card reveal" ref={setRef}>
      <span className="stat-emoji">{emoji}</span>
      <div className="stat-number">{started ? display : targetDisplay}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ─── Shine effect on service cards ─── */
function ShineCard({ className, children, id }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    ref.current.style.setProperty('--mx', x + '%');
    ref.current.style.setProperty('--my', y + '%');
  };
  return (
    <div ref={ref} id={id} className={className} onMouseMove={handleMove}>
      {children}
      <div className="service-shine" />
    </div>
  );
}

/* ─── Feed Item ─── */
function FeedItem({ d, isNew }) {
  return (
    <div className={`feed-item${isNew ? ' feed-new' : ''}`}>
      <div className="feed-avatar" style={{ background: `linear-gradient(135deg,${d.g1},${d.g2})` }}>
        {d.type}
      </div>
      <div className="feed-text">
        <div><strong>{d.name}</strong> just adopted <strong>{d.pet}</strong> {d.type}</div>
        <span>Verified adoption · PawVerse community</span>
      </div>
      <div className="feed-time">{d.time || 'just now'} ago</div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN HOME COMPONENT
══════════════════════════════════ */
const Home = () => {
  /* pet stage */
  const [activePet, setActivePet] = useState(0);

  /* quiz */
  const [quizStep, setQuizStep] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const answerQuiz = () => {
    if (quizStep >= QUIZ.length - 1) { setQuizDone(true); }
    else setQuizStep(s => s + 1);
  };
  const resetQuiz = () => { setQuizStep(0); setQuizDone(false); };

  /* feed */
  const [feedItems, setFeedItems] = useState(FEED_SEED);
  const [newFeedIdx, setNewFeedIdx] = useState(null);
  const feedRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      const d = { ...NEW_PETS[i % NEW_PETS.length], time: 'just now' };
      i++;
      setFeedItems(prev => [d, ...prev.slice(0, 11)]);
      setNewFeedIdx(0);
      launchConfetti();
      setTimeout(() => setNewFeedIdx(null), 600);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  /* podcast */
  const [playing, setPlaying] = useState(false);
  const waveBars = Array.from({ length: 32 }, (_, i) => ({
    height: `${25 + Math.random() * 75}%`,
    delay: `${(i * 0.06).toFixed(2)}s`,
  }));

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);




  /* email validation */
  const validateEmail = (e) => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
    const msg = document.getElementById('emailValidMsg');
    if (msg) msg.style.display = ok ? 'block' : 'none';
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left */}
            <div>
              <div className="hero-eyebrow">
                <span className="label-tag">✨ The Future of Pet Care is Here</span>
              </div>
              <h1 className="display-xl hero-title">
                More Than a Pet.<br />
                <span className="accent-cursive">A Family Member.</span>
              </h1>
              <p className="hero-subtitle">
                The first all-in-one ecosystem for holistic pet care — from adoption to veterinary telemedicine, all in one beautiful platform.
              </p>
              <div className="hero-ctas">
                <Link to="/marketplace-pro" className="btn-primary">🚀 Open Marketplace</Link>
                <Link to="/pet-social" className="btn-ghost">
                  <span className="play-ring">▶</span>
                  Open Pet Social
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat-badge">
                  <div className="stat-num">24k+</div>
                  <div className="stat-lbl">😊 Happy Pets</div>
                </div>
                <div className="stat-badge">
                  <div className="stat-num">98%</div>
                  <div className="stat-lbl">🩺 Vet Satisfaction</div>
                </div>
                <div className="stat-badge">
                  <div className="stat-num">4.9★</div>
                  <div className="stat-lbl">⭐ App Rating</div>
                </div>
              </div>
            </div>

            {/* Right — pet stage */}
            <div className="hero-canvas-wrap">
              <div className="hero-float-badge fb1"><span className="live-dot"/>Luna adopted 2m ago 🐱</div>
              <div className="hero-float-badge fb2">🩺 24/7 Vet Online</div>
              <div className="hero-float-badge fb3">🛡️ 98% Satisfaction</div>

              <div>
                <div className="pet-stage">
                  <div className="pet-emoji" key={activePet}>{PETS[activePet]}</div>
                </div>
                <div className="pet-toggle-row">
                  {PET_LABELS.map((lbl, i) => (
                    <button
                      key={lbl}
                      className={`pet-toggle-btn${activePet === i ? ' active' : ''}`}
                      onClick={() => setActivePet(i)}
                    >
                      {PETS[i]} {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header reveal">
            <span className="label-tag">🐾 Categories</span>
            <h2 className="display-lg">Choose Your <span className="gradient-text">Companion</span></h2>
            <p>Explore our vast collection of adorable pets and everything they need to live their best life.</p>
          </div>
          <div className="categories-track reveal reveal-delay-1">
            {[
              { icon: '🐱', name: 'Cats',    count: '2,400+', glow: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.18)', border: 'rgba(167,139,250,0.3)', accent: 'linear-gradient(90deg,#7C3AED,#A78BFA)', link: '/pet-hub?type=cat' },
              { icon: '🐶', name: 'Dogs',    count: '5,800+', glow: 'rgba(249,115,22,0.3)',  bg: 'rgba(249,115,22,0.18)', border: 'rgba(253,186,116,0.35)', accent: 'linear-gradient(90deg,#F97316,#FCD34D)', link: '/pet-hub?type=dog' },
              { icon: '🦜', name: 'Birds',   count: '1,200+', glow: 'rgba(6,182,212,0.3)',   bg: 'rgba(6,182,212,0.18)', border: 'rgba(103,232,249,0.35)', accent: 'linear-gradient(90deg,#06B6D4,#A5F3FC)', link: '/pet-hub?type=bird' },
              { icon: '🕊️', name: 'Pigeons', count: '340+',   glow: 'rgba(244,63,94,0.3)',   bg: 'rgba(244,63,94,0.18)', border: 'rgba(253,164,175,0.35)', accent: 'linear-gradient(90deg,#F43F5E,#FDA4AF)', link: '/pet-hub?type=pigeon' },
              { icon: '🐟', name: 'Fish',    count: '890+',   glow: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.18)', border: 'rgba(110,231,183,0.35)', accent: 'linear-gradient(90deg,#10B981,#6EE7B7)', link: '/pet-hub?type=fish' },
              { icon: '🐰', name: 'Rabbits', count: '420+',   glow: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.18)', border: 'rgba(253,230,138,0.35)', accent: 'linear-gradient(90deg,#F59E0B,#FDE68A)', link: '/pet-hub?type=rabbit' },
            ].map(c => (
              <Link
                key={c.name}
                to={c.link}
                className="cat-card"
                style={{ '--cat-glow': c.glow, '--cat-accent': c.accent, textDecoration: 'none', color: 'inherit' }}
              >
                <div className="cat-icon-wrap" style={{ '--cat-bg': c.bg, '--cat-border': c.border, background: c.bg, border: `2px solid ${c.border}` }}>
                  {c.icon}
                </div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count} listings</div>
                <div className="cat-explore">Explore →</div>
                <div className="cat-bottom-bar" style={{ background: c.accent }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-header reveal">
            <span className="label-tag">⚡ Services</span>
            <h2 className="display-lg">Everything Your Pet <span className="gradient-text">Deserves</span></h2>
            <p>A complete ecosystem designed around the joy and health of your beloved companions.</p>
          </div>
          <div className="services-asymmetric reveal reveal-delay-1">
            {/* Big card */}
            <ShineCard className="service-big-card">
              <div className="live-badge">Live AI Chat</div>
              <span className="svc-icon">🤖</span>
              <div className="svc-title" style={{ fontSize: '26px', marginBottom: '14px' }}>24/7 Vet AI Chat</div>
              <p className="svc-desc" style={{ fontSize: '15px', maxWidth: '360px' }}>
                Instant answers from our intelligent vet AI. Available round the clock — because your pet's health never waits.
              </p>
              <div className="ai-chat-wrap">
                <div className="ai-avatar-badge">🐾</div>
                <div className="chat-bubble">Is it normal for my cat to sleep 16 hours a day? 🤔</div>
                <div className="chat-bubble">Absolutely! Cats naturally sleep 12–16 hrs. Kittens and seniors may sleep even more. 😊 This is perfectly healthy behaviour.</div>
              </div>
            </ShineCard>

            {/* Small cards */}
            <div className="services-right-col">
              <ShineCard className="service-small-card">
                <div className="live-badge">New pet listed 2 mins ago</div>
                <span className="svc-icon">🛍️</span>
                <div className="svc-title">Marketplace</div>
                <div className="svc-desc">Buy, sell, and adopt verified pets from trusted breeders nationwide.</div>
              </ShineCard>

              <ShineCard className="service-small-card">
                <span className="svc-icon">🥗</span>
                <div className="svc-title">Nutrition Tracker</div>
                <div className="svc-desc">Custom macro goals for your pet's ideal diet.</div>
                <div className="macro-row">
                  <div className="macro-seg" style={{ background: '#8B5CF6', flex: 3 }} title="Protein 45%" />
                  <div className="macro-seg" style={{ background: '#06B6D4', flex: 2 }} title="Fat 30%" />
                  <div className="macro-seg" style={{ background: '#F97316', flex: 1.5 }} title="Carbs 25%" />
                </div>
                <div className="macro-labels">
                  <span>🟣 Protein</span><span>🔵 Fat</span><span>🟠 Carbs</span>
                </div>
              </ShineCard>

              <ShineCard className="service-small-card">
                <span className="svc-icon">🎽</span>
                <div className="svc-title">Accessories</div>
                <div className="svc-desc">Premium gear and toys curated for every breed.</div>
                <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}>
                  ✦ Smart Collar Compatible
                </div>
              </ShineCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAW PROMISE ── */}
      <section className="section" id="promise">
        <div className="container">
          <div className="section-header reveal">
            <span className="label-tag">🌟 Our Commitment</span>
            <h2 className="display-lg">The <span className="accent-cursive">Paw</span> Promise</h2>
            <p>Every feature we build is driven by one mission: the wellbeing of your pets and peace of mind for you.</p>
          </div>
          <div className="promise-grid reveal reveal-delay-1">
            {[
              { icon: '🔒', title: 'Secure Payments',    desc: 'Bank-level encryption protects every transaction. Your financial safety is our baseline, not a feature.' },
              { icon: '🚀', title: 'Lightning Delivery',  desc: 'Same-day and next-morning delivery options. Essentials arrive before your pet even knows they need them.' },
              { icon: '✅', title: 'Verified Quality',   desc: 'Every product, breeder, and vet passes our 27-point quality certification. No shortcuts, ever.' },
              { icon: '🎧', title: '24/7 Support',       desc: 'Real humans (and one very smart AI) available around the clock. Pet emergencies don\'t follow business hours.' },
            ].map(p => (
              <div key={p.title} className="promise-card">
                <span className="promise-icon">{p.icon}</span>
                <div className="promise-title">{p.title}</div>
                <div className="promise-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE FEED + QUIZ ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'start' }} className="reveal">
            {/* Feed */}
            <div>
              <span className="label-tag">🔴 Live Feed</span>
              <h2 className="display-lg" style={{ marginBottom: '24px' }}>Adoption <span className="gradient-text">Stories</span></h2>
              <div className="feed-scroll" ref={feedRef}>
                {feedItems.map((d, i) => (
                  <FeedItem key={`${d.name}-${d.pet}-${i}`} d={d} isNew={newFeedIdx === 0 && i === 0} />
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div>
              <span className="label-tag">❓ Find Your Match</span>
              <h2 className="display-lg" style={{ marginBottom: '24px' }}>Your <span className="accent-cursive">Soul-Pet</span></h2>
              <div className="quiz-card">
                {quizDone ? (
                  <>
                    <div className="quiz-question-text">🐾 Your soul-pet is a <strong>Golden Retriever!</strong> Loyal, energetic & full of love.</div>
                    <div className="quiz-opts-grid">
                      <Link to="/pets" className="quiz-option-btn selected" style={{ gridColumn: '1/-1', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                        🐶 Meet Golden Retrievers →
                      </Link>
                    </div>
                    <div className="quiz-progress-dots">
                      {[0,1,2].map(i => <div key={i} className={`quiz-dot${i === 2 ? ' active' : ''}`} />)}
                    </div>
                    <button onClick={resetQuiz} style={{ marginTop: '14px', fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'none', textDecoration: 'underline' }}>
                      Retake Quiz
                    </button>
                  </>
                ) : (
                  <>
                    <div className="quiz-question-text">{QUIZ[quizStep].q}</div>
                    <div className="quiz-opts-grid">
                      {QUIZ[quizStep].opts.map(opt => (
                        <button key={opt} className="quiz-option-btn" onClick={answerQuiz}>{opt}</button>
                      ))}
                    </div>
                    <div className="quiz-progress-dots">
                      {[0,1,2].map(i => <div key={i} className={`quiz-dot${i === quizStep ? ' active' : ''}`} />)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PODCAST ── */}
      <section className="section">
        <div className="container reveal">
          <span className="label-tag">🎙️ Podcast</span>
          <h2 className="display-lg" style={{ marginBottom: '32px' }}>The Bark &amp; <span className="gradient-text">Bleat</span></h2>
          <div className="podcast-card">
            <div className="podcast-cover-art">🎙️</div>
            <div className="podcast-info">
              <div className="podcast-ep-tag">Latest Episode · EP 47</div>
              <div className="podcast-title">Why Your Dog Dreams Just Like You Do</div>
              <div className="podcast-host">Dr. Sarah Chen · 42 min</div>
              <div className="waveform-bars">
                {waveBars.map((b, i) => (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{
                      height: b.height,
                      animationDelay: b.delay,
                      animationPlayState: playing ? 'running' : 'paused',
                    }}
                  />
                ))}
              </div>
              <div className="podcast-controls">
                <button className="play-btn" onClick={() => setPlaying(p => !p)}>
                  {playing ? '⏸' : '▶'}
                </button>
                <div className="progress-track">
                  <div className="progress-fill" />
                </div>
                <span className="podcast-time">15:32 / 42:07</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="label-tag">💬 Stories</span>
            <h2 className="display-lg">They <span className="accent-cursive">Love</span> Their Pets More Now</h2>
          </div>
          <div className="testi-grid reveal reveal-delay-1">
            {[
              { icon: '🐱', tp1: '#7C3AED', tp2: '#A78BFA', text: '"Found my soulmate cat Luna through PawVerse. The AI vet feature gives me so much peace of mind — I don\'t panic at 3am anymore."', name: 'Farida R.', loc: 'Dhaka', role: 'Cat parent · 8 months' },
              { icon: '🐶', tp1: '#F97316', tp2: '#FCD34D', text: '"The nutrition tracker helped me realize Max was eating all wrong. 3 months later he\'s the most energetic boy on the block. Incredible platform."', name: 'Tanvir H.', loc: 'Chittagong', role: 'Dog parent · 1.5 years' },
              { icon: '🦜', tp1: '#06B6D4', tp2: '#A5F3FC', text: '"I\'ve had birds for 20 years but PawVerse taught me things I never knew. The community is warm, the vets are brilliant, the whole experience is magic."', name: 'Nadia K.', loc: 'Sylhet', role: 'Bird parent · 3 years' },
            ].map(t => (
              <div key={t.name} className="testi-card">
                <div className="testi-polaroid" style={{ background: `linear-gradient(135deg,${t.tp1},${t.tp2})` }}>{t.icon}</div>
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-name">{t.name} — {t.loc}</div>
                <div className="testi-meta">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="label-tag">📊 By the Numbers</span>
            <h2 className="display-lg">A Community That <span className="gradient-text">Celebrates</span></h2>
          </div>
          <div className="stats-grid">
            <StatCard emoji="😊" target={24000} label="Happy Pet Families" />
            <StatCard emoji="🩺" target={1200}  label="Verified Vets" />
            <StatCard emoji="🏠" target={8900}  label="Successful Adoptions" />
            <StatCard emoji="🌍" target={64}    label="Cities Covered" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-name">🐾 PawVerse</div>
              <p className="footer-brand-desc">The most loved pet care platform in South Asia. Built by pet lovers, for pet lovers.</p>
              <div className="social-row">
                <button className="social-btn" aria-label="X (Twitter)">𝕏</button>
                <button className="social-btn" aria-label="Facebook">📘</button>
                <button className="social-btn" aria-label="Instagram">📸</button>
                <button className="social-btn" aria-label="YouTube">📺</button>
              </div>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="/products">Marketplace</a>
              <button className="footer-link-btn">Vet AI Chat</button>
              <a href="/pets">Adoption Feed</a>
              <a href="/products?category=food">Nutrition Tracker</a>
              <a href="/products?category=accessory">Accessories</a>
            </div>
            <div className="footer-col">
              <h4>Rescue Network</h4>
              <button className="footer-link-btn">Find a Shelter</button>
              <button className="footer-link-btn">Foster a Pet</button>
              <button className="footer-link-btn">Donate</button>
              <button className="footer-link-btn">Rescue Map</button>
              <button className="footer-link-btn">NGO Partners</button>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <button className="footer-link-btn">Privacy Policy</button>
              <button className="footer-link-btn">Terms of Use</button>
              <button className="footer-link-btn">Cookie Policy</button>
              <button className="footer-link-btn">Accessibility</button>
            </div>
            <div className="footer-col">
              <h4>🐾 PawPrint Newsletter</h4>
              <p className="newsletter-desc">Weekly pet tips, rescue stories & new arrivals.</p>
              <div className="newsletter-row">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="your@email.com"
                  onChange={validateEmail}
                />
                <button className="newsletter-submit">→</button>
              </div>
              <div id="emailValidMsg" className="email-valid-msg">✓ Looks great!</div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 PawVerse. Made with ❤️ for every pet parent.</p>
            <p className="footer-copy">Dhaka, Bangladesh 🇧🇩</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;