# run using git bash - start.dev.sh

echo "🔄 Starting Redis container..."
# Run Redis service (hiding output if already running)
docker run --name redis-service -p 6379:6379 -d redis 2>/dev/null || docker start redis-service

echo "⏳ Waiting 10 seconds for Redis to initialize..."
sleep 10

echo "🚀 Starting Node.js server in development mode..."
npm run dev