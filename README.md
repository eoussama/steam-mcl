<p align=center>
   <img width=200 src="public/logo-large.png">
</p>
<h1 align=center>Steam Missing Content Lookup</h1>

<p align=center>
Easily lookup missing DLC, Sequels, Prequels, Spin-Offs, and related content from your Steam library.
</p>

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eoussama/steam-mcl.git
cd steam-mcl
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your Steam profile information in the search field
2. Supported input formats:
   - Steam profile name (e.g., "eoussama")
   - Steam ID64
   - Steam nickname
   - Profile URL
   - Profile permalink
3. Click the search button to find missing content

## Development

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> **Note**: This application is not affiliated with or endorsed by Valve Corporation or Steam.