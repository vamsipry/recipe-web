# Recipe Companion Web (AWS)

Full-stack web app (Next.js + Serverless on AWS) with feature parity to the iOS app:
- Save recipes (title, URL, ingredients, steps, tags, image)
- Import from URL (JSON-LD schema.org parsing)
- Grocery list
- Meal planner
- OCR (browser with Tesseract.js)
- Auth via Amazon Cognito (Hosted UI / OIDC)
- API Gateway + Lambda (Node.js 20)
- DynamoDB data store
- S3 for images with presigned uploads
- Deployed via **Serverless Framework** (backend) and **Amplify Hosting** (frontend)

## Structure
```
/infra          # defined inside serverless.yml (Cognito, DynamoDB, S3) via CloudFormation
/backend        # Lambda handlers + Serverless config
/web            # Next.js 14 app router + NextAuth Cognito provider
```

## Prereqs
- Node.js 20+
- Serverless Framework: `npm i -g serverless`
- AWS CLI configured (`aws configure`)

## 1) Deploy backend
```bash
cd backend
npm i
sls deploy --stage dev
```
This creates:
- **Cognito User Pool** + **App Client** (with secret)
- **DynamoDB** table
- **S3** bucket for images
- **HTTP API** with **JWT authorizer** (Cognito)

Grab the outputs printed at the end and export them for the web app:
```
API_URL=...  # https://xxxxx.execute-api.<region>.amazonaws.com
USER_POOL_ID=...
USER_POOL_CLIENT_ID=...
USER_POOL_CLIENT_SECRET=...
USER_POOL_ISSUER=https://cognito-idp.<region>.amazonaws.com/<userPoolId>
S3_BUCKET=...
S3_REGION=...
```

## 2) Run the web app locally
```bash
cd ../web
cp .env.example .env.local
# edit .env.local with values from step 1
npm i
npm run dev
```

## 3) Deploy the web app
Use **AWS Amplify Hosting** (connect your Git repo & set env vars from step 1). See Amplify docs. 

---

If you hit any build/runtime error, paste it and we’ll patch fast.
