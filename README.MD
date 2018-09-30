# New Relic Demo Setup

## Architecture
(coming soon)

## Description
This demo consists of a small Kubernetes cluster running a Nginx server to serve static content and a basic Node.js API application with CRUD functionality on three backends:
* A [Redis](https://redis.io) cache, located within the Kubernetes cluster
* A fully-managed Postgres SQL Database ([Cloud SQL](https://cloud.google.com/sql/))
* Text files within a [Google Cloud Storage](https://cloud.google.com/storage/) bucket

New Relic is configured to monitor at both the infrastructure level and the application level.  For the infrastructure, the [Kubernetes cluster](https://docs.newrelic.com/docs/integrations/host-integrations/host-integrations-list/kubernetes-monitoring-integration#install) as well as the entire [Google Cloud Platform](https://docs.newrelic.com/docs/integrations/google-cloud-platform-integrations/getting-started/connect-google-cloud-platform-services-infrastructure) is instrumented and monitored.

Once the cluster is setup and running, load is put on the system via a [wrk](https://github.com/wg/wrk) script that will generate the appropriate CRUD requests.

NOTE: There is no authorization/authentication at all in this setup; it is purely for demonstration purposes.

