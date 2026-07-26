document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  /* ------------------ Theme Toggle ------------------ */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIconDark = themeToggle.querySelector('.theme-icon-dark');
  const themeIconLight = themeToggle.querySelector('.theme-icon-light');

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeUI(currentTheme);

  themeToggle.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
  });

  function updateThemeUI(theme) {
    if (theme === 'dark') {
      themeIconDark.style.display = 'none';
      themeIconLight.style.display = 'block';
    } else {
      themeIconDark.style.display = 'block';
      themeIconLight.style.display = 'none';
    }
  }

  /* ------------------ Mobile Navigation Menu ------------------ */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const menuIcon = mobileToggle.querySelector('i');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
    lucide.createIcons();
  });

  // Close menu when clicking links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuIcon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    });
  });

  /* ------------------ Scroll Progress & Header Styles ------------------ */
  const scrollProgress = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (window.scrollY / scrollHeight) * 100;
    scrollProgress.style.width = `${scrollPercentage}%`;

    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      scrollToTopBtn.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      scrollToTopBtn.classList.remove('visible');
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------ Section Active Link Observer ------------------ */
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserverOptions = {
    root: null,
    threshold: 0.3,
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));

  /* ------------------ Terminal Code Typing Effect ------------------ */
  const codeSnippet = `const softwareEngineer = {
  name: "Rishabh Karmakar",
  role: "Senior Software Engineer / AVP @ Wells Fargo",
  specialization: [
    "AI & Machine Learning", 
    "Blockchain Solutions", 
    "Cloud Architecture"
  ],
  education: {
    engineering: "B.E. Computer Engineering (Hons. AI/ML) @ IIIT (9.41)"
  },
  experience: {
    designation: "Senior Software Engineer (AVP) @ Wells Fargo",
    tenure: "4 Years",
    natureOfWork: [
      "CRM case management system engineering",
      "IAM architectures & deployment automations",
      "Semantic search & AI data seeding tools"
    ]
  },
  publications: {
    total: 4,
    keyJournals: ["IEEE Pune Section", "Int. Conf. Intelligent Technologies"]
  },
  skills: [
    "Python", "JavaScript", "React", "Django", "Solidity", 
    "TensorFlow", "Azure", "GCP", "Docker", "SQL"
  ]
};`;

  const codeContainer = document.getElementById('terminal-code');
  let charIndex = 0;

  function typeCode() {
    if (charIndex < codeSnippet.length) {
      codeContainer.textContent += codeSnippet.charAt(charIndex);
      charIndex++;
      setTimeout(typeCode, 10); // Swift typing speed
    }
  }

  // Set up intersection observer to start typing when the terminal becomes visible
  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeCode();
        terminalObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  terminalObserver.observe(document.querySelector('.hero-terminal'));

  /* ------------------ Achievements Horizontal Slider ------------------ */
  const track = document.getElementById('achievements-track');
  const container = document.getElementById('achievements-container');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');

  let isDragging = false;
  let startX;
  let scrollLeft;
  let currentTranslate = 0;
  let maxScroll = 0;

  function updateSliderLimits() {
    maxScroll = track.clientWidth - container.clientWidth;
    if (maxScroll < 0) maxScroll = 0;
  }

  window.addEventListener('resize', updateSliderLimits);
  setTimeout(updateSliderLimits, 500);

  // Nav Arrows
  nextBtn.addEventListener('click', () => {
    updateSliderLimits();
    currentTranslate -= 380; // card width + gap
    if (Math.abs(currentTranslate) > maxScroll) currentTranslate = -maxScroll;
    track.style.transform = `translateX(${currentTranslate}px)`;
  });

  prevBtn.addEventListener('click', () => {
    currentTranslate += 380;
    if (currentTranslate > 0) currentTranslate = 0;
    track.style.transform = `translateX(${currentTranslate}px)`;
  });

  // Drag Events
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = currentTranslate;
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = x - startX;
    let targetTranslate = scrollLeft + walk;
    
    // Limits
    updateSliderLimits();
    if (targetTranslate > 0) targetTranslate = 0;
    if (Math.abs(targetTranslate) > maxScroll) targetTranslate = -maxScroll;
    
    currentTranslate = targetTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  });

  /* ------------------ Scroll Reveal Animations ------------------ */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(elem => revealObserver.observe(elem));

  /* ------------------ Contact Form Mockup Submission ------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = 'Sending message...';
    formStatus.className = 'form-status';

    // Simulated API Call
    setTimeout(() => {
      formStatus.textContent = 'Thank you! Your message has been sent successfully.';
      formStatus.className = 'form-status success';
      contactForm.reset();
    }, 1500);
  });
});
