import { Request, Response } from 'express';
import pool from '../db.js';

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

const insertContact = async (email: string, phoneNumber: number, linkedId?: number) => {
    const result = await pool.query(
        "INSERT INTO CONTACT (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) values ($1, $2, $3, $4, to_timestamp($5/1000.0), to_timestamp($6/1000.0))", 
        [phoneNumber, email, linkedId, (linkedId) ? "secondary": "primary", Date.now(), Date.now()]);
    return result.rows[0];        
}


const findIdentity = async (req: Request<{}, {}, IdentityRequest>, res: Response) => {
    const { email, phoneNumber } = req.body;
    if (email && phoneNumber) {
        pool.query(
            "SELECT * FROM contact WHERE email=$1 OR phoneNumber=$2", [email, phoneNumber], 
            async (error, results) => {
                if (error) {
                    throw error;   
                } 
                if (results.rowCount == 0) {
                    await insertContact(email, phoneNumber)
                }
            }
        )
    } else if (email) {
        pool.query(
            "SELECT * FROM CONTACT WHERE email = $1", [email], 
            async (error, results) => {
                if (error) {
                    throw error;   
                } 
                if (results.rowCount == 0) {
                    await insertContact(email, phoneNumber)
                }
            }
        )
    } else if (phoneNumber) {
        pool.query(
            "SELECT * FROM CONTACT WHERE phoneNumber = $1", [phoneNumber], 
            async (error, results) => {
                if (error) {
                    throw error;   
                } 
                if (results.rowCount == 0) {
                    await insertContact(email, phoneNumber)
                }
            }
        )
    } else {
        res.status(400).json({
            "status": "Failure",
            "message": "Failed to retrieve data"
        })
    }
    
    res.status(200).json({
        "status": "Success",
        "message": "data"
    })
}

export default { getWelcomeMessage, findIdentity };