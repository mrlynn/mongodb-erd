# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2024-04-02

### Added
- Support for ASCII output format
- Support for Mermaid syntax output format
- Improved test coverage for all output formats
- File verification in test suite

### Changed
- Updated Mermaid syntax generation to use proper ERD types
- Improved field type mapping for MongoDB to Mermaid types
- Enhanced PNG output quality with proper background handling

### Fixed
- Fixed PNG output to generate actual PNG files instead of SVG with .png extension
- Fixed field name sanitization in Mermaid syntax generation
- Fixed error handling for database existence checks

## [2.3.0] - 2024-04-02

### Added
- Initial release
- CLI tool for generating ERD diagrams from MongoDB databases
- Support for multiple output formats (SVG, PNG, PDF, ASCII, Mermaid)
- Interactive database and collection selection
- Theme support (light/dark)
- Relationship detection between collections
- Field type analysis and documentation

### Changed
- Updated command to use `mongodb-erd` instead of `mongodb-erd-cli`
- Improved error handling and logging
- Enhanced documentation

### Fixed
- Fixed output path handling
- Fixed array field handling in document structure analysis
- Fixed test suite configuration

### Security
- None

## [2.2.0] - 2025-04-02

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 

# Changelog

## [2.1.0] - 2024-04-02

### Added
- Support for ASCII output format
- Interactive database and collection selection
- Improved relationship detection
- Better field type analysis

### Changed
- Updated command to use `mongodb-erd` instead of `mongodb-erd-cli`
- Improved error handling and logging
- Enhanced documentation

### Fixed
- Fixed output path handling
- Fixed array field handling in document structure analysis
- Fixed test suite configuration

## [2.0.0] - 2024-04-02

### Added
- Initial release
- CLI tool for generating ERD diagrams from MongoDB databases
- Support for multiple output formats (SVG, PNG, PDF, ASCII, Mermaid)
- Interactive database and collection selection
- Theme support (light/dark)
- Relationship detection
- Field type analysis

### Changed
- None

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- None

## [1.0.0] - 2024-04-02

### Added
- Initial release
- CLI tool for generating ERD diagrams from MongoDB databases
- Support for multiple output formats (SVG, PNG, PDF, ASCII, Mermaid)
- Interactive database and collection selection
- Dark/light theme support
- Relationship detection between collections
- Field type analysis and documentation

### Changed
- None (initial release)

### Deprecated
- None (initial release)

### Removed
- None (initial release)

### Fixed
- None (initial release)

### Security
- None (initial release) 