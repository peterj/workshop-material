# JFuture 2019 - Service Mesh Workshop

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
- [Helm](https://helm.sh)

Once you have everything above installed, follow the installation instructions below to install Istio.

### Istio Installation

## Installing Istio

1.  Download Istio:

```
curl -L https://git.io/getLatestIstio | ISTIO_VERSION=1.3.3 sh -
```

1. Ensure you can install Isto by running the pre-check command:

```
istioctl verify-install
```

1.  Open the `istio-1.3.3` folder in your terminal/console.
1.  Install Istio custom resource definitions (CRD) and wait for about a minute or so for the CRDs to get applied.

    ```bash
    helm install install/kubernetes/helm/istio-init --name istio-init --namespace istio-system
    ```

1.  Verify that all 23 Istio CRDs were committed to the Kubernetes api-server using the following command (you should get a response of 23):

    ```bash
    kubectl -n istio-system get crds | grep 'istio.io\|certmanager.k8s.io' | wc -l
    ```

1.  Install Istio

    ```bash
    helm install install/kubernetes/helm/istio --set tracing.enabled=true --set tracing.ingress.enabled=true --set pilot.traceSampling=100 --set pilot.resources.requests.memory="512Mi" --set grafana.enabled=true --set prometheus.enabled=true --set kiali.enabled=true --set "kiali.dashboard.jaegerURL=http://localhost:16686/jaeger" --set "kiali.dashboard.grafanaURL=http://localhost:3000" --name istio --namespace istio-system
    ```

1.  Verify the installation:

    ```bash
    $ kubectl get pods -n istio-system
    NAME                                     READY   STATUS      RESTARTS   AGE
    grafana-59d57c5c56-dvntk                 1/1     Running     0          7m41s
    istio-citadel-66f699cf68-l48hr           1/1     Running     0          7m41s
    istio-galley-fd94bc888-ftd6c             1/1     Running     0          7m41s
    istio-ingressgateway-5d6bc75c55-ngtbv    1/1     Running     0          7m41s
    istio-init-crd-10-1.3.3-6xjbw            0/1     Completed   0          9m28s
    istio-init-crd-11-1.3.3-7thmt            0/1     Completed   0          9m28s
    istio-init-crd-12-1.3.3-8m64n            0/1     Completed   0          9m28s
    istio-pilot-7979b875f6-rlmcf             2/2     Running     0          7m41s
    istio-policy-66f7dfb6b-sp74v             2/2     Running     0          117s
    istio-sidecar-injector-d8856c48f-79pn8   1/1     Running     0          7m41s
    istio-telemetry-675c94446f-sx8zm         2/2     Running     0          92s
    istio-tracing-6bbdc67d6c-pcz66           1/1     Running     0          7m41s
    kiali-8c9d6fbf6-tdjnx                    1/1     Running     0          7m41s
    prometheus-7d7b9f7844-dzw79              1/1     Running     0          7m41s
    ```

Once you see output similar to the one above, you have successfully installed Istio on your Kubernetes cluster. Next, we are going to label the default namespace, so anything we deploy in that namespace will have the Envoy proxy automatically injected:

```bash
kubectl label namespace default istio-injection=enabled
```

