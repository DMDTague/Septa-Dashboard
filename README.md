# SEPTA Dashboard

A data-driven dashboard offering interactive insights and analysis around SEPTA transportation metrics.  
This project gathers relevant transit data (e.g. ridership, performance, maybe historical or COVID-era data), processes and visualizes it in a user-friendly web application — available publicly.  

🔗 **Live Demo:** https://septa-covid-analysis.vercel.app  
🔗 **Repository:** https://github.com/DMDTague/Septa-Dashboard

---

## 📌 Table of Contents
- [Overview](#overview)  
- [Technologies Used](#technologies-used)  
- [Features](#features)  
- [Architecture](#architecture)  
- [How I Built It](#how-i-built-it)  
- [What I Learned](#what-i-learned)  
- [Improvements / Future Work](#improvements--future-work)   
- [Why This Matters](#why-this-matters)  
- [Summary](#summary)  

---

## 🧠 Overview

This dashboard leverages publicly available transit data related to SEPTA — transforming raw data into an interactive web interface that helps users explore ridership, performance, and transit trends.  
The goal is to make complex transit data understandable and actionable, giving insight into usage patterns, historical context (e.g. pre-/post-COVID), and performance metrics across time or routes.

---

## 🛠️ Technologies Used

### **Backend / Data**
- **JavaScript / TypeScript** (or Python — depending on data fetching/processing)  
- Data fetching from public transit data sources (APIs, CSV/JSON datasets)  
- Data cleaning, normalization, computation for metrics/trends  

### **Frontend**
- **React** (or similar modern JS framework)  
- **Vite** (or other bundler/build tool)  
- **HTML / CSS / JS** for UI & data visualizations  

### **Dev / Deployment**
- **ESLint** (or other linting/formatting tools)  
- **Vercel** for hosting & auto-deployment from GitHub :contentReference[oaicite:1]{index=1}  

---

## ⭐ Features

- 📈 **Interactive dashboard** visualizing transit/transportation data (ridership, performance)  
- 📊 **Charts & metrics** to explore historic and current transit data (e.g. ridership before/after COVID, route-level performance, trend comparisons)  
- 🌐 **Clean UI** — making complex data digestible for any user (commuter, analyst, policymaker)  
- 🔄 **Dynamic data loading / updating** — fetches from data sources to ensure up-to-date info  

---

## 🧱 Architecture


### **1. Data Layer**
- Imports data (from APIs or publicly available datasets)  
- Cleans and standardizes data (handles inconsistencies, missing fields, date/ridership normalization)  
- Computes aggregated metrics, trends, comparisons  

### **2. Frontend App**
- React-based UI to load processed data  
- Renders interactive charts, dashboards, filters (by route, date-range, ridership, etc.)  
- Provides contextual info and explanations for users  

### **3. Deployment**
- Built with a modern bundler (e.g. Vite)  
- Deployed statically via Vercel for global accessibility  

---

## 🏗️ How I Built It

1. Explored and collected public data sources related to SEPTA ridership/performance (from open data portals) :contentReference[oaicite:2]{index=2}  
2. Built data-fetching and data-cleaning scripts to standardize and aggregate data  
3. Designed data models / metrics for visualization (e.g. ridership over time, comparisons, performance indicators)  
4. Created a React-based frontend to visualize these metrics and allow user interaction/filtering  
5. Styled and built UI for readability and usability  
6. Deployed on Vercel for easy public access and shareability  

---

## 📚 What I Learned

- How to work with **public transit data** (APIs, CSV/JSON, ridership stats) and manage real-world data irregularities  
- Building a full **data → frontend → deployment** pipeline end-to-end  
- Translating raw data into **insightful visualizations** useful to non-technical users  
- Using modern web tools (React, bundlers, static hosting) to build dashboards quickly and efficiently  

---

## 🚀 Improvements / Future Work

- Add **route-level filtering and drill-down** (e.g. choose a bus or rail line to view detailed ridership/performance)  
- Include **historical vs. current comparisons** (pre-pandemic / post-pandemic / long-term trend analysis)  
- Add **export functionality** (CSV, PDF) for users or analysts  
- Provide **real-time data updates** (if supported by data source)  
- Enhance **accessibility & UX** — tooltips, help docs, responsive layout  
- Add **tests / data validation pipeline** to ensure data quality before visualization  

---

## 🎯 Why This Matters

This project:

- Helps commuters, city planners, and community members understand **transit usage and performance trends**
- Makes raw transit data **accessible, transparent, and visual** — enhancing public awareness of system performance
- Provides insights into how major events (e.g., the pandemic) affected **public transit ridership and service**
- Demonstrates end-to-end **data acquisition → processing → visualization → deployment**, showcasing a full-stack workflow

---

## ✅ Summary

**SEPTA Dashboard** is a full-stack, public-facing transit analytics tool — converting publicly available transportation data into meaningful insights through an interactive, modern web dashboard.

It showcases skills in:

- **Data fetching & cleaning**
- **Data visualization**
- **Frontend development**
- **Deployment & web hosting**
- **Communicating data-driven insights clearly**
