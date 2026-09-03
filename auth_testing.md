# Custom Email/Password JWT Authentication - Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email.

## Step 2: API Testing
```
TOKEN=$(curl -s -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"email":"nyolkrish142@gmail.com","password":"Haryana@123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s $API/api/auth/me -H "Authorization: Bearer $TOKEN"
```
Login returns access_token + user; /me returns admin user without password_hash.

## Step 3: Admin Protection
```
curl -s $API/api/admin/jobs   # expect 401
curl -s $API/api/admin/jobs -H "Authorization: Bearer $TOKEN"   # expect 200
```
