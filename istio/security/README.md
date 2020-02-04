# Security Exercises

1. Deploy the Helloweb, Hreeter-v1 and the Gateway resource (if not already deployed) from the `./traffic` folder:

```
kubectl apply -f gateway.yaml

kubectl apply -f helloweb.yaml
kubectl apply -f greeter-v1.yaml
```

1. Check that you can make requests to the helloweb and you get a response back:

```
curl http://localhost:8080
```

## Use JWT for authentication

Let's create a policy and turn on JWT for authentication:

```
cat << EOF | kubectl apply -f -
apiVersion: authentication.istio.io/v1alpha1
kind: Policy
metadata:
  name: user-jwt
spec:
  targets:
    - name: helloweb
  origins:
    - jwt:
        issuer: "testing@secure.istio.io"
        jwksUri: "https://gist.githubusercontent.com/peterj/395601bff243386b4225e22bdcd62115/raw/c84eb37ca20cb76d3b58de7d4938b919ff0b08f5/jwks.json"
  principalBinding: USE_ORIGIN
EOF
```

If you make a request to the service, you will get the following error:

```
$ curl http://localhost:8080
Origin authentication failed.
```

>Note that it can take a couple of seconds for the changes to propagate, so if you don't see the error right away - wait 10 seconds and then try again.

This is expected, because we didn't provide a valid JWT token. Let's get a valid token first and store it in a variable:

```
token=$(curl https://gist.githubusercontent.com/peterj/3990de82f56d43ea1ced66fd30435e31/raw/a81c70cdef41020abfa5c93a127ea6265a270d2d/jwt-token.json -s)
```

> The decoded token contains the following payload:
    ```
    {
    "exp": 4685989700,
    "foo": "bar",
    "iat": 1532389700,
    "iss": "testing@secure.istio.io",
    "sub": "testing@secure.istio.io"
    }
    ```

Now let's make the same request again, but this time we provide the token in the header:

```
$ curl -H "Authorization: Bearer $token" http://localhost:8080
<link rel="stylesheet" type="text/css" href="css/style.css" />

<pre>frontend: 1.0.0</pre>
<pre>service: 1.0.0</pre>


<div class="container">
    <h1>hello 👋 </h1>
</div>
```

Notice that this time, you get the correct response back from the service.

## Enable RBAC (Role Based Access Control)

1. Turn RBAC on for the helloweb service:

```
cat << EOF | kubectl apply -f -
apiVersion: rbac.istio.io/v1alpha1
kind: ClusterRbacConfig
metadata:
  name: default
spec:
  mode: ON_WITH_INCLUSION
  inclusion:
     services: ["helloweb.default.svc.cluster.local"]
EOF
```

1. If you make a request now, you will get an error:

```
$ curl -H "Authorization: Bearer $token" http://localhost:8080
RBAC: access denied
```

Next, let's create a service role and binding that allows a token that has a field `foo` with the value `bar`:

```
cat << EOF | kubectl apply -f -
apiVersion: rbac.istio.io/v1alpha1
kind: ServiceRole
metadata:
  name: foo-role
spec:
  rules:
    - services: ["helloweb.default.svc.cluster.local"]
      methods: ["*"]
---
apiVersion: rbac.istio.io/v1alpha1
kind: ServiceRoleBinding
metadata:
  name: bind-foo-role
spec:
  subjects:
    - user: "*"
      properties:
        request.auth.claims[foo]: "bar"
  roleRef:
    kind: ServiceRole
    name: foo-role
EOF
```

Finally, if you make the same request with the authentication token in the header, you will get back the response from the service.

## Service Accounts

To see which service account your pod is using, you can look at the YAML representation of it. For example:

```
kubectl get pod [POD_NAME] -o yaml
```

In the output, you should be able to see the `serviceAccount` and `serviceAccountName` fields:

```
  serviceAccount: default
  serviceAccountName: default
```

### Check the identity URI


1. Run the command below to get a terminal inside the `istio-proxy` container of your pod:

```
kubectl exec -it [POD_NAME] -c istio-proxy /bin/sh
```

1. Get the Subject Alternative Name from the certificate:

```
cat /etc/certs/cert-chain.pem | openssl x509 -text -noout  | grep 'Subject Alternative Name' -A 1
```

1. The output should look similar to this: 

```
X509v3 Subject Alternative Name: critical
 URI:spiffe://cluster.local/ns/default/sa/default
```

1. To check the certificate validity, run:

```
cat /etc/certs/cert-chain.pem | openssl x509 -text -noout  | grep Validity -A 2
```

### Creating a new Service Account 

1. Create a new service account:

```
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: custom-service-account
EOF
```

In the Pod spec, add the line that explicitly declares the service account:

```
...
    spec:
      serviceAccount: custom-service-account
      containers:
        - image: learnistio/hello-web:1.0.0
...
```

You can apply the deployment, then exec into the `istio-proxy` container and check the SAN again: 

```
cat /etc/certs/cert-chain.pem | openssl x509 -text -noout  | grep 'Subject Alternative Name' -A 1
```

This time, you should see the name of the custom service account in the URI, like this:

```
URI:spiffe://cluster.local/ns/default/sa/custom-service-account
```