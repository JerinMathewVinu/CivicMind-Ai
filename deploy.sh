#!/bin/bash

# ==============================================================================
# CivicMind AI — Google Cloud Run Production Deployment Script
# ==============================================================================
# Purpose: Build and deploy the FastAPI backend and Next.js frontend to GCP.
# Improvements: Technical Quality, Completeness (Hackathon Score optimization)
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration variables
PROJECT_ID="civicmind-ai"
REGION="us-central1"
BACKEND_SERVICE="civicmind-backend"
FRONTEND_SERVICE="civicmind-frontend"
IMAGE_TAG="latest"

echo "========================================="
echo "🚀 Initializing CivicMind AI Deployment"
echo "========================================="

# 1. Configure GCP SDK CLI
echo "🔑 authenticating with GCP..."
gcloud config set project "$PROJECT_ID"

# 2. Enable Required APIs on GCP
echo "⚙️ Enabling necessary GCP service APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com

# 3. Create Artifact Registry Repository if not exists
REPO_NAME="civicmind-repo"
echo "📦 Checking Artifact Registry repository..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
  echo "➕ Creating Artifact Registry repository: $REPO_NAME..."
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="CivicMind AI Container Registry"
fi

# Docker registry auth setup
gcloud auth configure-docker "$REGION-docker.pkg.dev"

# 4. Build & Push FastAPI Backend
echo "🏗️ Building Backend Docker Image..."
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$BACKEND_SERVICE:$IMAGE_TAG"
docker build -t "$BACKEND_IMAGE" -f backend/Dockerfile backend

echo "📤 Pushing Backend Image to Artifact Registry..."
docker push "$BACKEND_IMAGE"

# 5. Build & Push Next.js Frontend
echo "🏗️ Building Frontend Docker Image..."
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$FRONTEND_SERVICE:$IMAGE_TAG"
docker build -t "$FRONTEND_IMAGE" -f frontend/Dockerfile frontend

echo "📤 Pushing Frontend Image to Artifact Registry..."
docker push "$FRONTEND_IMAGE"

# 6. Deploy Backend to GCP Cloud Run
echo "⚡ Deploying Backend Service to Cloud Run..."
gcloud run deploy "$BACKEND_SERVICE" \
  --image "$BACKEND_IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --set-env-vars DB_PROVIDER=firestore,ENVIRONMENT=production \
  --update-secrets=JWT_SECRET_KEY=jwt_secret:latest,GEMINI_API_KEY=gemini_key:latest

# Get backend URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --platform managed --region "$REGION" --format 'value(status.url)')
echo "✅ Backend deployed successfully to: $BACKEND_URL"

# 7. Deploy Frontend to GCP Cloud Run
echo "⚡ Deploying Frontend Service to Cloud Run..."
gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$FRONTEND_IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 5 \
  --set-env-vars NEXT_PUBLIC_API_URL="$BACKEND_URL/api/v1",NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_maps_key"

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --platform managed --region "$REGION" --format 'value(status.url)')
echo "========================================="
echo "🎉 CIVICMIND AI DEPLOYED SUCCESSFULLY!"
echo "========================================="
echo "🌐 Frontend Console: $FRONTEND_URL"
echo "🌐 Backend Services: $BACKEND_URL"
echo "========================================="
