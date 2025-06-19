# Pulumi AWS API Gateway Ping-Pong Example

This project demonstrates how to use [Pulumi](https://www.pulumi.com/) with Python to provision an AWS API Gateway REST API with a `/ping` endpoint that returns `pong`.

## What is Pulumi?
Pulumi is an open-source infrastructure as code (IaC) tool that allows you to define, deploy, and manage cloud resources using familiar programming languages like Python, TypeScript, Go, and C#.

## Project Structure
- `__main__.py`: Main Pulumi program (Python) that defines your AWS infrastructure.
- `Pulumi.yaml`: Project metadata and configuration.
- `requirements.txt`: Python dependencies for Pulumi and AWS.
- `.gitignore`: Files and folders to exclude from version control.

## Prerequisites
- Python 3.13
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- AWS credentials configured (e.g., via `aws configure`)

## Setup
1. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   # Or
   source venv/bin/activate  # On Mac/Linux
   ```
2. **Install dependencies:**
   ```sh
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. **Login to the Pulumi backend (S3):**
   ```sh
   pulumi login
   ```
   (This uses the S3 bucket specified in `Pulumi.yaml` for state storage.)

## Main Commands
- **Preview and deploy changes:**
  ```sh
  pulumi up
  ```
  This will show a preview and then apply the changes to your AWS account.

- **Destroy all resources:**
  ```sh
  pulumi destroy
  ```
  This will remove all resources created by this stack.

- **Set or update configuration (e.g., AWS region):**
  ```sh
  pulumi config set aws:region us-east-1
  ```

- **View stack outputs (like the API endpoint):**
  ```sh
  pulumi stack output
  ```

## Output
After deployment, Pulumi will output the invoke URL for your `/ping` endpoint. You can test it with:
```sh
curl <invoke_url>
```
You should receive a response: `"pong"`

## Learn More
- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Pulumi AWS Provider](https://www.pulumi.com/registry/packages/aws/) 