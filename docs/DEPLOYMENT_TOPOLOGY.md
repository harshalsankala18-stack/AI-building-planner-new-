# Production Deployment Topology & Architecture

This document describes the production cloud architecture for the AI Floor Planner platform, detailing the separation of compute between Linux and Windows runners, the database and storage abstractions, and the asynchronous job queue pipeline.

---

## 1. High-Level Architecture

The platform separates fast, lightweight I/O (REST API, WebSockets, ArchLang 2D DSL compilation, AI generation & self-healing edits) from heavy, proprietary CAD/BIM compute (AutoCAD Core Console, ETABS structural finite element analysis, Blender Cycles rendering).

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        UI["React 18 Frontend (:3000)"]
        PascalSubApp["Pascal 3D Studio (:5174 / iframe)"]
        UI <-->|postMessage Bridge| PascalSubApp
    end

    subgraph LinuxCluster ["Linux Tier (Container / Node 20-slim)"]
        API["API Server (:4200) / dist-server/server.cjs"]
        LinuxWorker["Linux Queue Worker (ai-and-light-exports)"]
        ArchLang["ArchLang 2D Engine & Exporter"]
        AIEdit["AI Self-Healing 2D/3D Editor"]
        API --> LinuxWorker
        LinuxWorker --> ArchLang
        LinuxWorker --> AIEdit
    end

    subgraph WindowsNode ["Windows Native Worker Tier"]
        WinWorker["Windows Worker / dist-server/windows-worker.cjs"]
        AutoCAD["accoreconsole.exe (AutoCAD Core Console)"]
        ETABS["ETABS .NET C# API / CSiBridge"]
        Blender["Blender 4.x Headless"]
        WinWorker --> AutoCAD
        WinWorker --> ETABS
        WinWorker --> Blender
    end

    subgraph CloudServices ["Cloud Managed Services"]
        DB[("Supabase PostgreSQL\n(Row Level Security)")]
        R2[("Cloudflare R2 Storage\n(S3 API / Presigned URLs)")]
        Redis[("Upstash / Redis\n(BullMQ Message Broker)")]
    end

    Client -->|HTTP / JSON| API
    API -->|Metadata / Snapshots| DB
    API -->|Heavy Artifacts| R2
    API -->|Job Dispatch| Redis

    Redis -->|ai-and-light-exports| LinuxWorker
    Redis -->|windows-native-cad| WinWorker

    WinWorker -->|Completed Artifacts (.dwg, .pdf, .png)| R2
    WinWorker -->|Job Status & Telemetry| DB
```

---

## 2. Pluggable Storage & Database Adapters

To ensure frictionless local development and CI testing, every production cloud adapter features an automatic fallback to local disk/in-memory:

| Subsystem | Production Cloud Mode | Local / CI Default Mode | Toggle Flag / Trigger |
| :--- | :--- | :--- | :--- |
| **Object Storage** | `CloudflareR2StorageAdapter` (`@aws-sdk/client-s3`) | `LocalDiskStorageAdapter` (`output/storage/`) | `STORAGE_PROVIDER=r2` + `R2_BUCKET` |
| **Project Database** | `SupabaseProjectRepository` (`@supabase/supabase-js`) | `LocalProjectRepository` (`output/`) | `DATABASE_PROVIDER=supabase` + `SUPABASE_URL` |
| **Job Queue** | `BullMQJobQueueAdapter` (`bullmq` + `ioredis`) | `InProcessJobQueueAdapter` (`setImmediate`) | `REDIS_URL=redis://...` |

### Storage Layer (Cloudflare R2 / S3)
- Stores large artifacts: `.dwg`, `.dxf`, `.pdf`, `.svg`, `.ifc`, `.glb`, `.arch`, PNG renders.
- Provides cryptographic SHA-256 integrity verification upon write.
- Generates secure presigned download URLs expiring after 1 hour (3600s), or delegates to `R2_PUBLIC_BASE_URL` if custom CDN routing is enabled.

### Database Layer (Supabase PostgreSQL)
- Tables managed via `supabase/migrations/001_initial_cloud_schema.sql`:
  - `projects`: High-level project metadata, bounding box, floor count.
  - `project_versions`: Immutable snapshots of `canonical-building` JSONB models.
  - `pascal_scenes`: Pascal 3D studio scene graph payloads and node hierarchies.
  - `artifacts`: Registry of generated CAD/BIM artifacts, file hashes, storage keys, and MIME types.
  - `export_jobs`: Job run lifecycle (`queued`, `active`, `completed`, `failed`, `cancelled`), progress (0-100%), and result payloads.
- Row-Level Security (RLS) is strictly enforced for client queries, while backend workers use `service_role` credentials to update job status and persist models.

---

## 3. Worker Queue Roles & Specialization

Jobs are dispatched to two distinct BullMQ queues based on runtime capability requirements:

### Queue 1: `ai-and-light-exports` (Linux Node.js 20)
- **Host:** Scalable container instances (AWS ECS, Google Cloud Run, Fly.io, or Railway).
- **Workloads:**
  - `archlang_export`: In-process 2D SVG, DXF, and PDF presentation generation using `@chanmeng666/archlang`.
  - `ai_edit_2d`: Room-lock enforced natural language floor plan editing with up to 3 repair retry loops.
  - `ai_edit_3d`: Headless 3D Pascal scene graph mutation.
  - `constraint_check`: Building code and geometric validation checks.

### Queue 2: `windows-native-cad` (Windows Node.js Worker)
- **Host:** Windows Server / Windows 11 VM (e.g. AWS EC2 `g4dn.xlarge` or Azure `NCasT4_v3`).
- **Dependencies Installed on Host:**
  - Autodesk AutoCAD (providing `accoreconsole.exe`).
  - Computers & Structures ETABS (providing `CSiAPIv1.dll` / CSiBridge).
  - Blender 4.x (`blender.exe`).
- **Workloads:**
  - `autocad_dwg_export`: Batch AutoCAD script execution via `accoreconsole.exe`.
  - `etabs_native_analysis`: Direct C# / COM ETABS API structural loading and drift calculations.
  - `blender_procedural_render`: Headless Cycles/Eevee photorealistic architectural rendering.
- **Entrypoint:**
  ```powershell
  pnpm --filter @ai-floor-planner/backend worker:windows
  # Or run the bundled standalone cjs worker:
  node packages/backend/dist-server/windows-worker.cjs
  ```

---

## 4. Environment Variables Reference

| Variable | Required In Prod? | Default (Dev) | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `4200` | Port for the HTTP API server. |
| `NODE_ENV` | Optional | `development` | Set to `production` in live environments. |
| `DATABASE_PROVIDER` | Optional | `local` | `local` or `supabase`. |
| `SUPABASE_URL` | If `supabase` | Unset | HTTPS URL of Supabase project. |
| `SUPABASE_SERVICE_ROLE_KEY`| If `supabase` | Unset | Secret service role key for worker access. |
| `STORAGE_PROVIDER` | Optional | `local` | `local` or `r2`. |
| `R2_BUCKET` | If `r2` | Unset | Cloudflare R2 bucket name. |
| `R2_ENDPOINT` | If `r2` | Unset | Cloudflare R2 S3 API endpoint. |
| `R2_ACCESS_KEY_ID` | If `r2` | Unset | Cloudflare API access key ID. |
| `R2_SECRET_ACCESS_KEY` | If `r2` | Unset | Cloudflare API secret access key. |
| `R2_PUBLIC_BASE_URL` | Optional | Unset | Custom domain or public CDN URL for downloads. |
| `REDIS_URL` | Optional | Unset | Redis connection URL (`redis://...` or `rediss://...`). |
| `WORKER_ROLE` | Optional | `all` | `all`, `api`, `linux-worker`, or `windows-worker`. |
| `AUTOCAD_PATH` | Optional | Auto-detected | Absolute path to `accoreconsole.exe`. |
| `BLENDER_PATH` | Optional | Auto-detected | Absolute path to `blender.exe`. |

---

## 5. System Health & Capability Inspection

The API exposes a comprehensive capabilities inspection route:

```http
GET /api/health/capabilities
```

**Response Example (Linux Container without Windows Native CAD):**
```json
{
  "status": "ok",
  "storageProvider": "r2",
  "databaseProvider": "supabase",
  "queueMode": "bullmq",
  "workerRole": "api",
  "capabilities": {
    "windowsCadRunner": "queued_remote",
    "etabsRunner": "queued_remote",
    "blenderRunner": "queued_remote",
    "linuxAiWorker": "local"
  }
}
```

When running in full local development mode without Redis, all capabilities report `"local"` or `"unavailable"`, guaranteeing zero external setup friction.
