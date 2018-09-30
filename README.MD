# New Relic Demo Setup

## Architecture
(coming soon)

## Description
This demo consists of a small Kubernetes cluster ([GKE](https://cloud.google.com/kubernetes-engine/)) running a Nginx server to serve static content and a basic Node.js API application with CRUD functionality on three backends:
* A [Redis](https://redis.io) cache, located within the Kubernetes cluster
* A fully-managed Postgres SQL Database ([Cloud SQL](https://cloud.google.com/sql/))
* Text files within a [Google Cloud Storage](https://cloud.google.com/storage/) bucket

New Relic is configured to monitor at both the infrastructure level and the application level.  For the infrastructure, the [Kubernetes cluster](https://docs.newrelic.com/docs/integrations/host-integrations/host-integrations-list/kubernetes-monitoring-integration#install) as well as the entire [Google Cloud Platform](https://docs.newrelic.com/docs/integrations/google-cloud-platform-integrations/getting-started/connect-google-cloud-platform-services-infrastructure) is instrumented and monitored.

Once the cluster is setup and running, load is put on the system via a [wrk](https://github.com/wg/wrk) script that will generate the appropriate CRUD requests.

NOTE: There is no authorization/authentication at all in this setup; it is purely for demonstration purposes.

## Notes

In order for the managed database to be reachable from GKE, you need to do two things (in order):
1. [Follow the directions here](https://cloud.google.com/sql/docs/postgres/connect-kubernetes-engine) to create a sidecar proxy connection
2. Ensure that the GKE cluster itself has the appropriate service access permissions to access Cloud SQL
   If you forget to do this when you create the cluster, you will need to create a new node pool with the correct permissions and then move the pods over from the original node pool.  Here is an example command to create a new node pool with the correct SQL permissions
   ```
   gcloud container node-pools create cluser-a \
   --cluster new-relic-k8s --zone us-central1 \
   --num-nodes 2 \
   --scopes https://www.googleapis.com/auth/devstorage.read_write,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append,https://www.googleapis.com/auth/sqlservice.admin,https://www.googleapis.com/auth/cloud-platform 
   ```

The database was setup with exactly two columns:
   * ```key VARCHAR(32) UNIQUE NOT NULL```
   * ```value VARCHAR(64) NOT NULL```
   * ```PRIMARY KEY(key)```