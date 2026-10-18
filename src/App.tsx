import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BEZEL_SWATCHES } from './data/presentationData';
import { FrameworkLaptop3DCanvas } from './components/FrameworkLaptop3D';

export function App() {
  const [continuousSlidePos, setContinuousSlidePos] = useState<number>(0);
  const [explodeSceneProgress, setExplodeSceneProgress] = useState<number>(0);
  const [bezelHex, setBezelHex] = useState<string>(BEZEL_SWATCHES[0].hex);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const explodeSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      const vh = window.innerHeight || 1;
      const viewportCenter = window.scrollY + vh * 0.5;

      // Calculate continuous scene position (0..11) from actual section positions
      let computedPos = 0;
      for (let i = 0; i < sceneRefs.current.length; i++) {
        const el = sceneRefs.current[i];
        if (!el) continue;
        const top = el.offsetTop;
        const height = Math.max(1, el.offsetHeight);
        const center = top + height * 0.5;

        if (viewportCenter >= top && viewportCenter <= top + height) {
          const nextEl = sceneRefs.current[i + 1];
          if (nextEl && viewportCenter > center) {
            const nextCenter = nextEl.offsetTop + nextEl.offsetHeight * 0.5;
            const span = Math.max(1, nextCenter - center);
            computedPos = i + Math.min(1, Math.max(0, (viewportCenter - center) / span));
          } else if (i > 0 && viewportCenter < center) {
            const prevEl = sceneRefs.current[i - 1]!;
            const prevCenter = prevEl.offsetTop + prevEl.offsetHeight * 0.5;
            const span = Math.max(1, center - prevCenter);
            computedPos = i - 1 + Math.min(1, Math.max(0, (viewportCenter - prevCenter) / span));
          } else {
            computedPos = i;
          }
          break;
        } else if (viewportCenter > top + height) {
          computedPos = i;
        }
      }
      setContinuousSlidePos(computedPos);

      // Compute 0..1 progress through the 3D Exploded View section (index 3)
      if (explodeSectionRef.current) {
        const rect = explodeSectionRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, explodeSectionRef.current.offsetHeight - vh);
        const p = Math.min(1, Math.max(0, -rect.top / scrollable));
        setExplodeSceneProgress(p);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Compute smooth lid angle & explode factor from scroll
  const { lidAngle, explodeFactor, explodeCaption } = useMemo(() => {
    const p = explodeSceneProgress;

    // Outside the exploded runway, keep laptop assembled and open
    if (continuousSlidePos < 2.2 || continuousSlidePos > 3.85) {
      return {
        lidAngle: continuousSlidePos < 0.8 ? 1.78 : 1.92,
        explodeFactor: 0,
        explodeCaption: {
          stage: 'STAGE A',
          title: 'Complete Studio Form',
          sub: 'Precision CNC-milled recycled aluminum chassis.',
        },
      };
    }

    if (p < 0.16) {
      const t = p / 0.16;
      return {
        lidAngle: 0.45 + t * 1.45,
        explodeFactor: 0,
        explodeCaption: {
          stage: 'STAGE A → B',
          title: 'Opening the Chassis',
          sub: 'Five captive T5 Torx fasteners release the input deck.',
        },
      };
    } else if (p < 0.52) {
      const t = (p - 0.16) / 0.36;
      const smoothT = t * t * (3 - 2 * t);
      return {
        lidAngle: 1.9 + smoothT * 0.12,
        explodeFactor: smoothT,
        explodeCaption: {
          stage: 'STAGE C',
          title: 'Exploded Modular Assembly',
          sub: 'Display, Input Deck, Ryzen AI 300 Mainboard, Cooling, DDR5, NVMe, and Battery separate cleanly.',
        },
      };
    } else if (p < 0.78) {
      return {
        lidAngle: 2.02,
        explodeFactor: 1.0,
        explodeCaption: {
          stage: 'STAGE D',
          title: 'Every Part Replaceable',
          sub: 'Zero glue. Labeled fasteners and QR repair guides on every internal module.',
        },
      };
    } else {
      const t = (p - 0.78) / 0.22;
      const smoothT = t * t * (3 - 2 * t);
      return {
        lidAngle: 2.02 - smoothT * 0.1,
        explodeFactor: Math.max(0, 1 - smoothT),
        explodeCaption: {
          stage: 'STAGE E',
          title: 'Reassembly',
          sub: 'Every component returns to its exact alignment.',
        },
      };
    }
  }, [continuousSlidePos, explodeSceneProgress]);

  // Compute gradual opacity and vertical drift for each slide based on distance from continuousSlidePos
  const getSlideTransitionStyle = (index: number): React.CSSProperties => {
    if (reducedMotion) return { opacity: 1, transform: 'none' };
    const dist = continuousSlidePos - index;
    const absDist = Math.abs(dist);
    const opacity = Math.max(0, Math.min(1, 1.15 - absDist * 1.35));
    const translateY = -dist * 42;
    return {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
    };
  };

  return (
    <div className="presentation-app">
      {/* Persistent 3D Laptop Canvas */}
      <FrameworkLaptop3DCanvas
        continuousSlidePos={continuousSlidePos}
        explodeFactor={explodeFactor}
        lidAngle={lidAngle}
        bezelHex={bezelHex}
        reducedMotion={reducedMotion}
      />

      {/* Pure Scroll-Driven Slides — Zero UI Chrome */}
      <main className="presentation-timeline">
        {/* 01 / 11 — HERO */}
        <section
          ref={(el) => (sceneRefs.current[0] = el)}
          className="slide-scene"
          aria-label="Slide 01"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(0)}>
            <div className="slide-eyebrow">
              FRAMEWORK <span className="lime-dot">·</span> LAPTOP 13 / 16
            </div>

            <div className="slide-body-left">
              <h1 className="hero-title">
                The computer
                <br />
                that's <span className="text-lime">actually</span>
                <br />
                yours.
              </h1>
              <p className="slide-lead">
                Modular. Repairable. Designed to outlast the trend that made it.
              </p>
            </div>

            <footer className="slide-minimal-footer">
              <span>A keynote · the case for a computer you keep.</span>
              <span>01 / 11</span>
            </footer>
          </div>
        </section>

        {/* 02 / 11 — A GROWING PROBLEM */}
        <section
          ref={(el) => (sceneRefs.current[1] = el)}
          className="slide-scene"
          aria-label="Slide 02"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(1)}>
            <div className="slide-eyebrow">
              A GROWING PROBLEM <span className="lime-dot">·</span> 01
            </div>

            <div className="slide-split">
              <div className="slide-body-left">
                <p className="mono-note">Electronic waste generated worldwide, 2022</p>
                <div className="giant-metric">
                  62 <span className="text-lime">Mt</span>
                </div>
                <p className="slide-lead">
                  of obsolete electronics — and only <strong className="text-white">22.3%</strong>{' '}
                  ever makes it back into a useful life.
                </p>
              </div>

              <div className="minimal-stat-list">
                <div className="minimal-stat-item">
                  <span className="mono-tag">VS. 2010</span>
                  <strong className="stat-val">
                    +<span className="text-orange">82%</span>
                  </strong>
                  <span>more e-waste than a decade ago.</span>
                </div>
                <div className="minimal-stat-item">
                  <span className="mono-tag">BY 2030</span>
                  <strong className="stat-val">
                    82 <small>Mt</small>
                  </strong>
                  <span>projected if nothing changes.</span>
                </div>
                <div className="minimal-stat-item">
                  <span className="mono-tag">PER PERSON</span>
                  <strong className="stat-val">
                    7.8 <small>kg</small>
                  </strong>
                  <span>every year — every person on Earth.</span>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Source: UN Global E-waste Monitor 2024.</span>
              <span>02 / 11</span>
            </footer>
          </div>
        </section>

        {/* 03 / 11 — MEET FRAMEWORK */}
        <section
          ref={(el) => (sceneRefs.current[2] = el)}
          className="slide-scene"
          aria-label="Slide 03"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(2)}>
            <div className="slide-eyebrow">
              MEET FRAMEWORK <span className="lime-dot">·</span> 02
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                The last laptop
                <br />
                you'll <span className="text-lime">need to own.</span>
                <br />
                Not because you can't —
              </h2>
              <p className="slide-lead">
                A computer should outlast the website that sold it.
              </p>

              <div className="clean-tri-row">
                <div>
                  <span className="mono-tag text-lime">01</span>
                  <strong>Fully modular</strong>
                  <p>CPU, RAM, storage, ports.</p>
                </div>
                <div>
                  <span className="mono-tag text-lime">02</span>
                  <strong>Openly repairable</strong>
                  <p>Every part, every fastener.</p>
                </div>
                <div>
                  <span className="mono-tag text-lime">03</span>
                  <strong>Yours to customize</strong>
                  <p>Top to bottom, inside and out.</p>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Repairable. Upgradeable. Customizable.</span>
              <span>03 / 11</span>
            </footer>
          </div>
        </section>

        {/* 3D EXPLODED VIEW SEQUENCE (STAGES A–E) — PURE CINEMATIC SCROLL */}
        <section
          ref={(el) => {
            sceneRefs.current[3] = el;
            explodeSectionRef.current = el;
          }}
          className="exploded-scroll-runway"
          aria-label="3D Exploded View Sequence"
        >
          <div className="exploded-sticky-frame">
            <div
              className="exploded-minimal-caption"
              style={{
                opacity: Math.max(0, 1 - Math.abs(continuousSlidePos - 3) * 1.1),
              }}
            >
              <span className="mono-tag text-lime">{explodeCaption.stage}</span>
              <h3>{explodeCaption.title}</h3>
              <p>{explodeCaption.sub}</p>
            </div>
          </div>
        </section>

        {/* 04 / 11 — BUILT FOR YOU */}
        <section
          ref={(el) => (sceneRefs.current[4] = el)}
          className="slide-scene"
          aria-label="Slide 04"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(4)}>
            <div className="slide-eyebrow">
              BUILT FOR YOU <span className="lime-dot">·</span> 03
            </div>

            <div className="slide-body-wide">
              <h2 className="slide-title">
                For the people who use computers —
                <br />
                <span className="text-muted">not the ones who</span>{' '}
                <span className="text-lime">throw them away.</span>
              </h2>

              <div className="clean-tri-row large-tri">
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">01 · STUDENTS</span>
                  <strong>Built to last past graduation</strong>
                  <p>Four years of code and late-night renders. Upgrade as you go.</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">02 · CREATORS</span>
                  <strong>Color-accurate &amp; configurable</strong>
                  <p>Swappable ports, fast NVMe storage, and a 2880×1920 matte display.</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">03 · TINKERERS &amp; ENGINEERS</span>
                  <strong>Open schematics &amp; firmware</strong>
                  <p>Swappable mainboards and Linux-first support on GitHub.</p>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Three audiences. One laptop. Built to belong to all of them.</span>
              <span>04 / 11</span>
            </footer>
          </div>
        </section>

        {/* 05 / 11 — PERFORMANCE */}
        <section
          ref={(el) => (sceneRefs.current[5] = el)}
          className="slide-scene"
          aria-label="Slide 05"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(5)}>
            <div className="slide-eyebrow">
              PERFORMANCE <span className="lime-dot">·</span> 04
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Cutting-edge chips
                <br />
                in a chassis you'll
                <br />
                <span className="text-lime">keep using.</span>
              </h2>
              <p className="slide-lead">
                The mainboard is replaceable — so the next generation of silicon will be, too.
              </p>

              <div className="clean-spec-grid">
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">CPU</span>
                  <strong className="spec-num">Up to 12 cores</strong>
                  <p>AMD Ryzen AI 300</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">MEMORY</span>
                  <strong className="spec-num">96 GB DDR5</strong>
                  <p>Socketed &amp; swappable</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">STORAGE</span>
                  <strong className="spec-num">8 TB NVMe</strong>
                  <p>Replace the drive, not the laptop</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">DISPLAY &amp; GPU</span>
                  <strong className="spec-num">120 Hz Matte</strong>
                  <p>2880×1920 · Optional RTX 5070 (Laptop 16)</p>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Fast today. Faster next year.</span>
              <span>05 / 11</span>
            </footer>
          </div>
        </section>

        {/* 06 / 11 — EXPANSION CARDS */}
        <section
          ref={(el) => (sceneRefs.current[6] = el)}
          className="slide-scene"
          aria-label="Slide 06"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(6)}>
            <div className="slide-eyebrow">
              EXPANSION CARDS <span className="lime-dot">·</span> 05
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Pick your ports.
                <br />
                Rearrange them <span className="text-lime">in seconds.</span>
              </h2>
              <p className="slide-lead">
                Hot-swappable USB-C Expansion Cards slide into any slot — no reboot, no tools.
              </p>

              <div className="slots-inline-pair">
                <div>
                  <strong className="slot-num">4</strong>
                  <span>Slots · Laptop 13</span>
                </div>
                <div>
                  <strong className="slot-num text-lime">6</strong>
                  <span>Slots · Laptop 16</span>
                </div>
              </div>

              <p className="port-tags-line">
                USB-C · USB-A · HDMI · DisplayPort · microSD · SD · Ethernet · 2.5GbE ·{' '}
                <span className="text-lime">Storage</span> ·{' '}
                <span className="text-lime">Audio</span>
              </p>
            </div>

            <footer className="slide-minimal-footer">
              <span>Hot-swappable. Open reference designs on GitHub.</span>
              <span>06 / 11</span>
            </footer>
          </div>
        </section>

        {/* 07 / 11 — REPAIR, REUSE, REPEAT */}
        <section
          ref={(el) => (sceneRefs.current[7] = el)}
          className="slide-scene"
          aria-label="Slide 07"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(7)}>
            <div className="slide-eyebrow">
              REPAIR, REUSE, REPEAT <span className="lime-dot">·</span> 06
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Every fastener is labeled.
                <br />
                Every blueprint is <span className="text-lime">open.</span>
              </h2>

              <div className="clean-two-col">
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">REPAIR</span>
                  <strong>Buy the part. Fix it yourself.</strong>
                  <p>QR codes on every module link to step-by-step guides. No glued-in batteries.</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">OPEN SOURCE</span>
                  <strong>Schematics &amp; EC firmware</strong>
                  <p>Open-sourced in 2022. Reference designs published on GitHub.</p>
                </div>
              </div>

              <blockquote className="minimal-quote">
                “Every repair possible for someone who had never been inside a computer before.”
              </blockquote>
            </div>

            <footer className="slide-minimal-footer">
              <span>Framework's founding design brief.</span>
              <span>07 / 11</span>
            </footer>
          </div>
        </section>

        {/* 08 / 11 — YOUR OS, YOUR RULES */}
        <section
          ref={(el) => (sceneRefs.current[8] = el)}
          className="slide-scene"
          aria-label="Slide 08"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(8)}>
            <div className="slide-eyebrow">
              YOUR OS, YOUR RULES <span className="lime-dot">·</span> 07
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Whatever you boot,
                <br />
                Framework <span className="text-lime">runs it.</span>
              </h2>
              <p className="slide-lead">
                You own the machine. You pick the operating system. You keep the data.
              </p>

              <div className="clean-tri-row">
                <div className="top-rule-item">
                  <span className="mono-tag">WINDOWS 11</span>
                  <strong>Pre-built Edition</strong>
                  <p>Day-one support and full driver bundle.</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">FEDORA</span>
                  <strong>Official Reference</strong>
                  <p>Deep engineering collaboration out of the box.</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag">UBUNTU &amp; FRIENDS</span>
                  <strong>Linux Certified</strong>
                  <p>Ubuntu, Mint, Arch, NixOS, Manjaro — bring your own.</p>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Windows. Fedora. Ubuntu. Or write your own.</span>
              <span>08 / 11</span>
            </footer>
          </div>
        </section>

        {/* 09 / 11 — CUSTOMIZE */}
        <section
          ref={(el) => (sceneRefs.current[9] = el)}
          className="slide-scene"
          aria-label="Slide 09"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(9)}>
            <div className="slide-eyebrow">
              CUSTOMIZE <span className="lime-dot">·</span> 08
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Make it <span className="text-lime">yours</span> —
                <br />
                top to bottom, inside
                <br />
                and out.
              </h2>

              <div className="clean-two-col">
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">INPUT MODULES · LAPTOP 16</span>
                  <strong>Hot-swappable &amp; magnetic</strong>
                  <p>Numpad · 34×9 LED Matrix · RGB Macropad · Spacers</p>
                </div>
                <div className="top-rule-item">
                  <span className="mono-tag text-lime">BEZELS · LAPTOP 13</span>
                  <strong>Snap-on magnetic colors</strong>
                  <div className="minimal-swatch-row">
                    {BEZEL_SWATCHES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`minimal-swatch ${bezelHex === s.hex ? 'is-active' : ''}`}
                        style={{ backgroundColor: s.hex }}
                        onClick={() => setBezelHex(s.hex)}
                        aria-label={s.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Designed to be customised. By you.</span>
              <span>09 / 11</span>
            </footer>
          </div>
        </section>

        {/* 10 / 11 — REAL NUMBERS */}
        <section
          ref={(el) => (sceneRefs.current[10] = el)}
          className="slide-scene"
          aria-label="Slide 10"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(10)}>
            <div className="slide-eyebrow">
              REAL NUMBERS <span className="lime-dot">·</span> 09
            </div>

            <div className="slide-body-left">
              <h2 className="slide-title">
                Buy <span className="text-lime">once.</span> Upgrade{' '}
                <span className="text-lime">forever.</span>
              </h2>
              <p className="slide-lead">
                Upgrade the part — not the whole machine.
              </p>

              <div className="clean-bars-block">
                <div className="clean-bar-item">
                  <div className="clean-bar-meta">
                    <span>Replace 3× typical laptop (12 yrs)</span>
                    <strong>~$4,500</strong>
                  </div>
                  <div className="clean-bar-track">
                    <div className="clean-bar-fill fill-muted" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="clean-bar-item">
                  <div className="clean-bar-meta">
                    <span className="text-lime">Framework upgrade path (12 yrs)</span>
                    <strong className="text-lime">~$1,800</strong>
                  </div>
                  <div className="clean-bar-track">
                    <div className="clean-bar-fill fill-lime" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>

              <div className="diy-starting-line">
                <span className="mono-tag text-lime">DIY EDITION · STARTS AT</span>
                <strong className="diy-price">$549</strong>
                <span>Laptop 12 — No bloatware. No mystery. No upsell.</span>
              </div>
            </div>

            <footer className="slide-minimal-footer">
              <span>Indicative 12-year comparison vs typical mid-tier replace-cycle.</span>
              <span>10 / 11</span>
            </footer>
          </div>
        </section>

        {/* 11 / 11 — THE REPAIR REVOLUTION */}
        <section
          ref={(el) => (sceneRefs.current[11] = el)}
          className="slide-scene"
          aria-label="Slide 11"
        >
          <div className="slide-frame" style={getSlideTransitionStyle(11)}>
            <div className="slide-eyebrow">
              THE REPAIR REVOLUTION <span className="lime-dot">·</span> 10
            </div>

            <div className="slide-body-left">
              <h2 className="hero-title">
                Take it <span className="text-lime">apart.</span>
                <br />
                Put it back together.
                <br />
                <span className="text-muted">Again and again.</span>
              </h2>
              <p className="slide-lead">
                Join thousands of engineers, students, and makers who decided a laptop is not a
                four-year subscription.
              </p>
              <p className="mono-note text-lime">
                Build yours · Read the schematics · Join the Marketplace
              </p>
            </div>

            <footer className="slide-minimal-footer">
              <span>One computer. A long life. Yours. · Framework Computer since 2020.</span>
              <span>11 / 11</span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
