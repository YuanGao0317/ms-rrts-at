﻿# ms-rrts-at  
## About  
Containerized Microservices Application.  

### (In Development)   
| Service | Status |
| :--- | :---: |
| Client - Auth  | Done |
| Gateway Service - Auth  | Done |
| Notification Service - Auth  | Done |
| Auth Service - Auth  | Done |
| ElasticSearch(local) - Kibana  | Done |
| ElasticSearch(local) - Metricbeat  | Implementing |
| ElasticSearch(local) - Heartbeat  | Implementing |
| ElasticSearch(local) - APM  | Implementing |
| Kubernetes Deployment - Minikube  | Implementing |
| Jenkins CI/CD(local)  | Implementing |
| Other - Microservices(chat service?)  |  |
| Other - Client Features(chat feature?)  |  |
| Kubernetes Deployment - AWS EKS Cluster  |  |  
 
### Tech Stack  
React, NodeJS, Typescript, Kubernetes/Docker, Rabbitmq, Redis, MySQL, PostgreSQL, MongoDB, SocketIO, Minikube, AWS EKS, Tailwind, Express, RTK Query, Elastic Stack, Jenkins, Prometheus/Grafana, JWT Auth, OTP Auth, API Gateway, and more!  

### Architecture  

### API Gateway  
<img src="https://github.com/yuangao0317/ms-rrts-at/assets/12887619/a9a5289b-d7a1-49ea-8e82-94f2505af70e" width="560"/>  

### Authorization Service  
<img src="https://github.com/yuangao0317/ms-rrts-at/assets/12887619/05cc7f33-0600-4fbb-83cb-00fd26d34b1e" width="900"/>  

### Monitoring  
##### Metricbeat - Infrastructure  
![image](https://github.com/yuangao0317/ms-rrts-at/assets/12887619/f70de990-a229-4bb6-a750-162d71a8fb47)  
![metricbeat](https://github.com/yuangao0317/ms-rrts-at/assets/12887619/1705a999-1b7a-4eec-8a37-1e7fe66c6f77)  



### How to setup project locally  
\ms-rrts-at> docker compose -f docker-compose-volumes.yaml -f docker-compose-monitoring.yaml -f docker-compose-services.yaml up -d  
NOTE: Elasticsearch might take few minutes to setup  
\ms-rrts-at\client> npm run dev  
Client: http://localhost:3000/  
Elasticsearch: http://localhost:5601/ user: elastic password: ms_admin  
