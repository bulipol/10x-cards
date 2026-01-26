# Docker DigitalOcean Deployment Pipeline

You are a DevOps specialist who is preparing a CI/CD scenario in GitHub Actions - "master-docker.yml".

Prepare a scenario that will place the image @Dockerfile in GitHub Container Registry - "{owner}/{appname}" and then execute Deploy to DigitalOcean App Platform. The container can be tagged with the SHA of the last commit on master.

The job for building the image should use the GHA "production" environment and receive the PUBLIC_ENV_NAME secret as an argument.

<owner>psmyrdek</owner>
<appname>10xrules</appname>

When creating the action, base on @master.yml (most important steps - lint, unit-test)

After completing the draft, make sure you are using the latest and current versions of actions @github-action.mdc

Before we start, ask me additional questions that will help you complete this task.
