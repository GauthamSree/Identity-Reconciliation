import express, {Request, Response } from 'express';

const app = express();
const PORT: number = 3000;

app.get('/', (req: Request, res: Response) => {
    res.json({
        "status": "Success",
        "message": "Hello World! Kindly view the README.md"
    })
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});