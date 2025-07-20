# Contributing to Project Co-Pilot 🤝

Thank you for your interest in contributing to Project Co-Pilot! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- Chrome browser (for extension testing)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/project-co-pilot.git
   cd project-co-pilot
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd src && npm install
   
   # Install backend dependencies
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   ```bash
   # Copy example environment file
   cp backend/env_example.txt backend/.env
   
   # Edit .env with your API keys
   # See README.md for API key setup instructions
   ```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the coding standards below
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Test backend
cd backend && python -m pytest

# Test frontend
cd src && npm test

# Test extension
# Load extension in Chrome and test functionality
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings to functions and classes
- Use meaningful variable and function names

### JavaScript/React (Frontend)
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Add PropTypes for component props

### General
- Write clear, descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic
- Use meaningful variable names

## Project Structure

```
project-co-pilot/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── assemblyai_stt.py   # Speech-to-text service
│   ├── gemini_llm.py       # LLM integration
│   ├── vector_store.py     # Vector database
│   ├── auth.py             # Authentication
│   ├── database.py         # Database connection
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend
│   ├── App.js
│   ├── components/
│   └── pages/
├── extension/              # Chrome extension
│   ├── manifest.json
│   ├── contentScript.js
│   ├── background.js
│   └── public/
└── docs/                   # Documentation
```

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd src
npm test
```

### Extension Testing
1. Load extension in Chrome
2. Test on various websites
3. Verify audio capture works
4. Check WebSocket communication

## Documentation

- Update README.md for new features
- Add inline code comments
- Update API documentation
- Create user guides if needed

## Issue Reporting

When reporting issues:
1. Use the issue template
2. Provide detailed reproduction steps
3. Include error messages and logs
4. Specify your environment (OS, browser, etc.)

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No sensitive data in commits

### PR Description
- Describe the changes made
- Link related issues
- Include screenshots for UI changes
- Mention any breaking changes

## Code Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code style checks
   - Security scans

2. **Manual Review**
   - At least one maintainer review required
   - Address review comments
   - Update PR as needed

3. **Merge**
   - Squash commits if needed
   - Merge to main branch
   - Delete feature branch

## Getting Help

- Check existing issues and PRs
- Join our community discussions
- Ask questions in issues
- Review documentation

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Project Co-Pilot! 🚀 