# MongoDB ERD CLI

[![npm version](https://img.shields.io/npm/v/mongodb-erd-cli.svg?style=flat)](https://www.npmjs.com/package/mongodb-erd-cli)
[![License](https://img.shields.io/npm/l/mongodb-erd-cli.svg?style=flat)](https://github.com/mlynn/mongodb-erd-cli/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/node/v/mongodb-erd-cli.svg?style=flat)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/mongodb-erd-cli.svg?style=flat)](https://www.npmjs.com/package/mongodb-erd-cli)
[![GitHub Stars](https://img.shields.io/github/stars/mrlynn/mongodb-erd.svg?style=flat)](https://github.com/mrlynn/mongodb-erd/stargazers)

A command-line tool to generate Entity-Relationship Diagrams (ERD) from MongoDB databases. This tool analyzes your MongoDB collections and generates visual diagrams in various formats (SVG, PNG, PDF, ASCII, or Mermaid syntax).

## ✨ Features

- 🔍 Connect to MongoDB databases and analyze collection structures
- 🔗 Detect relationships between collections
- 📊 Generate Mermaid ERD diagrams
- 🎨 Support for multiple output formats (SVG, PNG, PDF)
- 🎯 Customizable theme and styling
- 🔄 Collection filtering options

## 🚀 Installation

```bash
npm install -g mongodb-erd-cli
```

## 💻 Usage

### Basic usage:
```bash
mongodb-erd --uri "mongodb://localhost:27017" --database "my_database" --output "diagram.svg"
```

### With options:
```bash
mongodb-erd \
  --uri "mongodb+srv://..." \
  --database "blog" \
  --output "blog-erd.png" \
  --format png \
  --theme dark \
  --include "posts,users,comments"
```

### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `--uri` | MongoDB connection URI | Yes | - |
| `--database` | Database name | Yes | - |
| `--output` | Output file path | Yes | - |
| `--format` | Output format (svg, png, pdf) | No | "svg" |
| `--theme` | Diagram theme (default, dark) | No | "default" |
| `--include` | Comma-separated list of collections to include | No | - |
| `--exclude` | Comma-separated list of collections to exclude | No | - |

## 🛠️ Development

1. Clone the repository:
```bash
git clone https://github.com/mlynn/mongodb-erd-cli.git
cd mongodb-erd-cli
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Run linting:
```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 