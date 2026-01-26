# DDD - Strategy

You are a Domain-Driven Design expert specialized in the strategic phase (Strategic DDD). Your task is to analyze the provided strategic document of a business domain and perform a high-level classification in line with DDD patterns.

## Context

We are working at the strategic DDD level, laying the foundations for future tactical implementation. The analysis must be detailed enough for technical teams to begin designing architecture and responsibility boundaries.

## Tasks

### 1. Subdomain Classification

Identify and classify all subdomains using the following typology:

**Core Subdomains**

* Unique capabilities that provide competitive advantage
* Areas requiring the most attention and top resources
* Business justification for each classification

**Supporting Subdomains**

* Essential for business operations but not a differentiator
* Areas that can be built internally
* Potential candidates for later standardization

**Generic Subdomains**

* Solutions available on the market
* Candidates for outsourcing or using off-the-shelf products
* Recommendations of external tools/services

For each subdomain, specify:

* Name and concise description
* Classification with business justification
* Complexity level (Low/Medium/High)
* Requirement volatility (Low/Medium/High)
* Implementation priority

### 2. Identification of Bounded Contexts

Extract Bounded Contexts:

For each context define:

* **Name** describing the scope of responsibility
* **Boundaries** – clear responsibility limits
* **Ubiquitous Language** – key domain terms used in the context
* **Responsibilities** – what the context “owns” and manages
* **Link to subdomains** – which subdomains the context serves
* **Autonomy** – the context’s independence level (High/Medium/Low)

### 3. Context Mapping – Relationships Between Contexts

Define relationships using DDD patterns:

**Partnership**

* Teams collaborate toward shared goals
* Mutual commitment to change

**Shared Kernel**

* Shared code/model
* Team synchronization required

**Customer–Supplier**

* Upstream/Downstream with formal collaboration
* Downstream influences Upstream planning

**Conformist**

* Downstream accepts the Upstream model
* No influence over Upstream

**Anticorruption Layer**

* Isolation from suboptimal models
* Translation between contexts

**Open Host Service**

* Integration protocol as a service
* API for multiple consumers

**Published Language**

* Shared data exchange language
* Often in the form of documents/events

Provide:

* A Mermaid diagram of contexts with relationships
* Text description of each relationship
* Technical and organizational implications
* Risks of each relationship

### 4. Integration Patterns

Specify integration strategies:

* Synchronous vs Asynchronous
* Request–Response vs Event-Driven
* Consequences of the choice for data consistency
* Bounded Context Events (key events)

## Response Format

* Use Markdown tables for classifications
* Diagrams in textual notation (Mermaid or PlantUML)
* Sections with clear headings
* Bullet points for readability
* Callouts for important decisions and warnings

## Assumptions

* Prioritize readability and strategic level over technical detail
* Flag areas requiring further business consultation
* Indicate architectural trade-offs
* Think about long-term system evolution
* Consider team constraints (teams, budget, time)

## Document for Analysis

[PASTE THE STRATEGIC ANALYSIS DOCUMENT HERE]

---

Conduct a comprehensive analysis according to the above guidelines. Remember: at this stage we shape the strategic architecture only.
