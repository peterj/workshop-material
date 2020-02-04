# Kubernetes Exercises

In this exercise you will install a Kubernetes cluster (or use a cloud-managed one) to deploy an application and try out some `kubectl` commands. You will also learn how Deployments and Services look like in YAML and how to create ConfigMaps, Secrets and use readiness probes.

## Installing Kubernetes and the CLI

We will be using the tool called `kind` to run a local Kubernetes cluster using Docker container nodes. To install `kind`, follow the instructions below:

1. For Mac/Linux, run the following:

```
curl -Lo ./kind "https://github.com/kubernetes-sigs/kind/releases/download/v0.7.0/kind-$(uname)-amd64"
chmod +x ./kind
mv ./kind /usr/local/bin/kind
```

>Alternatively, use `brew install kind` if using Homebrew.

1. For Windows, run (replace `dir-in-your-PATH` with an actual folder name):
```
curl.exe -Lo kind-windows-amd64.exe https://github.com/kubernetes-sigs/kind/releases/download/v0.7.0/kind-windows-amd64
Move-Item .\kind-windows-amd64.exe c:\dir-in-your-PATH\kind.exe
```

1. Create the cluster:

```
kind create cluster
```

1. Install the Kubernetes CLI by follwing the instructions [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/)


### Other Tools for Kubernetes

Note that these are optional and not needed to go through the workshop. 

- [K9s - Kubernetes CLI To Manage Your Clusters In Style](https://github.com/derailed/k9s)
- [Kubectx](https://github.com/ahmetb/kubectx/)
- [Popeye - Kubernetes cluster resource sanitizer](https://github.com/derailed/popeye)

## Getting familiar

Kubernetes CLI (`kubectl`) is what you will use to talk to your Kubernetes cluster.

Let's make sure we have a cluster running:

```
$ kubectl get nodes
NAME             STATUS   ROLES    AGE    VERSION
docker-desktop   Ready    master   2d6h   v1.15.4
```

The `get` command is used for retrieving resources from the cluster. In the example above you used `get nodes` to get the information about all the nodes in the cluster. Since you're using Docker (you'd get a similar output if using Minikube), you will only have a single node.

## Running containers

To run a container inside the cluster, you can use the `run` command.

For example, to run the Node.js hello world application we used before, you can use the following command:

```
kubectl run helloworld --image=learncloudnative/helloworld:0.1.0 --port=3000
```

> Note: Ignore the message about the command being deprecated.

With the command above we are creating a Kubernetes deployment called `helloworld` and telling Kubernetes to create a container from the provided image and run it on port `3000`.

You can look at all the deployments in your cluster with the get command:

```
$ kubectl get deployments
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
helloworld   1/1     1            1           8s
```

Let's also check the pods we have running for this deployment:

```
$ kubectl get pods
NAME                          READY   STATUS    RESTARTS   AGE
helloworld-5fc86b997c-7jksc   1/1     Running   0          2m16s
```

To get more information about the resources, you can use the `describe` command, like this:

```
$ kubectl describe deployment helloworld
Name:                   helloworld
Namespace:              default
CreationTimestamp:      Wed, 1 Oct 2019 21:32:42 -0700
Labels:                 run=helloworld
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               run=helloworld
Replicas:               1 desired | 1 updated | 1 total | 1 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  run=helloworld
  Containers:
   helloworld:
    Image:        learncloudnative/helloworld:0.1.0
    Port:         3000/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   helloworld-5fc86b997c (1/1 replicas created)
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  3m55s  deployment-controller  Scaled up replica set helloworld-5fc86b997c to 1

```

Above command gives you more details about the desired resource instance.

## Accessing services

Any containers running inside Kubernetes need to be explicitly exposed in order to be able to access them from the outside of the cluster.

You can use the `expose` command to create a Kubernetes service and 'expose' your application. Note that since you are using `kind` you will have to use `port-forward` command to proxy the calls from your local computer to the service and pods running inside the cluster.

Expose the deployment first (this creates a Kubernetes service):
```
kubectl expose deployment helloworld --port=8080 --target-port=3000 --type=LoadBalancer
```

The output of the above command will simply be: `service/helloworld exposed`.

The above command exposes the deployment called `helloworld` on port `8080`, talking to the target port (container port) `3000`. Additionall, we are saying we want to expose this on a service of type LoadBalancer - this will allocate a 'public' IP for us (`localhost` when running Docker for Mac and an actual IP address if using a cloud-managed cluster). When using `kind`, make sure you run the following command from a separate terminal window:

```
kubectl port-forward --address localhost service/helloworld 8080:8080
```
Now you can acccess the application on e.g. `http://localhost:8080`.

> Minikube: Use the Minikube IP address (get it with `minikube ip`) and the internal port (run `kubectl get services` and use second port in the pair (e.g. `8080:30012` -> use `30012`)) to access the exposed application or type `minikube service helloworld` to open it in your web browser.

Expose command creates another Kubernetes resource - a Service. To look at the details of the created service, run:

```
$ kubectl describe service helloworld
Name:                     helloworld
Namespace:                default
Labels:                   run=helloworld
Annotations:              <none>
Selector:                 run=helloworld
Type:                     LoadBalancer
IP:                       10.101.40.103
LoadBalancer Ingress:     localhost
Port:                     <unset>  8080/TCP
TargetPort:               3000/TCP
NodePort:                 <unset>  30075/TCP
Endpoints:                10.1.0.67:3000
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
```

## Scalling up/down

Now that you can access the application through exposed service, you can try and scale the deployment and create more replicas of the application:

```
kubectl scale deployment helloworld --replicas=5
```

If you look at the pods now, you should see 5 different instances:

```
$ kubectl get pods
NAME                          READY   STATUS    RESTARTS   AGE
helloworld-5fc86b997c-2p4ww   1/1     Running   0          3s
helloworld-5fc86b997c-7jksc   1/1     Running   0          11m
helloworld-5fc86b997c-fg986   1/1     Running   0          3s
helloworld-5fc86b997c-ftm6d   1/1     Running   0          3s
helloworld-5fc86b997c-jc9jt   1/1     Running   0          3s
```

Similarly, you can scale down the pods by running the same command and providing a smaller number of replicas:

```
kubectl scale deployment helloworld --replicas=1
```

## Kubernetes Dashboard

If you are using Minikube the dashboard is already installed - just run `minikube dashboard` to open it.

If you're using Docker for Mac/Windows, follow the steps below to install the dashboard.

1. Install the Kubernetes dashboard:

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v1.10.1/src/deploy/recommended/kubernetes-dashboard.yaml
```

1. List all pods running in the cluster:

```bash
kubectl get pods --all-namespaces
```

> Note: instead of using `--all-namespaces`, you can also use the short version of the flag `-A`

1. Look for the pod named `kubernetes-dashboard-XXXXX` and ensure that it's up and running (check the `STATUS` column). This is the dashboard you installed in the previous part.

1. Open another terminal window and create a proxy to the cluster:

```
kubectl proxy
```

1. Try to open the dashboard:

```
http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#
```

1. You will notice that you need to login first. To be able to log in, you need to create a new user that has permissions to log into the dashboard.

1. Deploy the `admin-user.yaml` file - this will create the account and a binding:

```bash
$ kubectl apply -f admin-user.yaml

serviceaccount/admin-user created
clusterrolebinding.rbac.authorization.k8s.io/admin-user created
```

1. With this deployed, you need a bearer token that you will use to log in to the dashboard. Run the command below to get the token for the user you created. We will use this token to login.

```
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
```

1. Copy the token value, open the dashboard again, select the Token option. Paste in the token from the previous step and click Sign in.

1. Familiarize yourself with the dashboard - check all the namespaces, deployments and pods that are running in the cluster.

## Config maps and Secrets

To demonstrate config maps and secrets in Kubernetes, you will use a sample Node.js application from the `./hello-kube` folder.

Let's make some changes to the application, build the Docker image and then deploy it to the cluster.

1. Open `routes/index.js` and change the `firstName` variable value to your name.

1. Build the Docker image:

   ```
   docker build -t [repository]/hello-kube:0.1.0 .
   ```

1. Run the Docker image on your machine to make sure changes work:

   ```
   docker run -it -p 3000:3000 [repository]/hello-kube:0.1.0
   ```

1. Push the image to the Docker hub:

   ```
   docker push [repository]/hello-kube:0.1.0
   ```

1. Update `deploy/deployment.yaml` to use the image name you pushed.

1. Using `kubectl` create the Kubernetes deployment and service:

   ```
   kubectl apply -f deploy/deployment.yaml
   kubectl apply -f deploy/service.yaml
   ```

1. Open http://localhost to see the application running inside the Kubernetes cluster.

### Using config maps

Instead of hardcoding the first name in the code, we want to read the first name value from a config map called `hello-kube-config`.

1. Create a Kubernetes config map resource to store the `firstName` value. The quickest way to create a config map is using `kubectl`

   ```
   kubectl create configmap hello-kube-config --from-literal=firstName=Peter
   ```

   To see the YAML file that was created, use the following command:

   ```
   $ kubectl get cm hello-kube-config -o yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
       name: hello-kube-config
       namespace: default
   data:
       firstName: Peter
   ```

1. Mount the config map and the value as an environment variable in the deployment file. Make copy of the existing `deployment.yaml` file (you can name it `deployment-configmaps.yaml` and update it to mount the config map and it's values under the `env` key, like this:

   ```yaml
   ...
   containers:
       - name: web
       ...
         env:
           - name: FIRST_NAME_VARIABLE
             valueFrom:
               configMapKeyRef:
                   name: hello-kube-config
                   key: firstName
       ...
   ```

> Note: make sure you indent the YAML correctly, otherwise you will get errors deploying the YAML.

1. Modify the code to read the `firstName` from an environment variable.

   > Note: to read environment values in NodeJs, you can write `const firstName = process.env.MY_VARIABLE_NAME`

1. Rebuild the Docker image using tag `0.1.1` and push it to the Docker registry.
1. Apply the updated `deployment.yaml` file (one with environment variable from the config map and updated image name). You can use `kubectl apply -f deploy/[deployment.yaml]`.

### Using secrets

The application reads all file names from the `app/my-secrets` folder and displays them on the web page. Let's create a Secret with a couple of files and mount it as a volume in the deployment.

1. Create a couple of files (the contents are not really important):

   ```
   echo "Hello World" >> hello.txt
   echo "secretpassword" >> passwd
   echo "some=config" >> config.env
   ```

1. Create a Secret using `kubectl` command:

   ```
   kubectl create secret generic hello-kube-secret --from-file=./hello.txt --from-file=./passwd --from-file=config.env
   ```

1. You can use the `describe` command to look at the secret details:

   ```
   kubectl describe secret hello-kube-secret
   ```

1. Update your deployment file (you can either create a copy of the previous file or update the existing one) and mount the created secret into the pod:

   ```yaml
   ...
   spec:
       containers:
         - name: web
           ...
           volumeMounts:
             - name: my-secret-volume
               mountPath: "/app/my-secrets"
               readOnly: true
       volumes:
         - name: my-secret-volume
           secret:
             secretName: hello-kube-secret
       ...
   ```

1. Apply the updated deployment YAML file. Note that we didn't have to rebuild the Docker image as there were no changes to the code.

## Kubernetes Health checks: liveness, readiness and startup probes

Application has the following three endpoints implemented that can be used to learn how health and readiness probes work.

### Endpoints

#### `/healthy`

Returns an HTTP 200. If `HEALTHY_SLEEP` environment variable is set, it will sleep for the amount of millisecond defined in the variable. For example if `HEALTHY_SLEEP=5000` the endpoint will wait for 5 seconds before returning HTTP 200.

#### `/healthz`

The endpoint returns HTTP 200 for the first 10 seconds. After that it starts returning an HTTP 500.

#### `/ready`

Functionally equivalent to the `/healthy` endpoint (returns HTTP 200). Uses `READY_SLEEP` environment variable to sleep for the amount of millisecond defined in the variable.

#### `/readyz`

The endpoint returns HTTP 500 for the first 10 seconds. After that it starts returning an HTTP 200.

#### `/fail`

Returns an HTTP 500 error. Uses `FAIL_SLEEP` environment variable to sleep for the amount of miliseconds defined in the variable before returning.

### Liveness probe

1. Make a copy of the `deployment.yaml` file or use the one from the previous exercise.
1. Add the following snippet to the container spec:

   ```yaml
   ---
   - name: web
       ...
     livenessProbe:
       httpGet:
         path: /healthz
         port: 3000
       initialDelaySeconds: 3
       periodSeconds: 3
   ```

1. Deploy the YAML file.

   ```
   kubectl apply -f deploy/deployment.yaml
   ```

1. Use the describe command to observe how the pod gets restarted after the probe starts to fail.

   ```
   # Get the pod name first
   kubectl get pods

   kubectl describe po [pod_name]
   ```

The first health check happens 3 seconds after the container starts (`initialDelaySeconds`) and it's repeated every 3 seconds (`periodSeconds`). As soon as the health check fails, container gets restarted and the whole process repeats.

### Readiness probe

Readiness has very similar format as the liveness probe, the only difference is the field name (`readinessProbe` instead of `livenessProbe`). You would use a readiness probe when your service might need more time to start up, yet you don't want the liveness probe to kick in and restart the container. If the readiness probe determines that the service is not ready, no traffic will be sent to it.

Let's use the `/readyz` endpoint - this endpoint returns HTTP 500 for the first 10 seconds and then starts returning HTTP 200.

1. Edit the `deployment.yaml` and add the `readinessProbe` as well as the environment variable:

   ```yaml
   ...
   - name: web
     ...
     readinessProbe:
       httpGet:
         path: /readyz
         port: 3000
       initialDelaySeconds: 3
       periodSeconds: 3
   ```

1. Deploy the YAML file:

   ```
   kubectl apply -f deployment.yaml
   ```

1. Try making requests to the `http://localhost`. You will notice that you won't be able to get any responses through, and after 10 second the pod will be ready and you will be able to make responses.

Another difference between the readiness probe when compared to the liveness probe is that if readiness probe fails, it won't restart the container.

## Resource quotas

With resource quotas you can limit the resource consumption per every Kubernetes namespace. For example, you can limit the quantity of resource types that can be created in a namespace as well as by total amount of resources that are consumed (e.g. CPU, memory).

Using a `ResourceQuota` resource we can set the limits. If users try to create or update resources in a way that violates this quota, the request will fail with HTTP 403 (forbidden).

1. Deploy a resource quota that limits the number of pods to 5:

```
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pods-limit
spec:
  hard:
    pods: "5"
EOF
```

1. Deploy the `hello-kube` deployment (if not already deployed) and try to scale it to 10:

   ```
   kubectl scale deploy hello-kube-deployment --replicas=10
   ```

1. Get the list of pods and you will notice only 5 replicas are created, meaning we are hitting the limit.

   ```
   kubectl get pods
   ```

1. Let's try to create another, one off pod using image `radial/busyboxplus:curl`:

   ```
   kubectl run extra-pod --image=radial/busyboxplus:curl --generator=run-pod/v1
   ```

1. You will notice that this time, we get an actual error:

   ```
   Error from server (Forbidden): pods "extra-pod" is forbidden: exceeded quota: pods-limit, requested: pods=1, used: pods=5, limited: pods=5
   ```

Make sure you don't forget to delete the quota before moving on:

```
kubectl delete quota pods-limit
```


## Clean up

Before continuing, making sure you delete the deployments, services and other resources you created as part of this exercise:

```
kubectl delete deployment helloworld
kubectl delete service helloworld

kubectl delete deployment hello-kube
kubectl delete service hello-kube
```