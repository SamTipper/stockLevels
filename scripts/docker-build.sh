#/bin/bash

cd $(git rev-parse --show-toplevel)

# Create builder
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker buildx rm builder || true
docker buildx create --name builder --driver docker-container --use
docker buildx use builder

# Run build
docker buildx build -f docker/Dockerfile --platform linux/amd64,linux/arm/64 --tag registry.coombszy.com/stocklevels:latest . --push

