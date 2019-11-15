# Service Resiliency Exercises

You need full Istio installation that includes Grafana, Jaeger and Kiali to use the dashboard. Note that you can still do the exercies and use `curl` to observe the errors/timeouts/retries.

You need the Helloweb and Greeter services deployed (look in the [Traffic Management exercises](../traffic/README.md) on how to deploy those services)

## Looking at the dashboard

1. Open Grafana (http://localhost:3000) and look around the dashboards:

```bash
kubectl -n istio-system port-forward $(kubectl -n istio-system get pod -l app=grafana -o jsonpath='{.items[0].metadata.name}') 3000:3000 &
```

1. Open Jaeger (http://localhost:16686) and look around:

```bash
kubectl port-forward -n istio-system $(kubectl get pod -n istio-system -l app=jaeger -o jsonpath='{.items[0].metadata.name}') 16686:16686 &
```

1. Open Kiali (http://localhost:20001/kiali/console) and look around:

```
kubectl -n istio-system port-forward $(kubectl -n istio-system get pod -l app=kiali -o jsonpath='{.items[0].metadata.name}') 20001:20001 &
```
>Note if you get an error saying Kiali secret is not found, make sure you create one like this: 
   ```
   cat <<EOF | kubectl apply -f -
    apiVersion: v1
    kind: Secret
    metadata:
      name: kiali
      namespace: istio-system
      labels:
        app: kiali
    type: Opaque
    data:
      username: YWRtaW4=
      passphrase: YWRtaW4=
    EOF
    ```
> Once you created the secret, restart the Kiali pod. Run `kubectl get pods -n istio-system` to get the name of the Kiali pod and then use `kubectl delete pod [kiali-pod-name] -n istio-system` to delete the pod.


## Slowing Services Down

1. Inject a 2 second delay to the greeter service for 50% and observe how this affects the dashboards in Grafana. Can you find the traces in Jaeger? Increase the delay to 6 second - do you see any changes in Grafana dashboards/Jaeger?

**Hint**
Use the snippet below from the Virtual Service to inject failures:

```yaml
fault:
    delay:
        percent: 5
        fixedDelay: 10s
```

## Breaking the Services

1. Update the Greeter service to respond with 501 HTTP status code in 70% of the cases. Can you find the dashboards that are being affected by this change? How does the 501 manifest itself in the dashboards and traces?

**Hint**

```yaml
fault:
    abort:
        percent: 10
        httpStatus: 404
```

## Getting Advanced

1. Update the Greeter service, so it sends 404 in 30% of the time and a 4 second delay for 20% of the time. Look at the graphs and try to see where these changes are manifested.

1. Return 501 HTTP status code for 50% of the requests that are coming from the iPhones, all other traffic should be unaffected.
