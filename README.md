# MAOS Admin

MAOS Admin is an administrative user interface for the Multi-Agent Operating System (MAOS). Built on Next.js, this project communicates with the `maos-core` via the management API. MAOS aims to provide infrastructure for AI agents to manage shared infrastructure and resources. This admin UI is intended for system administrators to handle all management tasks.

## Table of Contents

- [Features](#features)
- [Development](#development)
- [Configuration](#configuration)

## Features

- **User Management**: Create, update, and delete user accounts.
- **Agent Management**: Monitor and manage AI agents.
- **Resource Allocation**: Assign and manage shared resources.
- **System Monitoring**: Real-time system health and performance monitoring.
- **API Integration**: Seamless communication with `maos-core` via management API.

## Development

To get started with MAOS Admin, follow these steps:

1. **Clone the repository**:

2. **Install dependencies**:
```
npm install
```    

3. **Start the development server**:
```
npm run dev
```

## Configuration

To configure MAOS Admin to communicate with the maos-core, you need to set the API endpoint in the environment variables. Create a .env.local file in the root directory and add the following:
```
MAOS_CORE_API_URL=http://your-maos-core-endpoint
```

Replace http://your-maos-core-endpoint with the actual endpoint of your maos-core management API.


