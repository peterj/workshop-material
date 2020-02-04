# Traffic Management Exercises

These exercises will guide you through deploying Helloweb and Greeter service and trying out different ways to manage traffic between those sevrices.

## Basic Hello Web

In this part you will deploy the Hello Web and a Greeter service v1 to the cluster. Once you've deployed it, you will create gateway and a virtual service to be able to access the Hello Web from outside.

## 1. Deploy the Hello Web and Greeter Service v1

1. Create the Hello Web deployment and service with Istio sidecar injected:

    ```bash
    kubectl create -f helloweb.yaml
    ```

1. Verify the deployment by running `kubectl get deploy helloweb`:

    ```bash
    $ kubectl get deploy helloweb
    NAME       DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    helloweb   3         3         3            3           2m
    ```

1. Also run `kubectl get pods` to ensure there are 2 containers being created for each replica (one is the hello web, the second one is the Envoy proxy)

1. Create the Greeter V1 deployment and service with Istio sidecar injected:

    ```bash
    kubectl create -f greeter-v1.yaml
    ```

1. Verify the deployment by running `kubect get deploy greeter-service-v1`:

    ```bash
    $ kubectl get deploy greeter-service-v1
    NAME                 DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    greeter-service-v1   3         3         3            3           44s
    ```

## 2. Access the Hello Web service

We will use the Istio ingress gateway to access our service. Since you can't expose services through an external IP (i.e. the LoadBalancer service type), you will need to run a port forward command, that will forward all traffic from your computer (e.g. `http://localhost:8080`) to the service running inside the cluster (`istio-ingressgateway`) 

Regardless, you still need to deploy a gateway and a virtual service.

1. Deploy the gateway:

```bash
kubectl create -f gateway.yaml
```

1. Deploy the Hello Web virtual service:

```bash
kubectl create -f helloweb-virtualservice.yaml
```

1. Open a separate terminal window and run:

```
kubectl port-forward -n istio-system --address localhost service/istio-ingressgateway 8080:80
```
>Note: you can also run the above command with `sudo` and expose the service on `http://localhost`, but it doesn't make much difference - everything will work the same way.


1. Now you can try and access the service at `http://localhost:8080`


## 3. Clean up (OPTIONAL)

If you are continuing with the next exercise, you don't have to delete anything. If you are doing a different exercise, make sure you remove everything (you can leave the gateway as we won't change it).

```bash
kubectl delete -f helloweb.yaml
kubectl delete -f greeter-v1.yaml
kubectl delete -f helloweb-virtualservice.yaml
```

# Traffic Splitting

## 1. Deploy Hello Web and two versions of the Greeter service

1. Make sure you have Hello web and Greeter service v1 and v2 deployed, with the corresponding virtual services (one for Hello web and another one for Greeter service). If you already have Hello web and greeter v1 deploy, only deploy the greeter service v2 and the greeter virtual service.

    ```bash
    kubectl apply -f greeter-v2.yaml
    kubectl apply -f greeter-virtualservice.yaml
    ```

## 2. Deploy the destination rule

1. Deploy the destination rule where we define the version subsets (v1 and v2):

    ```bash
    kubectl apply -f dest-rule.yaml
    ```

1) Open http://localhost:8080 and refresh the page a couple of times - you should get different responses from the greeter service, because we haven't defined any traffic routing rules yet.

## 3. Split traffic between v1 and v2 versions of the Greeter service

1. Update the virtual service to route 30% of traffic to the v2 version and 70% to the v1 version of the Greeter service.

Hint: Look at the examples in `greeter-virtualservice-all-v1.yaml` and `greeter-virtualservice-all-v2.yaml`.

## 4. Deploy a v3 version of the Greeter service

The v3 version of the greeter service uses an image named `learnistio/greeter-service:3.0.0`. Create the v3 deployment, update the destination rule and the virtual service, so 10% of the traffic goes to v3, 40% goes to v2 and 50% goes to v1. Once you verified that works, route all traffic to v3 version.

## 5. Advanced traffic routing

1. Deploy the virtual service that routes requests coming from Firefox to v2, and all other requests to v1:

```bash
kubectl apply -f greeter-virtualservice-v2-firefox.yaml
```

>You can use the following `curl` command to 'fake' the requests from a Firefox browser:
    ```
    curl -H "User-Agent: Firefox" localhost:8080
    ```

1. Update the virtual service to route all traffic with header `x-user: alpha` to v3 and traffic with header `x-user: beta` to v2, while all other traffic gets routed to v1.

# Movie Web (external API)

Make sure you clean up the Hello web and Greeter service deployments, virtual services, and destination rules before continuing. You can use `kubectl delete -f [filename.yaml]` to delete all resources that were defined in the `filename.yaml`. 

We will deploy a Movie Web frontend that tries to access and talk to an external API (themoviedb.org).

## 1. Obtain the API and deploy the Movie Web

1. Get the API from http://themoviedb.org (detailed instructions are [here](https://developers.themoviedb.org/3/getting-started/introduction)) and update the `movieweb.yaml` (replace the value <API_KEY_HERE> with an actual API KEY)
1. Deploy the Movie Web + virtual service

    ```bash
    kubectl create -f movieweb.yaml
    kubectl create -f movieweb-virtualservice.yaml
    ```

## 2. Create and deploy a ServiceEntry

1. Create the service entry that allows access to themoviedb.org:

    ```bash
    kubectl create -f movieweb-serviceentry.yaml
    ```

## 3. Clean up

```bash
kubectl delete -f movieweb.yaml
kubectl delete -f movieweb-virtualservice.yaml
kubectl delete -f movieweb-serviceentry.yaml
```
