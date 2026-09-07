import type { Education } from './types'

// Transcribed from spec §2 "Education".
export const education: Education[] = [
  {
    institution: 'London Metropolitan University',
    award: 'MSc Data Analytics, Distinction',
    dates: 'May 2025 – Jun 2026',
    modules: [
      'Data Analysis & Visualisation',
      'Programming for Data Analytics (Python, R, SQL)',
      'Data Mining & Machine Learning',
      'Statistical Modelling & Forecasting',
    ],
  },
  {
    institution: 'Tribhuvan University',
    location: 'Nepal',
    award: 'BSc Computer Science and Information Technology',
    dates: '2018 – 2023',
    project: 'Final year project: a React application consuming a Naive Bayes prediction model over a REST API.',
  },
]
