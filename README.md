# Async Task Pipeline with Observability

A production-shaped async task processing system: a Django/DRF API that offloads heavy work (image resizing, PDF generation, scheduled cleanup) to Celery workers via Redis, with a live-updating Next.js dashboard, full observability (Flower, Prometheus, Grafana), Kubernetes autoscaling driven by a custom queue-depth metric, and a real deployment to AWS (EKS, RDS, ElastiCache, S3) provisioned with Terraform.

📹 **[Demo video](https://drive.google.com/file/d/1-3sjamQo_T3SYOxl2Krl5s2o5ITnUKw8/view?usp=sharing)** — Watch the demo video here.


---

## What this demonstrates

- **Async processing** — API responds instantly; work happens in background workers
- **Scheduled jobs** — a separate scheduler (Celery beat) fires recurring cleanup independent of user requests
- **Containerization** — the full stack runs identically via one `docker compose up`
- **Container orchestration** — each role (web/worker/beat) is an independently scalable Kubernetes Deployment
- **Observability** — real dashboards (Grafana) showing queue depth reacting to load in real time
- **Autoscaling on a business metric** — not CPU, but actual queue depth, via a custom Prometheus Adapter + HPA
- **Infrastructure as Code** — the entire cloud footprint (VPC, EKS, RDS, ElastiCache, S3, IAM) is Terraform, not console clicks
- **Real cloud deployment** — a public, internet-reachable URL backed by managed AWS services, not just `localhost`

---

## Architecture

### Application flow

┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Next.js │ POST │ Django REST API │ write │ PostgreSQL │
│ Dashboard │──────▶│ (creates Task, │───────▶│ Task records, │
│ (polls every 2s) │◀──────│ returns instantly)│ │ results, schedule│
└─────────────────┘ GET └────────┬───────────┘ └──────────────────┘
│ enqueue ▲
▼ │
┌──────────────┐ │
│ Redis │ │
│ task queue │ │
└───────┬──────┘ │
┌────────────┴────────────┐ │
▼ ▼ │
┌───────────────┐ ┌───────────────┐ │
│ Celery Workers │ │ Celery Beat │ │
│ (image resize, │ │ (scheduled │──────────┘
│ PDF, cleanup) │ │ cleanup timer) │
└───────┬───────┘ └───────────────┘
│
▼
┌───────────────┐
│ S3 (media) │
│ shared storage │
│ across pods │
└───────────────┘

**Request flow:** the frontend calls the Django API, which writes a `Task` row to PostgreSQL and enqueues a job onto Redis — then returns immediately. A Celery worker (running as a separate process/pod) picks the job off Redis, executes it, and writes the result back to PostgreSQL and S3. Celery beat runs independently on a timer, firing scheduled cleanup with no user involvement.

### Cloud infrastructure (AWS)

           Internet
                             │
                             ▼

┌──────────────────────────────────────────────────────────────────┐
│ AWS VPC (10.0.0.0/16) │
│ │
│ ┌─────────────────── Public Subnets ───────────────────┐ │
│ │ Elastic Load Balancer │ │
│ └───────────────────────┬───────────────────────────────┘ │
│ ▼ │
│ ┌─────────────────── Private Subnets ──────────────────────────┐ │
│ │ EKS Cluster (3 × t3.micro nodes) │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│ │ │ web │ │ worker │ │ beat │ + HPA autoscaling │ │
│ │ │ pod │ │ pods │ │ pod │ on queue depth │ │
│ │ └────┬────┘ └────┬────┘ └─────────┘ │ │
│ │ │ │ │ │
│ └────────┼──────────────┼──────────────────────────────────────┘ │
│ ▼ ▼ │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ RDS PostgreSQL │ │ ElastiCache │ │
│ │ db.t3.micro │ │ Redis │ │
│ └───────────────┘ └───────────────┘ │
│ │
│ S3 (media storage) ECR (container images) │
└──────────────────────────────────────────────────────────────────┘

The application runs on a 3-node EKS cluster inside a VPC with public/private subnets. PostgreSQL and Redis are **not** run as pods — they're managed AWS services (RDS, ElastiCache) reached over the private network. Uploaded/generated files live in S3, not on any single pod's local disk, so any worker pod can read a file another pod wrote.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Backend** | Django, Django REST Framework, Celery, Python |
| **Frontend** | Next.js, TypeScript, Tailwind CSS v4, Framer Motion |
| **Data** | PostgreSQL, Redis |
| **File storage** | AWS S3 (via `django-storages`) |
| **Containers** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (Deployments, Services, Jobs, HPA, ConfigMaps/Secrets) |
| **Observability** | Flower, Prometheus, Grafana, `redis_exporter`, Prometheus Adapter |
| **Cloud** | AWS EKS, RDS, ElastiCache, S3, ECR, VPC, IAM |
| **Infrastructure as Code** | Terraform |

---

## The three task types

| Type | What it does |
|---|---|
| **PDF Report** | Generates a PDF. If a CSV is uploaded, its contents are rendered as a styled table; otherwise a placeholder report is generated. |
| **Image Resize** | Resizes an uploaded image into a 300×300 thumbnail. |
| **Cleanup** | Manually triggered: deletes every other task currently on the dashboard (and their files). A separate, automatic version (`cleanup_old_tasks`) runs on a schedule via Celery beat, removing anything older than 24 hours. |

---


