---
title: "Bare-Metal Distributed Browser Grid & HAProxy Load Router"
role: "Senior Automation Engineer"
period: "Year 1 · Q2 (Previous SaaS)"
summary: "Built an auto-scaling, bare-metal browser grid handling 10,000 parallel test threads with custom Linux cgroup memory fencing and HAProxy session routing."
domain: "Platform & Infrastructure"
metrics:
  - "10,000 Parallel Threads Sustained"
  - "85% Infrastructure Cost Savings vs. Cloud Vendors"
  - "Sub-500ms Browser Instance Provisioning"
technologies:
  - "Python"
  - "Selenium Node"
  - "HAProxy"
  - "Linux cgroups"
  - "Bash"
featured: false
---

### Situation
Outsourced browser cloud providers introduced high latency, network timeouts, and annual licensing costs exceeding $120,000. Additionally, parallel execution nodes on shared VMs frequently crashed due to unmonitored Chrome memory leaks consuming system Swap space.

### Task
Architect an in-house bare-metal browser grid infrastructure capable of managing 10,000 concurrent browser sessions with strict hardware process isolation and zero cross-session session state leakage.

### Action
* **HAProxy Dynamic Routing Layer**: Configured HAProxy as an ingress load balancer that analyzed Incoming WebDriver HTTP commands and routed session IDs (`/session/{id}`) dynamically to healthy downstream Linux worker nodes.
* **Kernel Resource Fencing**: Implemented Linux `cgroups` to restrict each headless browser process to 512MB RAM and 1 CPU core, forcibly terminating rogue processes before they starved neighboring execution threads.
* **Ephemeral Xvfb Instance Recycling**: Wrote a background daemon in Python that killed and re-spawned virtual framebuffer displays (`Xvfb :display_id`) every 50 sessions to reclaim leaked memory buffers.

### Result
* Saved **$120,000/year** in third-party vendor licensing costs.
* Achieved **99.8% session initiation reliability** across 10,000 parallel test runs.