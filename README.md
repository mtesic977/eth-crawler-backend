# Ethereum Crawler Backend

This is the backend service for crawling Ethereum transactions and balances for a given wallet address.

## ⚙️ Requirements

- **Node.js** v22.x
- **MongoDB** (via Docker or local installation)
- **Docker** (for running MongoDB)

## 🐳 Running MongoDB in Docker

You can start a MongoDB container using the following command:

```bash
sudo docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo

This will start a MongoDB server on localhost:27017 with username root and password password.

    Make sure Docker is installed and running before executing this command.

🚀 Getting Started

    Clone the repository:

git clone https://github.com/mtesic977/eth-crawler-backend.git
cd eth-crawler-backend

    Install dependencies:

npm install

    Build and start the backend:

npm run build && npm run dev

    This will compile the TypeScript code and start the development server using ts-node-dev.

📁 Project Structure

.
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Ethereum crawling and logic
│   ├── repositories/     # Database access
│   ├── routes/           # API routes
│   └── index.ts          # Entry point
├── tsconfig.json         # TypeScript config
├── package.json
└── README.md

📌 Environment Configuration

You can configure environment variables in a .env file and there is .env.example file:

MONGO_URI=mongodb://root:password@localhost:27017
PORT=5000

🧪 Example API Endpoints

    GET /api/auth/token – Get auth token

    GET /api/transactions?wallet=0x...&startBlock=... – Crawl and return transactions

    GET /api/balance?wallet=0x...&date=YYYY-MM-DD – Get wallet balance at a specific date

✅ Notes

    Transactions and token data are fetched using direct Ethereum RPC provider calls.

    MongoDB is used for caching and querying previously crawled data.
