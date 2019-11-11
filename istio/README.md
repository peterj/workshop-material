
## Installing Istio

1.  In the terminal/console, open the `istio-1.3.3` folder (or the folder where you downloaded/extracted the Istio to).
1.  Install Istio custom resource definitions (CRD) and wait for about a minute or so for the CRDs to get applied.

    ```bash
    helm install install/kubernetes/helm/istio-init --name istio-init --namespace istio-system
    ```
    
    >If you get an error like this: `Error: could not find tiller`, make sure you run `helm init` to initialize Helm

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

