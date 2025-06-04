# OutFlo Frontend

A modern React application for managing LinkedIn outreach campaigns with AI-powered message generation and profile scraping capabilities.

## Features

- **Dashboard**: Overview of campaigns and key metrics
- **Campaign Management**: Create, edit, and manage LinkedIn outreach campaigns
- **Message Generator**: AI-powered personalized LinkedIn message generation
- **Profile Scraper**: Extract LinkedIn profile data for campaigns
- **Profile Management**: View and manage scraped profiles
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on port 8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout component
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard overview
│   ├── Campaigns.tsx   # Campaign list
│   ├── CampaignDetail.tsx # Campaign details
│   ├── MessageGenerator.tsx # AI message generation
│   ├── ProfileScraper.tsx # Profile scraping
│   └── Profiles.tsx    # Profile management
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/             # TypeScript type definitions
│   └── index.ts       # Application types
├── App.tsx            # Main app component
├── index.tsx          # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## API Integration

The frontend communicates with the backend API running on `http://localhost:8000`. The API client is configured in `src/services/api.ts` with the following endpoints:

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Messages
- `POST /api/messages/generate` - Generate personalized message
- `POST /api/messages/variations` - Generate message variations

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles/scrape` - Scrape LinkedIn profiles
- `DELETE /api/profiles/:id` - Delete profile

## Styling

The application uses Tailwind CSS with a custom design system:

### Colors
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary actions
- **Success**: Green for positive actions
- **Warning**: Yellow for warnings
- **Danger**: Red for destructive actions

### Components
Custom CSS classes are defined in `src/index.css`:
- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button styles
- `.input`, `.textarea` - Form input styles
- `.card`, `.card-header`, `.card-content` - Card layouts
- `.badge` - Status indicators

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Update navigation in `src/components/Layout.tsx`

### Adding New API Endpoints

1. Add the endpoint function to `src/services/api.ts`
2. Add corresponding TypeScript types to `src/types/index.ts`
3. Use the endpoint in your components

### Styling Guidelines

- Use Tailwind utility classes for styling
- Follow the existing color scheme and spacing
- Use the predefined component classes for consistency
- Ensure responsive design with Tailwind's responsive prefixes

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Environment Variables

Create a `.env` file in the frontend directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:8000
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Write responsive components
4. Test your changes thoroughly
5. Update documentation as needed

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the backend is running on port 8000
2. **Build Errors**: Clear node_modules and reinstall dependencies
3. **Styling Issues**: Check Tailwind CSS configuration and imports

### Development Tips

- Use React Developer Tools for debugging
- Check the browser console for errors
- Use the Network tab to debug API calls
- Ensure proper TypeScript types for better development experience 