# Serverless Framework Node Express API on AWS

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
