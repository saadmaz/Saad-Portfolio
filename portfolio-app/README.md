# Portfolio Application

## Overview
This portfolio application is designed to showcase personal blogs, educational information, work experience, and categorized skills. It includes features for adding and organizing blogs, scraping newsletters for LinkedIn, and displaying skills in various categories.

## Features
- **Blog Management**: Add and organize blog posts.
- **Education Information**: Structure and display educational details.
- **Work Experience**: Organize and showcase work experience.
- **Skills Categorization**: Categorize skills into soft skills, people skills, front-end, back-end, and DevOps.
- **Newsletter Scraping**: Scrape newsletters for LinkedIn updates.

## Project Structure
```
portfolio-app
├── src
│   ├── index.html
│   ├── index.css
│   ├── index.js
│   ├── components
│   │   ├── header.js
│   │   ├── navbar.js
│   │   └── footer.js
│   ├── pages
│   │   ├── blogs.js
│   │   ├── education.js
│   │   ├── experience.js
│   │   └── skills.js
│   ├── styles
│   │   ├── header.css
│   │   ├── buttons.css
│   │   ├── skills.css
│   │   └── responsive.css
│   ├── services
│   │   ├── newsletterScraper.js
│   │   └── dataManager.js
│   ├── assets
│   │   └── data.json
│   └── types
│       └── index.js
├── package.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd portfolio-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
- Start the application:
  ```
  npm start
  ```
- Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.