import express from "express";
import dotenv from "dotenv";
import documentRoutes from "./routes/document.routes";
import queryRoutes from "./routes/query.routes";
import statusRoutes from "./routes/status.routes";
import { EMBEDDING_SIZE } from "./core/config";
import { vectorDB } from "./features/vector_db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/documents", documentRoutes);
app.use("/query", queryRoutes);
app.use("/status", statusRoutes);

async function setupVectorDB() {
  try {
    await vectorDB.setupCollection(EMBEDDING_SIZE);
    console.log("Qdrant collection setup complete.");
  } catch (error) {
    console.error("Failed to setup Qdrant collection:", error);
  }
}

setupVectorDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
