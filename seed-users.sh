export DATABASE_URL="postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
npm run dev &
SERVER_PID=$!

echo "Waiting for server to start on port 3000..."
sleep 15

echo "Creating admin user..."
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ferme.com", "password": "password123", "name": "Admin"}'

echo ""
echo "Creating distributor user..."
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "distrib@ferme.com", "password": "password123", "name": "Distributeur"}'

echo ""
echo "Stopping server..."
kill $SERVER_PID
