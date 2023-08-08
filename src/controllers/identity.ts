import { Request, Response } from 'express';

interface IdentityRequest {
    email?: string;
    phoneNumber?: number;
}

const getWelcomeMessage = (req: Request, res: Response) => {
    res.status(200).json({
        "status": "Success",
        "message": "Hello World! Kindly view the README.md"
    })
}

const findIdentity = (req: Request<{}, {}, IdentityRequest>, res: Response) => {
    const { email, phoneNumber } = req.body;

    res.status(200).json({
        "status": "Success",
        "message": "data"
    })
}

export default { getWelcomeMessage, findIdentity };