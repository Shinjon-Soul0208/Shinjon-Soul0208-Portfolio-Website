/* ==========================================================================
   PORTFOLIO LOGIC, GSAP ANIMATIONS & GITHUB INTEGRATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide SVG icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ----------------------------------------------------------------------
       1. SMOOTH SCROLLING (Lenis)
       ---------------------------------------------------------------------- */
    const initSmoothScroll = () => {
        if (typeof Lenis === 'undefined') return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integrate Lenis scroll with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Smooth scroll to anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    lenis.scrollTo(target, {
                        offset: 0,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
            });
        });
    };

    /* ----------------------------------------------------------------------
       2. CUSTOM INTERACTIVE CURSOR & MAGNETIC EFFECT
       ---------------------------------------------------------------------- */
    const initCursorAndMagnetic = () => {
        const cursorDot = document.getElementById('custom-cursor-dot');
        const cursorCircle = document.getElementById('custom-cursor-circle');
        
        if (!cursorDot || !cursorCircle) return;

        let mousePos = { x: 0, y: 0 };
        let dotPos = { x: 0, y: 0 };
        let circlePos = { x: 0, y: 0 };

        window.addEventListener('mousemove', (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        });

        // Animate cursor positions with lag (lerp) for smooth weight
        gsap.ticker.add(() => {
            // Instant dot
            dotPos.x += (mousePos.x - dotPos.x);
            dotPos.y += (mousePos.y - dotPos.y);
            
            // Lagging outer circle
            circlePos.x += (mousePos.x - circlePos.x) * 0.15;
            circlePos.y += (mousePos.y - circlePos.y) * 0.15;

            gsap.set(cursorDot, { x: dotPos.x, y: dotPos.y });
            gsap.set(cursorCircle, { x: circlePos.x, y: circlePos.y });
        });

        // Hover effect for all links and buttons
        const hoverTargets = document.querySelectorAll('a, button, .magnetic, .project-card, .skill-pill');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            target.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Magnetic element physics
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const bound = this.getBoundingClientRect();
                const elX = bound.left + bound.width / 2;
                const elY = bound.top + bound.height / 2;
                
                // Distance from mouse to center of element
                const deltaX = e.clientX - elX;
                const deltaY = e.clientY - elY;
                
                // Pull element slightly toward cursor
                gsap.to(this, {
                    x: deltaX * 0.35,
                    y: deltaY * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', function() {
                // Return to original position
                gsap.to(this, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1.1, 0.4)'
                });
            });
        });
    };

    /* ----------------------------------------------------------------------
       3. GSAP SCROLL ENTRANCE ANIMATIONS
       ---------------------------------------------------------------------- */
    const initGSAPAnimations = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // Header fade-in on load
        gsap.from('.main-header', {
            y: -50,
            opacity: 0,
            duration: 1.2,
            ease: 'power4.out',
            delay: 0.2
        });

        // Header scrolled class toggle
        ScrollTrigger.create({
            start: 'top -50px',
            onEnter: () => document.querySelector('.main-header').classList.add('scrolled'),
            onLeaveBack: () => document.querySelector('.main-header').classList.remove('scrolled'),
        });

        // Hero element slide up sequentially
        gsap.to('.hero-left .fade-in-up', {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out',
            stagger: 0.15,
            delay: 0.4
        });

        // 3D Flip-In Text Reveal for Hero Display Title
        const titleLines = document.querySelectorAll('.title-line-text');
        if (titleLines.length > 0) {
            gsap.fromTo(titleLines, 
                { y: '100%', rotationX: -60, opacity: 0 },
                { y: '0%', rotationX: 0, opacity: 1, duration: 1.6, stagger: 0.2, ease: 'power4.out', delay: 0.4 }
            );
        }

        gsap.to('.hero-right.fade-in', {
            opacity: 1,
            duration: 1.6,
            ease: 'power3.out',
            delay: 0.6
        });

        // General Section title & description animations
        const sections = document.querySelectorAll('section');
        sections.forEach(sec => {
            const tag = sec.querySelector('.section-tag');
            const title = sec.querySelector('.section-title, .contact-headline');
            const desc = sec.querySelector('.about-desc, .contact-text');
            const timeline = sec.querySelector('.about-timeline');
            
            if (tag) {
                gsap.from(tag, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sec,
                        start: 'top 80%',
                    }
                });
            }

            if (title) {
                gsap.from(title, {
                    opacity: 0,
                    y: 40,
                    duration: 1.0,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sec,
                        start: 'top 75%',
                    }
                });
            }

            if (desc) {
                const targets = desc.children.length > 0 ? desc.children : desc;
                gsap.from(targets, {
                    opacity: 0,
                    y: 30,
                    duration: 1.0,
                    stagger: 0.15,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: desc,
                        start: 'top 80%',
                    }
                });
            }

            if (timeline) {
                gsap.from(timeline.children, {
                    opacity: 0,
                    x: 30,
                    duration: 1.0,
                    stagger: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: timeline,
                        start: 'top 80%',
                    }
                });
            }
        });

        // Active state navigation highlighting based on scroll position
        sections.forEach(sec => {
            const id = sec.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (!navLink) return;

            ScrollTrigger.create({
                trigger: sec,
                start: 'top 40%',
                end: 'bottom 40%',
                onEnter: () => navLink.classList.add('active'),
                onLeave: () => navLink.classList.remove('active'),
                onEnterBack: () => navLink.classList.add('active'),
                onLeaveBack: () => navLink.classList.remove('active')
            });
        });
    };

    /* ----------------------------------------------------------------------
       4. DYNAMIC GITHUB API REPOS FETCHING
       ---------------------------------------------------------------------- */
    const initGitHubFetch = async () => {
        const grid = document.getElementById('github-projects-grid');
        if (!grid) return;

        const githubUsername = 'Shinjon-Soul0208';
        const fallbackRepos = [
            {
                name: 'Banking-System-Enhanced-Security-AI',
                description: 'An AI-enhanced banking security core telemetry prototype allowing users to monitor banking transactions and account records with real-time data plots.',
                stargazers_count: 15,
                language: 'Python',
                html_url: `https://github.com/${githubUsername}/Banking-System-Enhanced-Security-AI-Projectt-`
            },
            {
                name: 'smart-india-hackathon-2025-attendance',
                description: 'An automated web attendance scanner designed for the Smart India Hackathon 2025. Integrates SQLite database telemetry with a secure monitoring dashboard.',
                stargazers_count: 18,
                language: 'Python',
                html_url: `https://github.com/${githubUsername}/SMART_INDIA_HACKATHON_2025_TEAM_LEO_PROJECT`
            },
            {
                name: 'ieee-xypher-secure-web-app',
                description: 'A secure web application developed for the IEEE XYPHER hackathon, utilizing Flask backend routing, encrypted tokens, and shielded client inputs.',
                stargazers_count: 12,
                language: 'Python',
                html_url: `https://github.com/${githubUsername}/IEEE_XYPHER_CODEFILE_TEAM_LEO`
            },
            {
                name: 'muj-cse-freshers-portfolio-template',
                description: 'A premium, modular digital portfolio grid and layout template designed for Computer Science Engineering freshers at Manipal University Jaipur.',
                stargazers_count: 21,
                language: 'JavaScript',
                html_url: `https://github.com/${githubUsername}/MUJ_CSE_Freshers_Portfolio`
            }
        ];

        // Language specific color codes
        const langColors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'CSS': '#563d7c',
            'HTML': '#e34c26',
            'Python': '#3572A5',
            'GLSL': '#568c48',
            'Vue': '#41b883',
            'C++': '#f34b7d',
            'Java': '#b07219'
        };

        const renderProjects = (projects) => {
            // Clear skeleton loaders
            grid.innerHTML = '';

            projects.forEach((proj, idx) => {
                const wrapper = document.createElement('div');
                const floatClass = `float-w-${(idx % 3) + 1}`;
                wrapper.className = `project-card-wrapper ${floatClass}`;

                const card = document.createElement('a');
                card.href = proj.html_url;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'project-card';
                card.id = `project-card-${idx}`;

                // Add magnetic cursor hover link
                card.addEventListener('mouseenter', () => {
                    document.body.classList.add('cursor-hover');
                });
                card.addEventListener('mouseleave', () => {
                    document.body.classList.remove('cursor-hover');
                });

                const langName = proj.language || 'Unknown';
                const langColor = langColors[langName] || '#8b5cf6';
                const description = proj.description || 'No description provided for this GitHub repository. Click to explore source files.';

                card.innerHTML = `
                    <div class="project-card-header">
                         <h3 class="project-card-title">
                            <span>${proj.name}</span>
                            <span class="project-link-icon"><i data-lucide="arrow-up-right"></i></span>
                        </h3>
                        <p class="project-card-desc">${description}</p>
                    </div>
                    <div class="project-card-footer">
                        <span class="project-lang">
                            <span class="lang-color-dot" style="background-color: ${langColor}"></span>
                            ${langName}
                        </span>
                        <div class="project-stats">
                            <span class="stat-item">
                                <i data-lucide="star"></i>
                                ${proj.stargazers_count}
                            </span>
                        </div>
                    </div>
                `;

                wrapper.appendChild(card);
                grid.appendChild(wrapper);
            });

            // Re-create icons inside dynamically generated cards
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Re-initialize 3D Card Tilt for new elements
            initCardTilt();

            // Animate dynamic project card wrappers after rendering
            gsap.from('.project-card-wrapper', {
                opacity: 0,
                y: 40,
                duration: 1.0,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 80%',
                }
            });
        };

        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=30`);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // Filter out forks, private repositories, configuration profile repository, and the apology-for-siya repository, then format
            let filteredRepos = data
                .filter(repo => !repo.fork && !repo.private && repo.name.toLowerCase() !== 'apology-for-siya' && repo.name.toLowerCase() !== 'shinjon-soul0208')
                // Sort by star count (primary) and update date (secondary)
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 6);

            // If user has very few public repos, append fallbacks
            if (filteredRepos.length < 3) {
                const existingNames = new Set(filteredRepos.map(r => r.name.toLowerCase()));
                fallbackRepos.forEach(fb => {
                    if (!existingNames.has(fb.name.toLowerCase()) && filteredRepos.length < 6) {
                        filteredRepos.push(fb);
                    }
                });
            }

            renderProjects(filteredRepos);

        } catch (error) {
            console.warn('GitHub API rate limit or network error. Displaying simulated premium projects.', error);
            // Wait slightly for organic feel
            setTimeout(() => {
                renderProjects(fallbackRepos);
            }, 600);
        }
    };

    /* ----------------------------------------------------------------------
       5. DYNAMIC LOCAL CLOCK (IST - Indian Standard Time)
       ---------------------------------------------------------------------- */
    const initLocalClock = () => {
        const timeElement = document.getElementById('footer-local-time');
        if (!timeElement) return;

        const updateClock = () => {
            const options = {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            
            const timeString = new Intl.DateTimeFormat('en-US', options).format(new Date());
            timeElement.textContent = `${timeString} GMT+5:30 (IST)`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    };

    /* ----------------------------------------------------------------------
       6. MOBILE DRAWER NAVIGATION MENU
       ---------------------------------------------------------------------- */
    const initMobileMenu = () => {
        const toggleBtn = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        const mobileCta = document.getElementById('mobile-menu-cta');

        if (!toggleBtn || !mobileMenu) return;

        const toggleMenuState = () => {
            const isOpen = mobileMenu.classList.toggle('open');
            toggleBtn.classList.toggle('open');
            
            // Lock body scroll when mobile menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (isOpen) {
                // Stagger animate menu link entries
                gsap.fromTo('.mobile-nav-links li, #mobile-menu-cta', 
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.1 }
                );
            }
        };

        toggleBtn.addEventListener('click', toggleMenuState);

        // Close menu when clicking links
        const closeMenu = () => {
            mobileMenu.classList.remove('open');
            toggleBtn.classList.remove('open');
            document.body.style.overflow = '';
        };

        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                closeMenu();
                
                // Allow smooth scrolling
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            });
        });

        if (mobileCta) {
            mobileCta.addEventListener('click', closeMenu);
        }
    };

    /* ----------------------------------------------------------------------
       7. 3D INTERACTIVE CARD TILT & GLARE EFFECT
       ---------------------------------------------------------------------- */
    const initCardTilt = () => {
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            // Append glare element if not already present
            if (!card.querySelector('.card-glare')) {
                const glare = document.createElement('div');
                glare.className = 'card-glare';
                card.appendChild(glare);
            }

            const glare = card.querySelector('.card-glare');

            const handleMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                
                // Cursor position relative to card boundaries
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Normalized position from -0.5 to 0.5
                const xc = x / rect.width - 0.5;
                const yc = y / rect.height - 0.5;
                
                // Rotation values (max tilt of 16 degrees)
                const rx = -yc * 24; 
                const ry = xc * 24;  
                
                // Calculate percentage coordinates for local glare position
                const mx = (x / rect.width) * 100;
                const my = (y / rect.height) * 100;
                
                // Update CSS Variables on element
                card.style.setProperty('--rx', `${rx}deg`);
                card.style.setProperty('--ry', `${ry}deg`);
                card.style.setProperty('--mx', `${mx}%`);
                card.style.setProperty('--my', `${my}%`);
            };
            
            const handleMouseLeave = () => {
                // Return to zero values smoothly
                card.style.setProperty('--rx', `0deg`);
                card.style.setProperty('--ry', `0deg`);
            };

            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);
        });
    };

    // Execute core setups
    initSmoothScroll();
    initCursorAndMagnetic();
    initGSAPAnimations();
    initGitHubFetch();
    initLocalClock();
    initMobileMenu();
    initCardTilt(); // Initialize for loading skeleton cards immediately
});
