# MongoDB ERD CLI

<div align="center">

```ascii
███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗     ███████╗██████╗ ██████╗
████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗██╔══██╗    ██╔════╝██╔══██╗██╔══██╗
██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║██║  ██║    █████╗  ██████╔╝██║  ██║
██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║  ██║    ██╔══╝  ██╔══██╗██║  ██║
██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝██████╔╝    ███████╗██║  ██║██████╔╝
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝     ╚══════╝╚═╝  ╚═╝╚═════╝
```

[![Build Status](https://github.com/mlynn/mongodb-erd-cli/workflows/CI/badge.svg)](https://github.com/mlynn/mongodb-erd-cli/actions)
[![License](https://img.shields.io/github/license/mlynn/mongodb-erd-cli)](https://github.com/mlynn/mongodb-erd-cli/blob/main/LICENSE)
[![Version](https://img.shields.io/github/v/release/mlynn/mongodb-erd-cli)](https://github.com/mlynn/mongodb-erd-cli/releases)
[![Node.js Version](https://img.shields.io/node/v/mongodb-erd-cli)](https://nodejs.org)
[![Dependencies](https://img.shields.io/david/mlynn/mongodb-erd-cli)](https://david-dm.org/mlynn/mongodb-erd-cli)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Last Commit](https://img.shields.io/github/last-commit/mlynn/mongodb-erd-cli)](https://github.com/mlynn/mongodb-erd-cli/commits/main)
[![Downloads](https://img.shields.io/npm/dm/mongodb-erd-cli)](https://www.npmjs.com/package/mongodb-erd-cli)
[![Stars](https://img.shields.io/github/stars/mlynn/mongodb-erd-cli)](https://github.com/mlynn/mongodb-erd-cli/stargazers)

A command-line tool that generates Entity Relationship Diagrams (ERD) from MongoDB databases using Mermaid syntax.

</div>

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