# MongoDB ERD CLI

[![npm version](https://img.shields.io/npm/v/mongodb-erd-cli.svg)](https://www.npmjs.com/package/mongodb-erd-cli)
[![License](https://img.shields.io/npm/l/mongodb-erd-cli.svg)](https://github.com/mrlynn/mongodb-erd/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/mongodb-erd-cli.svg)](https://www.npmjs.com/package/mongodb-erd-cli)
[![Downloads](https://img.shields.io/npm/dm/mongodb-erd-cli.svg)](https://www.npmjs.com/package/mongodb-erd-cli)
[![GitHub stars](https://img.shields.io/github/stars/mrlynn/mongodb-erd.svg)](https://github.com/mrlynn/mongodb-erd)

A command-line tool to generate Entity-Relationship Diagrams (ERD) from MongoDB databases. This tool analyzes your MongoDB collections and generates visual diagrams in various formats (SVG, PNG, PDF, ASCII, or Mermaid syntax).

## ✨ Features

- 🔍 Connect to MongoDB databases and analyze collection structures
- 🔗 Detect relationships between collections
- 📊 Generate Mermaid ERD diagrams
- 🎨 Support for multiple output formats (SVG, PNG, PDF)
- 🎯 Customizable theme and styling
- 🔄 Collection filtering options
- 🔄 Environment variable support for sensitive data

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
| `--uri` | MongoDB connection URI | Yes* | - |
| `--database` | Database name | Yes* | - |
| `--output` | Output file path | No | Auto-generated |
| `--format` | Output format (svg, png, pdf, ascii, mermaid) | No | "svg" |
| `--theme` | Diagram theme (light, dark) | No | "light" |

> *Can be set via environment variables instead (see below).
| `--include` | Comma-separated list of collections to include | No | - |
| `--exclude` | Comma-separated list of collections to exclude | No | - |

### Environment Variables

You can use environment variables instead of command line arguments for sensitive data:

```bash
# Set environment variables
export MONGODB_URI="mongodb://localhost:27017"
export MONGODB_DATABASE="my_database"

# Run the tool
mongodb-erd
```

Or create a `.env` file in your project:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=my_database
```

The tool will check for environment variables before using command line arguments.

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