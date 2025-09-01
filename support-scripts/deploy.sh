#!/bin/bash
echo "Deploying AstrisTools..."
docker-compose down
docker-compose build
docker-compose up -d
echo "Deployment complete."
