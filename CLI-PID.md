# Project Initiation Document (PID) - MongoDB ERD CLI Tool

## Project Title

**MongoDB ERD CLI - Command Line Entity Relationship Diagram Generator**

## Project Overview

This project is a command-line interface (CLI) tool that extends the MongoDB ERD Generator web application into a standalone utility. It enables developers to generate Entity Relationship Diagrams directly from their terminal, making it ideal for documentation automation, CI/CD pipelines, and local development workflows.

## Relationship to Parent Project

This CLI tool is derived from the MongoDB ERD Generator web application but focuses on command-line usage rather than web interface interaction. It maintains the core functionality of:
- MongoDB database introspection
- Relationship inference
- ERD generation using Mermaid
While removing the web-specific components and adding CLI-specific features.

## Core Objectives

1. **Command Line Interface**
   - Provide an intuitive CLI using commander.js
   - Support environment variables for configuration
   - Enable file output in multiple formats
   - Allow collection filtering and customization

2. **Database Analysis**
   - Connect to MongoDB instances using connection strings
   - Analyze collection structures and field types
   - Detect relationships between collections through:
     - ObjectId references
     - Field name patterns
     - Array references
     - Nested documents

3. **Relationship Detection**
   - Identify primary keys (`_id` fields)
   - Detect foreign key references (ObjectId fields)
   - Infer one-to-many relationships from arrays
   - Analyze nested document structures
   - Handle both singular and plural collection names

4. **Diagram Generation**
   - Generate Mermaid ERD syntax
   - Support multiple output formats (SVG, PNG, PDF)
   - Include field types and annotations
   - Show relationship cardinality
   - Provide clear relationship labels

## Technical Architecture

### Core Components

1. **CLI Interface (`bin/mongodb-erd.js`)**
   - Command-line argument parsing
   - Environment variable support
   - Output format selection
   - Theme customization

2. **Database Introspection (`src/lib/mongoIntrospector.js`)**
   - MongoDB connection handling
   - Collection analysis
   - Field type detection
   - Relationship inference

3. **Diagram Generation (`src/lib/mermaidGenerator.js`)**
   - Mermaid syntax generation
   - Entity definition formatting
   - Relationship visualization
   - Field annotation handling

4. **Configuration Management (`src/utils/config.js`)**
   - Environment variable loading
   - Default settings
   - Configuration validation

### Key Features

1. **Database Connection**
   ```bash
   mongodb-erd --uri "mongodb+srv://..." --database "sample_db"
   ```
   - Support for connection strings
   - Environment variable configuration
   - Connection pooling and cleanup

2. **Output Customization**
   ```bash
   mongodb-erd -d sample_db -o diagram.svg --theme dark
   ```
   - Multiple output formats
   - Theme selection
   - Custom file naming

3. **Collection Filtering**
   ```bash
   mongodb-erd -d sample_db --include "users,posts,comments"
   ```
   - Include specific collections
   - Exclude collections
   - Pattern matching

## Implementation Guidelines

### Code Structure
```
mongodb-erd-cli/
├── bin/
│   └── mongodb-erd.js      # CLI entry point
├── src/
│   ├── lib/
│   │   ├── mongoIntrospector.js
│   │   └── mermaidGenerator.js
│   ├── utils/
│   │   └── config.js
│   └── index.js
├── package.json
└── README.md
```

### Development Standards
1. **Code Quality**
   - Clear error messages
   - Proper error handling
   - Resource cleanup
   - Async/await usage
   - Type checking

2. **Documentation**
   - JSDoc comments
   - Usage examples
   - Error solutions
   - Configuration options

3. **Testing**
   - Unit tests for core functions
   - Integration tests
   - Connection error handling
   - Edge case coverage

## Usage Examples

1. **Basic Usage**
   ```bash
   export MONGODB_URI="mongodb+srv://..."
   mongodb-erd -d sample_mflix -o movie-db.svg
   ```

2. **Custom Configuration**
   ```bash
   mongodb-erd --uri "$URI" --database "blog" \
     --output "blog-erd.png" \
     --format png \
     --theme dark \
     --include "posts,users,comments"
   ```

3. **Programmatic Usage**
   ```javascript
   const { generateERD } = require('mongodb-erd-cli');
   
   await generateERD({
     uri: process.env.MONGODB_URI,
     database: 'sample_db',
     output: 'diagram.svg',
     theme: 'default'
   });
   ```

## Development Roadmap

1. **Core Functionality** (Week 1)
   - [x] Basic CLI setup
   - [x] MongoDB connection
   - [x] ERD generation
   - [ ] Multiple output formats
   - [ ] Theme support

2. **Enhanced Features** (Week 2)
   - [ ] Configuration files
   - [ ] Custom templates
   - [ ] Batch processing
   - [ ] Interactive mode
   - [ ] Relationship customization

3. **Documentation** (Week 3)
   - [ ] API documentation
   - [ ] Usage examples
   - [ ] Best practices
   - [ ] Troubleshooting guide

4. **Distribution** (Week 4)
   - [ ] NPM package
   - [ ] GitHub repository
   - [ ] CI/CD setup
   - [ ] Version management

## Security Considerations

1. **Connection Security**
   - Secure handling of connection strings
   - Support for authentication options
   - Environment variable usage
   - Connection string validation

2. **File Operations**
   - Secure temp file handling
   - Proper file permissions
   - Resource cleanup
   - Error recovery

## Testing Strategy

1. **Unit Tests**
   - Core function testing
   - Input validation
   - Error handling
   - Edge cases

2. **Integration Tests**
   - Database connections
   - File generation
   - CLI interface
   - End-to-end workflows

3. **Performance Tests**
   - Large database handling
   - Memory usage
   - Connection pooling
   - File size limits

## Maintenance Plan

1. **Version Updates**
   - Dependency management
   - MongoDB driver updates
   - Mermaid syntax changes
   - CLI argument changes

2. **Bug Fixes**
   - Error reporting
   - Issue tracking
   - Hotfix process
   - Version control

3. **Feature Requests**
   - Enhancement tracking
   - Priority management
   - Backward compatibility
   - Documentation updates

## Distribution Strategy

1. **NPM Package**
   - Package name: mongodb-erd-cli
   - Semantic versioning
   - README documentation
   - NPM keywords

2. **GitHub Repository**
   - Open source licensing
   - Contribution guidelines
   - Issue templates
   - CI/CD workflows

3. **Documentation**
   - Installation guide
   - Usage examples
   - API reference
   - Troubleshooting guide 