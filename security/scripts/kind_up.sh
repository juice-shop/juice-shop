#!/usr/bin/env bash
# Week 1: build the hardened image and deploy Juice Shop to a local kind cluster.
# Needs Docker, kind (https://kind.sigs.k8s.io) and kubectl. Then open http://localhost:3000
#
#   bash security/scripts/kind_up.sh          # create cluster + deploy
#   bash security/scripts/kind_up.sh --down   # delete the cluster
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
CLUSTER=pipelinefortress
IMAGE=pipelinefortress/juice-shop:ci

if [ "${1:-}" = "--down" ]; then kind delete cluster --name "$CLUSTER"; exit 0; fi

kind get clusters 2>/dev/null | grep -qx "$CLUSTER" || kind create cluster --name "$CLUSTER" --config security/kind/kind-config.yaml
docker build -f security/Dockerfile.hardened -t "$IMAGE" .
kind load docker-image "$IMAGE" --name "$CLUSTER"
kubectl apply -f security/k8s/namespace.yaml
kubectl apply -f security/k8s/
kubectl -n juice-shop rollout restart deploy/juice-shop
kubectl -n juice-shop rollout status deploy/juice-shop --timeout=300s
echo "Waiting for the app..."
for _ in $(seq 1 60); do curl -fsS http://localhost:3000/rest/admin/application-version && break; sleep 5; done
echo
kubectl -n juice-shop get pods -o wide
echo "Juice Shop is running at http://localhost:3000 (lab only, never expose it)."
