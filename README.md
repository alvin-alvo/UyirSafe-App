# UyirSafe Application

## Overview

UyirSafe is a comprehensive hazard and incident reporting platform engineered to facilitate public safety and expedite emergency response. The system empowers citizens to report critical infrastructural hazards and emergencies—such as vehicle collisions, road degradation (potholes), structural obstructions (fallen trees), and flooding—in real-time.

Leveraging machine learning algorithms operating at the edge via TensorFlow.js, the application automatically classifies hazard typologies from user-uploaded imagery. This automated classification ensures high-fidelity data collection and triage. The platform implements a gamified incentive structure to encourage civic participation and provides role-based access control (RBAC) dashboards tailored for specific municipal authorities, including Law Enforcement, Public Works Departments (PWD), and Healthcare Facilities.

## Architecture

The system operates on a decoupled client-server architecture:

### Frontend Subsystem
*   **Framework:** React 18 powered by Vite
*   **Routing:** React Router DOM
*   **Geospatial Services:** `@react-google-maps/api` for coordinate mapping and reverse geocoding
*   **Machine Learning:** `@tensorflow/tfjs` and `@teachablemachine/image` for client-side convolutional neural network (CNN) inference

### Backend Subsystem
*   **Runtime:** Go (Golang) 1.22+
*   **Web Framework:** Gin HTTP web framework
*   **Data Access Layer:** GORM (Object Relational Mapper)
*   **Database:** PostgreSQL
*   **Containerization:** Docker (for database provisioning)

## Repository Structure

```text
.
├── backend/                  # Go service layer and API
│   ├── AI/                   # ML inference wrappers and handlers
│   ├── database/             # PostgreSQL connection pooling and migrations
│   ├── handler/              # HTTP route controllers
│   ├── model/                # GORM entity definitions
│   ├── docker-compose.yaml   # Docker configuration for data persistence layer
│   ├── main.go               # Application entry point and router initialization
│   └── go.mod                # Go module dependencies
└── uyir/                     # React presentation layer
    ├── public/               # Static web assets
    ├── src/
    │   ├── components/       # Reusable React UI components
    │   ├── pages/            # View-level components
    │   ├── App.jsx           # Root application component
    │   └── main.jsx          # React DOM entry point
    ├── package.json          # Node dependency manifests
    └── vite.config.js        # Build tool configuration
```

## Prerequisites

Ensure the following dependencies are installed in your environment prior to initialization:

*   Node.js (v18.0.0 or greater)
*   Go (v1.22.0 or greater)
*   Docker and Docker Compose

## Installation and Configuration

### 1. Database Provisioning

Navigate to the backend directory and initialize the PostgreSQL container:

```bash
cd backend
docker-compose up -d
```

This sequence initializes a detached PostgreSQL instance on port `5432` utilizing the credentials defined in the `docker-compose.yaml` specification.

### 2. Backend Initialization

Install the required Go modules and execute the server binary:

```bash
cd backend
go mod tidy
go run main.go
```

The backend API service will bind to `http://localhost:6969`.

### 3. Frontend Initialization

In a separate terminal session, navigate to the frontend directory, install package dependencies, and start the development server:

```bash
cd uyir
npm install
npm run dev
```

The frontend application will be accessible via `http://localhost:5173`.

**Configuration Note:** The frontend requires a `.env` configuration file within the `uyir` directory to specify the Google Maps API key if strict geocoding features are enforced.

## API Reference

### Authentication Services
*   `POST /signup`: Registers a new user entity.
*   `POST /login`: Authenticates user credentials and provisions a session.

### Report Management
*   `POST /new`: Ingests a new hazard report, including geospatial coordinates and multipart form data.
*   `GET /reports`: Retrieves the global index of all submitted reports.
*   `GET /reports/pending/`: Retrieves reports awaiting verification or status updates.
*   `POST /similarReports`: Executes a geospatial query to identify existing reports within the proximity of a specified coordinate.
*   `POST /reports/updateStatus`: Mutates the resolution status of a specified report.

### Authority Access Control Routes
*   `GET /reports/hospitals`: Filters and retrieves reports classified under medical emergencies.
*   `GET /reports/police`: Filters and retrieves reports requiring law enforcement intervention.
*   `GET /reports/pwd`: Filters and retrieves reports pertaining to municipal infrastructural damage.

### User Metrics
*   `GET /user`: Retrieves the authenticated user's submission history and cumulative incentive points.
