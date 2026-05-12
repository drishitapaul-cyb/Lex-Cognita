<div align="center">

# LexPath Alpha
### Causal Litigation Intelligence Engine for Indian Courts

Transforming litigation from reactive prediction into dynamic legal strategy simulation.

Built with FastAPI, React, Framer Motion, DoWhy, EconML, River, FAISS, and graph-based retrieval systems.

</div>

---

# Overview

LexPath Alpha is an AI-powered litigation intelligence system designed to model, simulate, and explain the progression of legal cases in Indian courts.

Unlike traditional legal dashboards or chatbot-based systems, LexPath treats litigation as an evolving probabilistic system.

The platform converts natural-language case narratives into:

- structured legal states
- procedural timelines
- causal risk analysis
- strategic interventions
- predictive simulations

---

# Core Features

## Narrative-to-Case Intelligence

Users describe their case in natural language.

LexPath extracts:
- delay indicators
- evidence quality
- backlog pressure
- procedural risk
- adversarial behavior

and converts them into structured legal state vectors.

---

## Dynamic Litigation Timeline

The system generates:
- P10 / P50 / P90 duration estimates
- procedural stage forecasts
- uncertainty-aware timelines
- evolving litigation projections

---

## Causal Inference Engine

Powered by:
- DoWhy
- EconML (CausalForestDML)

LexPath estimates how different legal factors influence duration and litigation risk.

Example:

> “Court backlog is contributing approximately +8 months to expected duration.”

---

## Decision Simulation Engine

Users can simulate strategic interventions such as:
- reducing adjournments
- improving evidence quality
- procedural acceleration

The engine recalculates:
- duration
- uncertainty
- litigation trajectory

in real time.

---

## Graph-Based Similar Case Retrieval

Using:
- node2vec embeddings
- FAISS vector search
- graph retrieval logic

LexPath identifies structurally similar litigation trajectories beyond keyword matching.

---

## Online Learning & Drift Detection

Powered by:
- River
- ADWIN

The system supports:
- streaming updates
- prediction calibration
- concept drift detection

---

# System Architecture

```text
Narrative Input
    ↓
Feature Extraction
    ↓
Case State Engine
    ↓
ML Prediction Layer
    ↓
Bayesian Adjustment
    ↓
Graph Similarity Retrieval
    ↓
Monte Carlo Simulation
    ↓
Causal Explainability
    ↓
Strategic Recommendations
