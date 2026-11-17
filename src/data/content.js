export const profile = {
  name: 'Rishabh Karmakar',
  role: 'MS in Computer Science (Machine Learning) @ Columbia',
  tagline: 'Previously built resilient CRM and AI infrastructure at Wells Fargo. Now pursuing a postgrad in Computer Science and Machine Learning at Columbia University.',
  email: 'rishabhkarmakar24@gmail.com',
  phones: ['+91 7738068950', '+1 (646) 529-0314'],
  linkedin: 'https://www.linkedin.com/in/rishabh-karmakar',
  github: 'https://github.com/rishabh-karmakar',
  googleScholar: 'https://scholar.google.com/citations?user=sAECZMgAAAAJ',
  resume: '/Rishabh_Karmakar_Resume.pdf',
};

export const links = [
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
  { label: 'Scholar', href: profile.googleScholar },
  { label: 'Résumé', href: profile.resume, download: true },
];

// Skill groups from the resume. Each one is a galaxy in the hero; its items are the planets.
export const galaxies = [
  {
    label: 'AI & LLM Engineering',
    items: ['RAG', 'Multi-Agent Systems', 'Model Context Protocol', 'Prompt Engineering', 'LLM Evaluation', 'Embeddings & Semantic Search', 'Fine-Tuning (LoRA)', 'Document AI & OCR'],
  },
  {
    label: 'AI Frameworks',
    items: ['PyTorch', 'TensorFlow', 'LangChain', 'LangGraph', 'LlamaIndex', 'Hugging Face Transformers', 'Sentence Transformers'],
  },
  {
    label: 'Programming',
    items: ['Python', 'JavaScript', 'TypeScript', 'C#', 'SQL', 'C++', 'R', 'HTML / CSS'],
  },
  {
    label: 'Cloud',
    items: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud Platform'],
  },
  {
    label: 'Frameworks & Tools',
    items: ['React', 'Angular', 'Node', 'Django', 'FastAPI', 'Pandas', 'NumPy', 'Git', 'Docker', 'Kubernetes', 'MySQL', 'MongoDB', 'Power Platform'],
  },
];

export const hero = {
  kicker: 'MS Computer Science, Columbia / Ex Senior Software Engineer, Wells Fargo / New York',
  thesisLead: 'I put AI into systems that',
  thesisEm: 'can’t go down.',
  sub: 'Four years as a software engineer at Wells Fargo, building agentic AI, semantic search and banking platforms. Four published papers. Now studying machine learning at Columbia, and looking for software engineering and ML roles.',
};

export const heroStats = [
  { value: 4, suffix: ' yrs', label: 'At Wells Fargo, promoted twice: Associate to AVP to SAVP' },
  { value: 100, suffix: '%', label: 'Uptime sustained on the platform I owned' },
  { value: 80, suffix: '%', label: 'Less manual engineering effort with AI agents' },
  { value: 51, label: 'Citations across 4 published papers' },
];

export const marqueeItems = ['Agentic AI', 'RAG + Semantic Search', 'Published Researcher', 'Columbia MS CS', '4 Years at Wells Fargo'];

// Opening statement and the three things I do around the code.
export const abstract = {
  statement: 'I bring AI into complex, high-stakes enterprise systems without sacrificing reliability.',
  body: 'I am an MS Computer Science student at Columbia, concentrating in machine learning, after four years as a software engineer at Wells Fargo. I am looking for software engineering and machine learning roles where I can turn AI research into production-ready technology.',
  points: [
    { title: 'Build', desc: 'AI agents, RAG and semantic search, full-stack products in React and Angular, and the cloud and IAM plumbing underneath them.' },
    { title: 'Ship', desc: 'Owned development and release of a corporate banking CRM platform and kept it at 100% uptime for four years.' },
    { title: 'Explain', desc: 'Worked between business stakeholders and four cross-functional teams, ran live demos, wrote the solution docs, and trained 10+ junior engineers.' },
  ],
};

// The four lead case studies. Everything else lives in the archive.
export const caseStudies = [
  {
    id: 'engineering-agents',
    name: 'Engineering agents',
    figure: 'pipeline',
    context: 'Wells Fargo · Senior Software Engineer',
    headline: 'AI agents that take over the engineering chores.',
    problem: 'Code review, test case design and execution, and vulnerability triage were eating engineering hours on every change.',
    approach: 'Built agentic AI agents for each task and connected them to SonarQube and Black Duck through Model Context Protocol (MCP) servers.',
    result: 'Manual effort on those tasks dropped by 80%.',
    metric: '80%',
    metricLabel: 'less manual effort',
    tags: ['Agentic AI', 'MCP', 'SonarQube', 'Black Duck'],
    caption: 'A change fans out to three agents; two of them reach scanning tools through MCP servers before reporting back.',
  },
  {
    id: 'semantic-search',
    name: 'Semantic search',
    figure: 'retrieval',
    context: 'Wells Fargo · Software Engineer',
    headline: 'Search that understands the question.',
    problem: 'Internal search matched keywords, and standing up a test environment meant seeding data by hand.',
    approach: 'Initiated and delivered a semantic search engine using RAG and a vector database, plus an automated test data seeding pipeline.',
    result: 'Search efficiency improved by 70%, reaching 5,000 people.',
    metric: '70%',
    metricLabel: 'search efficiency gain, reaching 5,000 people',
    tags: ['RAG', 'Vector DB', 'Embeddings', 'Automation'],
    caption: 'A query is embedded, compared against the index, and the closest passages come back in ranked order. Scores are illustrative.',
  },
  {
    id: 'compliance-pipeline',
    name: 'Compliance pipeline',
    figure: 'hub',
    context: 'Project · October 2025',
    headline: 'A multi-agent pipeline for compliance.',
    problem: 'Checking documents against internal policy and federal regulation by hand is slow and hard to audit.',
    approach: 'Architected a multi-agent pipeline with dedicated agents for text extraction, internal policy, federal regulation and categorisation, with a RAG layer that grounds every decision in cited source text.',
    result: 'Processes 10,000+ documents a day and reduced manual overhead by 80%.',
    metric: '10K+',
    metricLabel: 'documents per day',
    tags: ['Python', 'Multi-Agent Orchestration', 'RAG', 'MCP'],
    caption: 'An orchestrator routes each document to four specialist agents; the two compliance agents cite a shared retrieval layer.',
  },
  {
    id: 'answer-eval',
    name: 'Answer grading',
    figure: 'similarity',
    context: 'GoPrac · Machine Learning and AI Intern',
    headline: 'Grading written answers by meaning, not keywords.',
    problem: 'Open-ended answers are slow to grade by hand, and keyword matching fails the moment a correct answer is worded differently.',
    approach: 'Each answer and its reference are encoded with Sentence-BERT, compared by cosine similarity, and mapped to marks for both short and long responses.',
    result: 'Reached 85% agreement with expert graders.',
    metric: '85%',
    metricLabel: 'agreement with graders',
    tags: ['Sentence-BERT', 'NLP', 'Python'],
    caption: 'Cosine similarity between candidate answers (rows) and reference answers (columns). A bright diagonal means each answer matches its own reference. Values are illustrative.',
  },
];

export const manifesto = [
  'Most enterprise systems weren\u2019t built for the pace AI now demands.',
  'Adding intelligence without sacrificing uptime is the real challenge.',
  'That\u2019s where I design: at the intersection of AI, resilience, and scale.',
];

export const proofPoints = [
  {
    icon: 'cpu',
    title: 'Engineering @ Wells Fargo',
    desc: 'Supported corporate banking systems with 100% uptime. Spearheading Dynamics CRM, AI integrations, IAM architectures, and intelligent semantic search.',
  },
  {
    icon: 'brain',
    title: 'Speech & text analytics',
    desc: 'Built video emotion classification (80% accuracy) and subjective answer grading using sentence transformers (85% efficacy).',
  },
  {
    icon: 'link',
    title: 'Decentralized systems',
    desc: 'Designed smart-contract supply chain modules in Solidity and Web3 to enable transparency across stakeholders.',
  },
  {
    icon: 'book',
    title: 'Published research',
    desc: 'Author of 4 peer-reviewed IEEE and international journal papers on blockchain, summarization, and computer vision.',
  },
];

export const journey = [
  {
    date: 'Aug 2026 — Dec 2027',
    kind: 'Education',
    role: 'MS Computer Science, Machine Learning track',
    org: 'Columbia University · New York',
    points: ['Graduate study in machine learning, building on four years of production engineering.'],
    status: 'active',
  },
  {
    date: 'Feb 2026 — Aug 2026',
    kind: 'Experience',
    role: 'Senior Software Engineer (SAVP)',
    org: 'Wells Fargo · Hyderabad',
    points: [
      'Built agentic AI agents for code review, test case design and execution, and vulnerability detection through SonarQube and Black Duck MCP servers, cutting manual effort by 80%.',
      'Led a CRM case management platform on Microsoft Dynamics and Power Apps for Corporate and Commercial Investment Banking Technology, at 100% uptime for four years.',
      'Trained and onboarded 10+ junior engineers on Power Platform and full-stack practices.',
    ],
  },
  {
    date: 'Aug 2023 — Jan 2026',
    kind: 'Experience',
    role: 'Software Engineer (AVP)',
    org: 'Wells Fargo · Hyderabad',
    points: [
      'Spotted the need for structured mentorship and introduced a mentoring product for 10,000+ employees, owning React and Angular development, deployment and IAM.',
      'Initiated and delivered a semantic search engine and a test data seeding pipeline, cutting test environment setup time by 70%.',
    ],
  },
  {
    date: 'Aug 2022 — Aug 2023',
    kind: 'Experience',
    role: 'Program Associate',
    org: 'Wells Fargo · Hyderabad',
    points: [
      'Worked with business stakeholders and four cross-functional teams to turn requirements into production features; presented live demos and wrote the solution documentation.',
    ],
  },
  {
    date: 'Dec 2020 — Jul 2022',
    kind: 'Experience',
    role: 'Machine Learning and AI Intern',
    org: 'GoPrac · Remote',
    points: [
      'Built a multimodal video analysis pipeline for a mock interview platform, scoring expression, body language and speech at 80% agreement with human evaluators, with feedback reports for 5,000+ candidates.',
      'Engineered a multithreaded pipeline streaming training data from AWS S3 in parallel batches: 90% lower memory use and 70% faster training.',
      'Developed the SBERT answer evaluation engine, at 85% agreement with expert graders.',
    ],
  },
  {
    date: 'Jul 2018 — May 2022',
    kind: 'Education',
    role: 'B.E. Computer Engineering, Honors in AI and Machine Learning',
    org: 'IIIT Pune',
    points: ['Graduated with a 9.41 CGPA (3.98 / 4.0). Published four papers on NLP, computer vision and blockchain.'],
  },
];

// Short internships during the degree, 2019 to 2020.
export const earlyInternships = [
  { org: 'World of Professional Inc.', role: 'Data Science Executive Intern', note: 'LSTM cryptocurrency forecasting with social sentiment, 94% of predictions within $500' },
  { org: 'cppsecrets.com', role: 'Data Science Intern, Python Developer', note: 'SBERT answer assessment, speech-to-text and emotion detection' },
  { org: 'Career Launcher', role: 'Financial ML & Data Science Intern', note: 'Stock return prediction and risk clustering' },
  { org: 'Cloud Counselage', role: 'Data Science Intern', note: 'Fake news detection, smart recruiting shortlister' },
  { org: 'leadingindia.ai', role: 'Deep Learning Engineer Intern', note: 'RGB to hyperspectral image reconstruction, 5 architectures' },
  { org: 'TheSmartBridge', role: 'Machine Learning Engineer Intern', note: 'AI-powered news search on IBM Cloud' },
  { org: 'Intech Olympiad', role: 'Application and Solution Developer Intern', note: 'Remote education tool for low-resource rural areas' },
  { org: 'IoTIoT.in', role: 'Artificial Intelligence Intern', note: 'Neural networks for computer vision' },
];

export const domains = ['Machine Learning', 'Deep Learning', 'Generative AI', 'AI Agents', 'NLP', 'Computer Vision', 'Full Stack Development'];

export const spokenLanguages = ['English', 'Hindi', 'Bengali', 'Marathi'];

export const skillGroups = [
  {
    category: 'Industry Knowledge',
    items: [
      'Cloud Computing',
      'Artificial Intelligence (AI)',
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'Data Analytics',
      'Computer Vision',
      'Natural Language Processing (NLP)',
      'Convolutional Neural Networks (CNN)',
      'Neural Networks',
      'Semantic Search',
      'Generative AI',
      'Blockchain SCM',
      'Smart Contracts',
      'IAM',
      'Web Development',
      'Web Applications',
      'Software Development',
      'Programming',
      'Project Management',
      'Strategic Planning',
    ],
  },
  {
    category: 'Tools & Technologies',
    items: [
      'Python',
      'JavaScript',
      'Java',
      'C#',
      'C++',
      'C',
      'R',
      'HTML5',
      'CSS',
      'SQL',
      'NoSQL',
      'React',
      'Angular',
      'Django',
      'Flask',
      'Solidity',
      'TensorFlow',
      'Sentence-BERT',
      'LSTM-RNN',
      'Pandas / NumPy',
      'Web3 / Metamask',
      'Docker',
      'Git',
      'Google Cloud Platform (GCP)',
      'Microsoft Azure',
      'Amazon Web Services (AWS)',
      'Microsoft Power Apps',
      'Microsoft Dynamics CRM',
      'Jira',
      'Microsoft Excel',
      'Microsoft Word',
      'Microsoft PowerPoint',
    ],
  },
  {
    category: 'Interpersonal Skills',
    items: ['Public Speaking', 'Management', 'Leadership'],
  },
  {
    category: 'Certifications',
    items: [
      'Google Cloud Associate Cloud Engineer ',
      'Microsoft Certified: Azure Data Fundamentals ',
      'Microsoft Certified: Azure AI Fundamentals ',
      'Microsoft Azure 900 Fundamentals ',
      'SQL Basics ',
      'SQL Intermediate ',
      'Python Basics ',
      'Problem Solving Intermediate ',
      'Problem Solving Basics ',
      'JavaScript Basics ',
      'Java Basics ',
      'Applied Data Science with Honors ',
      'Applied Data Science - Machine Learning and Statistical Analysis ',
      'Data Science: Foundations using R Specialization ',
      'IBM Data Science Professional Specialization ',
      'AWS Academy Cloud Foundations ',
      'Fundamentals of Deep Learning for Computer Vision ',
      'IBM Specialisation - Data Science ',
      'Applied Data Science - Scientific Computing and Python for Data Science '
    ],
  },
];

export const projects = [
  {
    id: 'crypto-predictor',
    title: 'Cryptocurrency price predictor',
    metric: '94%',
    metricLabel: 'of predictions within $500 of the real price',
    desc: 'An LSTM-RNN deep learning engine providing price trajectory predictions, coupled with NLP sentiment scores gathered from social platform trends, output via custom visualization APIs.',
    tags: ['Deep Learning', 'Python', 'LSTM-RNN', 'MongoDB'],
    visual: 'sparkline',
  },
  {
    id: 'blockchain-scm',
    title: 'Blockchain-based real-time SCM',
    metric: '100%',
    metricLabel: 'transaction transparency',
    desc: 'A decentralized supply chain application ensuring transaction transparency \u2014 Metamask, Solidity smart contracts, and a Python backend with precise IAM boundaries.',
    tags: ['React', 'Solidity', 'Ethereum', 'Django'],
    visual: 'nodes',
  },
  {
    id: 'answer-eval',
    title: 'Subjective answer evaluation platform',
    metric: '85%',
    metricLabel: 'grading efficacy',
    desc: 'A semantic evaluation pipeline grading short and long subjective answers using Sentence-BERT transformers and cosine similarity matrices, benchmarked against manual scoring.',
    tags: ['Transformers', 'Sentence-BERT', 'NLP', 'Python'],
    visual: 'bars',
    featured: 1,
    figure: 'similarity',
    context: 'GoPrac · ML & AI internship',
    headline: 'Grading written answers by meaning, not keywords.',
    problem: 'Open-ended answers are slow to grade by hand, and keyword matching fails the moment a correct answer is worded differently.',
    approach: 'Each answer and its reference are encoded with Sentence-BERT, compared by cosine similarity, and mapped to marks for both short and long responses.',
    result: 'Benchmarked against manual scoring, the pipeline reached 85% grading efficacy.',
    caption: 'Cosine similarity between candidate answers (rows) and reference answers (columns). A bright diagonal means each answer matches its own reference.',
  },
  {
    id: 'facial-attendance',
    title: 'Facial attendance & emotion classifier',
    metric: '80%',
    metricLabel: 'classification accuracy',
    desc: 'Facial recognition pipelines mapping high-accuracy vectors with MTCNN models, expanded into audio/video classifiers grading confidence and speech patterns.',
    tags: ['Computer Vision', 'MTCNN', 'TensorFlow', 'Librosa'],
    visual: 'radar',
  },
  {
    id: 'trading-bot',
    title: 'Automated stock market trading bot',
    metric: '24/7',
    metricLabel: 'autonomous live trading',
    desc: 'Extended a stock prediction model into a fully automated trading bot, executing live trades based on forecasted price movement without manual intervention.',
    tags: ['Python', 'LSTM', 'Trading Automation'],
    visual: 'candles',
  },
  {
    id: 'news-aggregator',
    title: 'News aggregator & sentiment analyzer',
    metric: 'Live',
    metricLabel: 'sentiment + tweet feed',
    desc: 'Full-stack app scraping news from multiple sources into a single feed with per-article sentiment scoring, topic search, and real-time related tweets.',
    tags: ['Full Stack', 'NLP', 'Web Scraping', 'Sentiment Analysis'],
    visual: 'waves',
  },
  {
    id: 'violence-detection',
    title: 'Real-time violence detection surveillance',
    metric: 'Instant',
    metricLabel: 'automated alert dispatch',
    desc: 'Detects violent activity from live or recorded footage using MobileNet and ImageNet, automatically alerting authorities with the activity\u2019s location via API.',
    tags: ['Computer Vision', 'MobileNet', 'ImageNet'],
    visual: 'scan',
  },
  {
    id: 'student-db-facial',
    title: 'Student database management via facial recognition',
    metric: '128-pt',
    metricLabel: 'facial feature mapping',
    desc: 'Facial-recognition-driven student database system built for an AI project prompt by MyCaptain and Tabdeel Studios; matches and manages student records automatically.',
    tags: ['Computer Vision', 'Facial Recognition', 'Database'],
    visual: 'scan',
    links: {
      github: 'https://github.com/rishabh-karmakar/Facial-Recognition-Based-Attendance-System',
      demo: 'https://www.youtube.com/watch?v=Fmkfh_XTGDw',
    },
  },
  {
    id: 'stock-prediction',
    title: 'Stock market prediction (India & international)',
    metric: '4000+',
    metricLabel: 'training data points',
    desc: 'LSTM/RNN model forecasting both Indian and international markets, trained on 4,000+ historical values and predicting next-day price using a 90-day trailing window.',
    tags: ['LSTM', 'RNN', 'Time Series', 'Python'],
    visual: 'sparkline',
  },
  {
    id: 'auto-attendance-facial',
    title: 'Automatic attendance using facial recognition',
    metric: '128-pt',
    metricLabel: 'MTCNN feature mapping',
    desc: 'Multi-thread cascaded CNNs (Processing, Refine, and Output nets) extract 128 facial features per student, matching against a database and logging attendance to Excel automatically.',
    tags: ['MTCNN', 'Computer Vision', 'Automation'],
    visual: 'bars',
  },
  {
    id: 'dynamic-human-auth',
    title: 'Dynamic human authentication (Smart India Hackathon 2019)',
    metric: '4-factor',
    metricLabel: 'multi-modal authentication',
    desc: 'Built for Smart India Hackathon 2019 \u2014 combines 128-point facial recognition with OTP, geo-tagging, and voice authentication to verify identity and log attendance.',
    tags: ['Computer Vision', 'Geolocation', 'Voice Auth'],
    visual: 'pulse',
  },
  {
    id: 'traffic-management',
    title: 'Traffic management & monitoring via vehicle sensors',
    metric: 'IoT',
    metricLabel: 'vehicle sensor network',
    desc: 'A sensor-driven traffic management and monitoring & control system built to track and coordinate vehicle flow across a connected sensor network.',
    tags: ['IoT', 'Sensors', 'Systems Design'],
    visual: 'nodes',
  },
  {
    id: 'interview-video-analysis',
    title: 'Multimodal interview video analysis',
    metric: '5,000+',
    metricLabel: 'candidates given feedback',
    desc: 'Video analysis pipeline for a mock interview platform, scoring facial expression, body language and speech patterns at 80% agreement with human evaluators and generating feedback reports.',
    tags: ['Computer Vision', 'Speech', 'Python'],
  },
  {
    id: 'hyperspectral',
    title: 'RGB to hyperspectral image reconstruction',
    metric: '31-ch',
    metricLabel: 'from 3-channel RGB',
    desc: 'Reconstructed 31-channel hyperspectral images from RGB, training and comparing five architectures on the NTIRE dataset: a Pix2Pix-style GAN, a CycleGAN variant, a CNN and two convolutional autoencoders.',
    tags: ['GANs', 'Autoencoders', 'Deep Learning'],
    links: { demo: 'https://medium.com/analytics-vidhya/conversion-of-rgb-images-to-hyperspectral-using-deep-learning-f3dff0a1d60a' },
  },
  {
    id: 'news-search-ibm',
    title: 'AI-powered news search on IBM Cloud',
    metric: 'NER',
    metricLabel: 'entity-indexed search',
    desc: 'News search application that extracts and organises people, organisations and locations for faster search, designed, deployed and tested end to end on IBM Cloud.',
    tags: ['NLP', 'IBM Cloud', 'Databases'],
  },
  {
    id: 'fake-news',
    title: 'Fake news detection',
    metric: 'TF-IDF',
    metricLabel: 'passive-aggressive classifier',
    desc: 'Classifier labelling news articles as real or fake using a TF-IDF vectoriser and a Passive Aggressive Classifier.',
    tags: ['NLP', 'Classification', 'scikit-learn'],
  }
];

export const achievements = [
  {
    year: '2021',
    badge: 'Winner',
    title: 'Winner \u2014 Capgemini Tech Challenge 2021',
    org: 'Capgemini',
    desc: 'First place in Capgemini\u2019s technology challenge, competing against national developer teams.',
  },
  {
    year: '2021',
    badge: 'Winner',
    title: 'AVIAARE Winner',
    org: 'AVIAARE',
    desc: 'First place recognition in AVIAARE\u2019s innovation and problem-solving challenge.',
  },
  {
    year: '2021',
    badge: 'Finalist',
    title: 'NES Innovation Awards \u2014 Finalist',
    org: 'NES',
    desc: 'Finalist recognition in the NES Innovation Awards for applied technical problem-solving.',
  },
  {
    year: '2021',
    badge: 'Finalist',
    title: 'Barclays Tech Innovation Challenge \u2014 Semi-Finalist',
    org: 'Barclays',
    desc: 'Advanced to the semi-final round of Barclays\u2019 flagship technology innovation challenge.',
  },
  {
    year: '2021',
    badge: 'Academic',
    title: 'ACM Winter School 2021 \u2014 Finalist',
    org: 'ACM & IBM Research India',
    desc: 'Selected as a finalist for IBM Research India\u2019s intensive training in advanced algorithms, ML systems, and computation theory.',
  },
  {
    year: '2020',
    badge: 'Finalist',
    title: 'Finalist \u2014 Crack-the-Covid Hackathon',
    org: 'IBM & NASSCOM',
    desc: 'Designed data-driven supply chain frameworks, ranking top 16 of 16,000+ national team entries.',
  },
  {
    year: '2020',
    badge: 'Rank',
    title: 'Global Top 50 \u2014 Women in Data Science Datathon',
    org: 'Kaggle',
    desc: 'Ranked in the top 50 globally in the Women in Data Science (WiDS) predictive analytics datathon.',
  },
];

export const scholarStats = {
  citations: 51,
  hIndex: 3,
  i10Index: 2,
  url: 'https://scholar.google.com/citations?user=sAECZMgAAAAJ',
};
 
export const publications = [
  {
    id: 'lstm-summarization',
    title: 'Indian regional language abstractive text summarization using attention-based LSTM neural network',
    authors: 'R Karmakar, K Nirantar, P Kurunkar, P Hiremath, D Chaudhari',
    venue: '2021 International Conference on Intelligent Technologies (CONIT)',
    year: '2021',
    citedBy: 32,
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=sAECZMgAAAAJ&citation_for_view=sAECZMgAAAAJ:u5HHmVD_uO8C',
  },
  {
    id: 'blockchain-scm-paper',
    title: 'Blockchain based supply chain management',
    authors: 'K Nirantar, R Karmakar, P Hiremath, D Chaudhari',
    venue: '2022 3rd International Conference for Emerging Technology (INCET)',
    year: '2022',
    citedBy: 10,
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=sAECZMgAAAAJ&citation_for_view=sAECZMgAAAAJ:u-x6o8ySG0sC',
  },
  {
    id: 'facial-attendance-paper',
    title: 'Facial attendance system using MTCNN and feature mapping',
    authors: 'R Karmakar',
    venue: 'International Journal of Engineering Applied Sciences and Technology, 5(4)',
    year: '2020',
    citedBy: 7,
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=sAECZMgAAAAJ&citation_for_view=sAECZMgAAAAJ:9yKSN-GCB0IC',
  },
  {
    id: 'blockchain-hld-paper',
    title: 'High-level design and rapid implementation of blockchain-based real time supply chain platform',
    authors: 'R Karmakar, K Nirantar, P Hiremath, D Chaudhari',
    venue: '2022 IEEE Pune Section International Conference (PuneCon)',
    year: '2022',
    citedBy: 2,
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=sAECZMgAAAAJ&citation_for_view=sAECZMgAAAAJ:d1gkVwhDpl0C',
  },
];
 
export const navSections = [
  { id: 'ask', label: 'Ask' },
  { id: 'work', label: 'Missions' },
  { id: 'record', label: 'Flight log' },
  { id: 'toolkit', label: 'Instruments' },
  { id: 'papers', label: 'Signals' },
  { id: 'contact', label: 'Contact' },
];
