---
title: "Building an Automated Flakiness Triage Pipeline with Stack Trace Clustering"
description: "How to automatically group, classify, and quarantine non-deterministic test failures using TF-IDF vectorization and stack trace normalization."
pubDate: 2015-11-10
draft: false
tags: ["CI/CD", "Machine Learning", "Testing Strategy", "DevOps"]
---

When running tens of thousands of automated tests daily, manual triaging of build failures becomes an impossible bottleneck. Without automated log clustering, multiple test cases failing from the exact same root cause (such as an expired SSL certificate or database deadlock) produce hundreds of duplicate tickets.

## Normalizing Unstructured Stack Traces

Raw stack traces contain dynamic noise—timestamps, thread IDs, memory addresses, and line numbers—that prevent exact string matching:

```text
# Raw Log Sample
NullPointerException at com.app.service.PaymentService.process(PaymentService.java:142) [Thread-84, Memory 0x7f8a9c]

To cluster traces effectively, first pass logs through a regular expression normalization pipeline:Replace hex addresses, thread names, and timestamps with static tokens (<MEM_ADDR>, <THREAD>, <TIMESTAMP>).Strip variable line numbers from class paths to focus strictly on call-stack geometry.Clustering via TF-IDF and Cosine SimilarityConvert normalized stack traces into high-dimensional term vectors using Term Frequency-Inverse Document Frequency (TF-IDF):$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{\vert{}D\vert{}}{\vert{}\{d \in D : t \in d\}\vert{}}\right)$$Where $t$ represents error tokens, $d$ is a given stack trace log, and $D$ is the corpus of all build failure logs.Pythonfrom sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_trace_similarity(trace_a: str, trace_b: str) -> float:
    vectorizer = TfidfVectorizer().fit_transform([trace_a, trace_b])
    vectors = vectorizer.toarray()
    # Compute Cosine Similarity between vectors
    return cosine_similarity([vectors[0]], [vectors[1]])[0][0]
When new failures yield a cosine similarity of $\ge 0.85$ against an open defect, the system links the failure to the existing issue ticket rather than creating a duplicate, providing precise metrics on bug impact.