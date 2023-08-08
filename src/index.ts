import express from 'express';
import identityRouter from './routes/identity.js';

const app = express();
const PORT: number = 3000;

app.use(express.json())
app.use(identityRouter);


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});