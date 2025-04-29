# Serverless Framework Node Express API on AWS


Code for my bachelors on testing serverless architecture vs traditional


## Deployment on serverless

Install dependencies with:

```
npm install
```

and then deploy with:

```
npm run deploy
```

### Local development

The easiest way to develop and test your function is to use the `dev` command:

```
npm run dev
```

# Commands to setup EC2

## Sync files to EC2

```
rsync -avz --exclude 'node_modules' '.serverless' --exclude '.git' --exclude '.env' -e "ssh -i ~/.ssh/your-key.pem" . ubuntu@ip-address:~/app
```

## Deployment

```
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

```
npm install --production
```

```
npm run start
```

# Steps to run k6 tests

0. Install k6. Look at k6 documentation for specific instructions for your os.
   https://grafana.com/docs/k6/latest/set-up/install-k6/
1. cd into tests directory
2. run tests

```
k6 run test-file-name.js
```

Warning:
Tests do not appear work locally for serverless platform
