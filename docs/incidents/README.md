# Incident records

Use this directory for production/public-preview regressions that have concrete runtime evidence and require follow-up across more than one commit or CI run.

Each incident should record:

- exact source SHA;
- failing verification run and failing boundary;
- what still passed;
- working baseline when known;
- linked GitHub issue/PR;
- final fixing source SHA and green end-to-end evidence before closure.

Do not use incident docs for speculative bugs or replace GitHub Issues with prose here. The issue tracks active work; the incident file preserves the durable evidence trail.
