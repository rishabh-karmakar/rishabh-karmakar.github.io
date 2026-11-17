/*
 * The test set for the retrieval engine. Each case is a requirement a recruiter
 * might paste, with the grade a fair reader of this site would give it:
 *   strong  = the site has direct evidence
 *   partial = something related, but not the thing itself
 *   none    = not here
 * The labels are a human judgement of what the site supports, and they stay
 * put when the engine gets one wrong. The thresholds in
 * search.js were tuned against these same cases, so the score is a regression
 * check, not a held-out measure.
 */
export const evalCases = [
  { text: 'Build and ship LLM-powered features, including retrieval-augmented generation and agent workflows', expect: 'strong' },
  { text: 'Work directly with customers and business stakeholders to turn requirements into production systems', expect: 'strong' },
  { text: 'Strong Python and experience with a modern ML framework such as PyTorch', expect: 'strong' },
  { text: 'Experience with vector databases, embeddings and semantic search', expect: 'strong' },
  { text: 'Deploy and operate services on a major cloud platform with Docker and Kubernetes', expect: 'strong' },
  { text: 'Evaluate model quality and keep production systems reliable', expect: 'strong' },
  { text: 'Communicate clearly through demos, documentation and mentoring', expect: 'strong' },
  { text: 'Published research or a strong academic background in machine learning', expect: 'strong' },
  { text: 'Built agentic AI workflows with large language models', expect: 'strong' },
  { text: 'Experience with CRM platforms in financial services', expect: 'strong' },
  { text: 'Peer-reviewed publications in machine learning', expect: 'strong' },
  { text: 'Hands-on experience with computer vision', expect: 'strong' },
  { text: 'Experience with blockchain and smart contracts', expect: 'strong' },
  { text: 'Experience with Kubernetes and Docker in production', expect: 'strong' },
  { text: 'Experience mentoring junior engineers', expect: 'strong' },
  { text: 'Experience with natural language processing and transformers', expect: 'strong' },
  { text: 'Track record of automating manual processes', expect: 'strong' },
  { text: 'Has he won any hackathons or competitions', expect: 'strong' },

  { text: 'PhD in machine learning or a related field', expect: 'partial' },
  { text: 'Experience leading a team of machine learning researchers', expect: 'partial' },
  { text: 'Comfortable presenting to executives and non-technical audiences', expect: 'partial' },
  { text: 'Experience with quantitative trading strategies', expect: 'partial' },

  { text: 'Deep expertise in Rust and systems programming', expect: 'none' },
  { text: 'Experience designing custom silicon for AI accelerators', expect: 'none' },
  { text: 'Experience with Golang microservices', expect: 'none' },
  { text: '10+ years of experience managing large engineering organizations', expect: 'none' },
  { text: 'Experience training large foundation models from scratch on GPU clusters', expect: 'none' },
  { text: 'Experience managing a team of ten or more direct reports', expect: 'none' },
  { text: 'Fluent in Japanese, written and spoken', expect: 'none' },
  { text: 'Experience building native iOS apps in Swift', expect: 'none' },
  { text: 'Experience with reinforcement learning for robotics', expect: 'none' },
  { text: 'Experience running an enterprise sales team', expect: 'none' },
];
