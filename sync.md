# Command to sync files to EC2

```
rsync -avz --exclude 'node_modules' '.serverless' --exclude '.git' --exclude '.env' -e "ssh -i ~/.ssh/your-key.pem" . ubuntu@ip-address:~/app
```
