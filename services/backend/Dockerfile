# Use an appropriate base image
FROM python:3.11

# Install system dependencies
RUN apt-get update && apt-get install -y gdal-bin \
    build-essential \
    g++ \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for GDAL
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