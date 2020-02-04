# Installing Istio

Before you continue, make sure you have a running Kubernetes cluster. You can run `kubectl cluster-info` to check everything is good.

1. Download the latest Istio (1.4.3):
```
curl -L https://git.io/getLatestIstio | sh -
```

1. Ensure you can install Istio by running the pre-check command:

```
istioctl verify-install
```

1.  In the terminal/console, open the `istio-1.4.3` folder (or the folder where you downloaded/extracted the Istio to).

1. Install the demo profile of Istio:

    ```bash
    istioctl manifest apply --set profile=demo
    ```

1.  Verify the installation/wait for all pods to be in the **Running** state:

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

## Uninstalling Istio

To remove all Istio resources installed on the cluster, run: 

```
istioctl manifest generate --set profile=demo | kubectl delete -f -
```

## What next?

Now that you have everything set up, you can continue with the exercises below:

- [Traffic management](./traffic/README.md)
- [Resiliency](./resiliency/README.md)
- [Security](./security/README.md)
