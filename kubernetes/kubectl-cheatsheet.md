This cheatsheet contains a list of most common commands you will use when working with Kubernetes cluster and its resources.

If you're working with Kubernetes on daily basis or if you're just learning about Kubernetes you will run into a set of commands that are used often than the other commands. The ones used more often are also usually easy to remember (especially if you're typing them out multiple times a day).

The problem becomes when you're either trying to do something more advanced or run a command against a resource you're aren't using very often or not too familiar with it. This is where this cheatsheet comes into play - it will help you quickly find the command you want, so you can copy & paste it, run it and move on.

# How to use this kubectl Cheatsheet

This cheatsheet is organized into multiple sections that are based on the actions you are trying to perform against Kubernetes resources. Each section contains a table with the command and the explanation of what that command does.

# Table of contents

1. [Introduction](#introduction)
1. [The basics](#the-basics)
1. [Basic resource information](#basic-resource-information)
1. [Detailed resource information](#detailed-resource-information)
1. [Sorting and filtering resources](#sorting-and-filtering-resources)
1. [Labelling and annotating resources](#labelling-and-annotating-resources)
1. [Creating, editing and deleting resources](#creating-editing-and-deleting-resources)
1. [Resource names](#resource-names)
1. [Conclusion](#conclusion)

## Introduction

Welcome friends! I am glad you've decided to either learn more about `kubectl` or just trying to find some useful commands or ideas. First things first - since you're here, I am assuming you have a Kubernetes cluster running and have access to it and you also have `kubectl` installed.

## The basics

The commands in this cheatsheet are all using the full name of the Kubernetes CLI - `kubectl`. If you'll be working with Kubernetes often, I strongly advise you to create an alias for that command - it will save you a lot of typing in the long run. If you want to take this to another level, [check out this set of Kubectl aliases](https://github.com/ahmetb/kubectl-aliases).

To create an alias for `kubectl`, you can run the following command:

```bash
alias k='kubectl'
```

Or just put it directly in your `~/.bash_profile` file:

```bash
echo "alias k='kubectl'" >> ~/.bash_profile
```

In most of the example below, I am using a pod resource as an example - you can replace pod with any other Kubernetes resource (unless the commnd is specific to that one reasource only).

I am also using the full resource names such as `pod`, `deployment` etc. but you don't have to. Refer to the [Resource names](#resource-names) section for short resource names such as `po`, `svc` or `deploy`.

Let's get started!

## Basic resource information

| Command                                    | Explanation                                                           |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `kubectl get pod mypod`                    | Lists the pod with name `mypod` in the current namespace              |
| `kubectl get pod`                          | Lists all pods in the current namespace                               |
| `kubectl get pod -n mynamespace`           | Lists all pods in `mynamespace` namespace                             |
| `kubectl get pod --all-namespaces`         | Lists all pods in all namespaces                                      |
| `kubectl get pod --all-namespaces -o wide` | Lists all pods in all namespaces with IP and Node                     |
| `kubectl get all --all-namespaces`         | Lists all resources in the cluster                                    |
| `kubectl describe pod mypod`               | Describes the resource in mor details (perfect for diagnosing issues) |
| `kubectl get pod --show-labels`            | Shows the labels next to all pods                                     |
| `kubectl explain pod`                      | Shows documentation for the resource (e.g. `pod` in our case)         |
| `kubectl get pod mypod -o yaml`            | Shows the YAML representation of the pod called `mypod`               |
| `kubectl get pod mypod -o json`            | Shows the JSON representation of the pod called `mypod`               |
| `kubectl cluster-info`                     | Shows information about the cluster                                   |
| `kubectl describe`                         | Lists all resource names                                              |
| `kubectl get pod -w`                       | Watches the pods (useful when waiting for e.g. pods to start)         |

> Note 1: replace the `pod` in above commands with any other resource (e.g. `service`, `deployment`, ...)

> Note 2: use the short name for resources. For example: `po` for `pods`, `svc` for `service`, `deploy` for `deployment`, etc.

## Detailed resource information

| Command                                                                                     | Explanation                                                     |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `kubectl get pod --selector="app=myapp"`                                                    | Lists all pods with label `app=myapp`                           |
| `kubectl get pod --selector="app=myapp" -o jsonpath='{.items[*].metadata.name}'`            | Get the pod names that have the label `app=myapp` set           |
| `kubectl get pod --selector="app=myapp" -o jsonpath='{.items[*].spec.containers[*].image}'` | Get the image names of pods that have the label `app=myapp` set |
| `kubectl get pod mypod -o jsonpath='{.items[*].status.podIP}'`                              | Get the pod IPs of the `mypod`                                  |
| `kubectl get pod mypod -o jsonpath='{.spec.containers[0].ports[0].containerPort}'`          | Get the first container port in the pod                         |
| `kubectl -v 9 get pod`                                                                      | Gets the pods with maximum (`9`) verbosity                      |

## Sorting and filtering

| Command                                                 | Explanation                                   |
| ------------------------------------------------------- | --------------------------------------------- |
| `kubectl get pod --sory-by=.metadata.name`              | Lists the pods and sorts them by their names  |
| `kubectl get pod --sory-by=.metadata.creationTimestamp` | Lists the pods by creation time, oldest first |
| `kubectl get pod -l app=myapp`                          | Show pods that have the label `app=myapp` set |

## Labelling and annotating resources

| Command                                                                | Explanation                                               |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `kubectl label pod mypod mylabel=myvalue`                              | Adds the label `mylabel=myvalue` to the pod named `mypod` |
| `kubectl label pod mypod mylabel-`                                     | Removes the `mylabel` from the pod named `mypod`          |
| `kubectl get pod mypod -o jsonpath='{.items[*].metadata.annotations}'` | Get all annotations for the pod named `mypod`             |
| `kubectl annotate pod mypod name=value`                                | Add an annotation `name=value` to the pod named `mypod`   |
| `kubectl annotate pod mypod name-`                                     | Removes the annotation `name` from the pod named `mypod`  |

## Creating, editing and deleting resources

| Command                                         | Explanation                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `kubectl create -f ./file.yaml`                 | Create resources defined in file `file.yaml`                                               |
| `kubectl delete -f ./file.yaml`                 | Delete resources defined in file `file.yaml`                                               |
| `kubectl delete pod mypod`                      | Delete a pod named `mypod` in the current namespace                                        |
| `kubectl run mypod --image=myimage`             | Creates a pod (and deployment) called `mypod` with image `myimage`                         |
| `kubectl run mypod --image=myimage --port=8080` | Creates a pod (and deployment) called `mypod` with image `myimage` and exposes port `8080` |

## Advanced commands

| Command                                                                | Explanation                                                                                                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `kubectl run curl --image=radial/busyboxplus:curl -i --tty`            | Runs the `radial/busyboxplus:curl` image and gives you a terminal into it (useful for accessing pods/services within the cluster) |
| `kubectl port-forward mypod 8080:CONTAINER_PORT`                       | Forwards the local port `8080` to `CONTAINER_PORT` (replace this with actual container port number)                               |
| `kubectl expose deployment mydeployment --type="NodePort" --port 8080` | Exposes deployment `mydeployment` to external traffic and makes it available on port `8080`                                       |
| `kubectl exec -it mypod -- /bin/bash`                                  | Runs the `/bin/bash` (terminal) inside the pod called `mypod`                                                                     |
| `kubectl attach mypod`                                                 | Watch the standard output of a container in real time                                                                             |
| `kubectl cp mypod:/some/path/file.txt .`                               | Copies the file `/some/path/file.txt` from `mypod` to the current directory                                                       |

## Resource names

Here's the list of all Kubernetes resource names and their shorthand equivalents (if available).

> Note: you also run `kubectl describe` to get a list of these.

| Long name                  | Short name   |
| -------------------------- | ------------ |
| all                        |              |
| certificatesigningrequests | csr          |
| clusterrolebindings        |              |
| clusterroles               |              |
| componentstatuses          | cs           |
| configmaps                 | cm           |
| controllerrevisions        |              |
| cronjobs                   |              |
| customresourcedefinition   | crd          |
| daemonsets                 | ds           |
| deployments                | deploy       |
| endpoints                  | ep           |
| events                     | ev           |
| horizontalpodautoscalers   | hpa          |
| ingresses                  | ing, ingress |
| jobs                       |
| limitranges                | limits       |
| namepsaces                 | ns           |
| networkpolicies            | netpol       |
| nodes                      | no           |
| persistentvolumeclaims     | pvc          |
| persistentvolumes          | pv           |
| poddisruptionbudgets       | pdb          |
| podpreset                  |
| pods                       | po, pod      |
| podsecuritypolicies        | psp          |
| podtemplates               |              |
| replicasets                | rs           |
| replicationcontrollers     | rc           |
| resourcequotas             | quota        |
| rolebindings               |              |
| roles                      |              |
| secrets                    |              |
| serviceaccounts            | sa           |
| services                   | svc          |
| statefulsets               | sts          |
| storageclasses             | sc           |
