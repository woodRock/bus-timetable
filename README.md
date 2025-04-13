# Wellington Bus Timetable App

[![Made with Fresh](https://fresh.deno.dev/fresh-badge.svg)](https://fresh.deno.dev)

A Deno Fresh application that displays real-time bus timetables and service alerts for Wellington, New Zealand, using the Metlink API.

## Features

- Real-time bus departures by stop and service ID
- Service alerts for buses, trains, and ferries
- Filter alerts by transport mode
- Auto-refreshing departure board
- Mobile-responsive design with Tailwind CSS
- Accessibility information for departures

## Prerequisites

- [Deno](https://deno.land/) v1.36.0 or higher
- A Metlink API key (obtain from [Metlink Developer Portal](https://opendata.metlink.org.nz/))

## Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd wellington-bus-timetable
   ```

2. Create a `.env` file in the project root:
   ```
   METLINK_API_KEY=your_metlink_api_key_here
   ```

3. Start the development server:
   ```
   deno task start
   ```

4. Open your browser and navigate to [http://localhost:8000](http://localhost:8000)

## Project Structure

```
├── .env                    # Environment variables (create this file)
├── deno.json               # Deno configuration
├── components/             # Reusable UI components
│   ├── DepartureRow.tsx    # Single departure row component
│   └── Navigation.tsx      # Navigation bar component
├── islands/                # Interactive components (client-side hydrated)
│   ├── DepartureBoard.tsx  # Real-time departure board 
│   └── ServiceAlerts.tsx   # Service alerts with filtering
├── routes/                 # Application routes
│   ├── index.tsx           # Homepage with search form
│   ├── service-alerts.tsx  # Service alerts page
│   ├── api/
│   │   ├── alerts.ts       # API endpoint for service alerts
│   │   └── departures.ts   # API endpoint for departures
│   └── departures/
│       ├── index.tsx       # Departures redirect handler
│       └── [stop]/
│           └── [service].tsx # Departure page for specific stop/service
└── utils/                  # Utility functions
    ├── env.ts              # Environment utilities
    └── metlink.ts          # Metlink API utilities
```

## Pages

### Home Page
- Search form for departures by stop ID and service number
- Links to service alerts

### Departures Page
- Real-time departure board with auto-refresh functionality
- Shows service status, destination, departure time, and accessibility information

### Service Alerts Page
- Displays current service alerts from Metlink
- Filter alerts by transport mode (bus, train, ferry)
- Shows detailed information including alert effect, time period, and images

## API Usage

This application uses the Metlink API to fetch real-time data. You'll need to obtain an API key from the [Metlink Developer Portal](https://opendata.metlink.org.nz/).

The app utilizes two main API endpoints:
- `https://api.opendata.metlink.org.nz/v1/stop-predictions` - For real-time departures
- `https://api.opendata.metlink.org.nz/v1/gtfs-rt/servicealerts` - For service alerts

## Customization

You can customize the Tailwind colors in `tailwind.config.ts` to match your preferred design. The current theme uses Metlink's official colors.

## License

[MIT](LICENSE)