FROM public.ecr.aws/x8v8d7g8/mars-base:latest

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    libxfixes3 \
    libx11-xcb1 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    libxrender1 \
    libfontconfig1 \
    libfreetype6 \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
ENV HUSKY=0

RUN npm install --include=dev --no-audit --no-fund

CMD ["/bin/bash"]


