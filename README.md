# Kubernetes and Service Mesh Workshop

In this workshop, we will start with the basics of Kubernetes and explanation of service meshes and explain how to do zero downtime deployments, A/B tests, how to intelligently route traffic and handle failures.

All this without writing any code or affecting your services running in production.

We will discuss the most popular patterns you can use with an Istio service mesh running on Kubernetes.

Patterns such as traffic management with intelligent routing and load balancing, policy enforcement on the interaction between services in the service mesh, handling failures, and increasing the reliability of your services and your services' telemetry and reporting will all be explained and practically demonstrated in this workshop.

## Prerequisites

Windows/Mac/Linux laptop with the following installed:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Docker](https://docs.docker.com/docker-for-mac/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) (Only install Minikube if you can't use Docker for Mac/Windows)
- [Helm](https://helm.sh) - **Don't install** version 2.16.0 as it doesn't work with Istio (any version before or after that is fine)


>Note: In order to install and run Istio on Minikube/Docker for Mac/Windows, you need to allocate enough CPU/memory. It is recommened to have at least 4 CPUs an 10 GB of memory allocated for the Kubernetes cluster.

Once you have above installed, download Istio:

```
curl -L https://git.io/getLatestIstio | ISTIO_VERSION=1.3.3 sh -
```

Ensure you can install Istio by running the pre-check command:

```
istioctl verify-install
```
