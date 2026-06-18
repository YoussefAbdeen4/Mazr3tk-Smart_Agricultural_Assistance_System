# 🌱 Agricultural Management System

## Overview

This project consists of:

* Laravel Backend API
* React Frontend
* AI Microservices built with FastAPI

The AI services are separated into independent repositories and communicate with the main system through APIs.

---

# AI Services Repositories

## Plant Disease Detection

```text
https://github.com/YoussefAbdeen4/plant_disease_detection
```

## Pest Detection

```text
https://github.com/YoussefAbdeen4/pest_detection
```

## Crop Yield Prediction

```text
https://github.com/YoussefAbdeen4/crop_yield
```

---

# Prerequisites

Before running the project, make sure the following software is installed.

## XAMPP

Download:

```text
https://www.apachefriends.org/download.html
```

Required Services:

* Apache
* MySQL

## Composer

Download:

```text
https://getcomposer.org/download/
```

Verify Installation:

```bash
composer --version
```

## PHP

Verify Installation:

```bash
php -v
```

## Node.js & NPM

Download:

```text
https://nodejs.org
```

Verify Installation:

```bash
node -v
npm -v
```

## Python

Download:

```text
https://www.python.org/downloads/
```

Verify Installation:

```bash
python --version
```

---

# Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

# Laravel Backend Setup

## Install Dependencies

```bash
composer install
```

## Create Environment File

### Windows

```bash
copy .env.example .env
```

### Linux / Mac

```bash
cp .env.example .env
```

## Generate Application Key

```bash
php artisan key:generate
```

## Configure Database

Update the database credentials inside `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=root
DB_PASSWORD=
```

## Run Database Migrations

```bash
php artisan migrate
```

## Run Database Seeders (Optional)

```bash
php artisan db:seed
```

## Create Storage Link

```bash
php artisan storage:link
```

## Run Laravel Server

```bash
php artisan serve
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

# React Frontend Setup

Navigate to frontend directory:

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

### Windows

```bash
copy .env.example .env
```

### Linux / Mac

```bash
cp .env.example .env
```

## Start Development Server

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Build Production Version

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

---

# FastAPI AI Services Setup

The following services must be cloned and run separately:

* Plant Disease Detection
* Pest Detection
* Crop Yield Prediction

## Clone Service Repository

Example:

```bash
git clone https://github.com/YoussefAbdeen4/plant_disease_detection.git
cd plant_disease_detection
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / MacOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run FastAPI Service

Most FastAPI projects can be started using:

```bash
uvicorn main:app --reload
```

If a custom port is required:

```bash
uvicorn main:app --reload --port 9000
```

If the entry file is not `main.py`, replace `main` with the appropriate filename.

Example:

```bash
uvicorn app:app --reload
```

## API Documentation

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

or

```text
http://127.0.0.1:<PORT>/docs
```

ReDoc:

```text
http://127.0.0.1:<PORT>/redoc
```

---

# Running the Complete System

## Step 1

Start XAMPP Services:

* Apache
* MySQL

## Step 2

Run Laravel Backend

```bash
php artisan serve
```

## Step 3

Run React Frontend

```bash
npm run dev
```

## Step 4

Run AI Services

```bash
uvicorn main:app --reload
```

Run each AI service in a separate terminal window.

---

# Useful Commands

## Laravel

```bash
php artisan serve
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan optimize:clear
```

## React

```bash
npm install
npm run dev
npm run build
npm run preview
```

## FastAPI

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

# Technologies Used

## Backend

* Laravel
* MySQL
* REST API

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## AI Services

* FastAPI
* Python
* Machine Learning Models

---

# Notes

* Ensure all environment variables are configured correctly.
* Make sure MySQL is running before starting Laravel.
* Install all dependencies before running any service.
* Each FastAPI service should be started independently.
* Verify API URLs in both Laravel and React environment files.
