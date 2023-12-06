FROM python:3.11-buster

# Install GDAL system dependencies from Debian Stretch (9) repositories
RUN echo "deb http://deb.debian.org/debian stretch main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        gdal-bin=2.2.3+dfsg-2 \
        libgdal-dev=2.2.3+dfsg-2 \
    && rm -rf /var/lib/apt/lists/*

# Set the GDAL configuration for pip
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN mkdir app
WORKDIR /app

ENV PATH="${PATH}:/root/.local/bin"
ENV PYTHONPATH=.

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY src/ .