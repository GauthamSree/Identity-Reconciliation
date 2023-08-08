import { Request, Response } from 'express';
import pool from '../db.js';
import { QueryResult } from 'pg';

interface IdentityRequest {
    email?: string;
    phoneNumber?: number;
}

interface Contact {
    primaryContactId: number,
    emails: string[], 
    phoneNumbers: string[], 
    secondaryContactIds: number[]
}

const getWelcomeMessage = (req: Request, res: Response) => {
    res.status(200).json({
        "status": "Success",
        "message": "Hello World! Kindly view the README.md"
    })
}

const insertContact = async (email: string, phoneNumber: number, linkedId?: number) => {
    return await pool.query(
        "INSERT INTO CONTACT (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) values ($1, $2, $3, $4, to_timestamp($5/1000.0), to_timestamp($6/1000.0))", 
        [phoneNumber, email, linkedId, (linkedId) ? "secondary": "primary", Date.now(), Date.now()]);
}

const insertNewInfo = async (results: QueryResult, email: string, phoneNumber: number) => {
    let primaryContactId: number;
    let unrecordedPhoneNumber: boolean = true;
    let unrecordedEmail: boolean = true;
    
    results.rows.forEach((row) => {
        if (row['linkprecedence'] === "primary") {
            primaryContactId = row['id']
        }
        if (row['phonenumber'] && row['phonenumber'] == phoneNumber) {
            unrecordedPhoneNumber = false;
        }
        if (row['email'] && row['email'] === email) {
            unrecordedEmail = false;
        }
    })

    if (!unrecordedEmail && !unrecordedPhoneNumber) return;
    
    if (unrecordedPhoneNumber) {
        await insertContact(null, phoneNumber, primaryContactId)
    } else {
        await insertContact(email, null, primaryContactId)
    }
}

const findRecords = (results: QueryResult) => {
    let primaryContactId: number;

    if (results.rows[0]['linkprecedence'] === "primary") {
        primaryContactId = results.rows[0]['id']
    } else {
        primaryContactId = results.rows[0]['linkedid']
    }

    return pool.query(
        "SELECT * FROM contact WHERE linkedId = $1 OR id = $1", 
        [primaryContactId]
    )
}


const processResult = (results: QueryResult) => {
    let contact: Contact = {
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
        primaryContactId: -1
    };
    
    results.rows.forEach((row) => {
        if (row['linkprecedence'] === "primary") {
            contact.primaryContactId = row['id']
            if (row['phonenumber']) contact.phoneNumbers.unshift(row['phonenumber'].toString())
            if (row['email']) contact.emails.unshift(row['email'])
        } 
        else {
            if (row['linkprecedence'] === "secondary") contact.secondaryContactIds.push(row['id'])
            if (row['phonenumber']) contact.phoneNumbers.push(row['phonenumber'].toString())
            if (row['email']) contact.emails.push(row['email'])
        }
    })

    return contact;
}


const findIdentity = async (req: Request<{}, {}, IdentityRequest>, res: Response) => {
    const { email, phoneNumber } = req.body;
    if (email && phoneNumber) {
        pool.query(
            "SELECT * FROM contact WHERE email=$1 OR phoneNumber=$2", [email, phoneNumber], 
            async (error, results) => {
                if (error) throw error;   
                
                if (results.rowCount == 0) {
                    results = await insertContact(email, phoneNumber)
                } else {
                    await insertNewInfo(results, email, phoneNumber)
                    results = await findRecords(results)
                }
                const result: Contact = processResult(results)
                res.status(200)
                .header('Content-Type', 'application/json')
                .json({
                    "contact": result
                })
            }
        )
    } else if (email) {
        pool.query(
            "SELECT * FROM CONTACT WHERE email = $1", [email], 
            async (error, results) => {
                if (error) throw error;   

                if (results.rowCount == 0) {
                    results = await insertContact(email, phoneNumber)
                } else {
                    results = await findRecords(results)
                }
                
                const result: Contact = processResult(results)
                res.status(200)
                .header('Content-Type', 'application/json')
                .json({
                    "contact": result
                })
            }
        )
    } else if (phoneNumber) {
        pool.query(
            "SELECT * FROM CONTACT WHERE phoneNumber = $1", [phoneNumber], 
            async (error, results) => {
                if (error) throw error;   

                if (results.rowCount == 0) {
                    results = await insertContact(email, phoneNumber)
                } else {
                    results = await findRecords(results)
                }

                const result: Contact = processResult(results)
                res.status(200)
                .header('Content-Type', 'application/json')
                .json({
                    "contact": result
                })
            }
        )
    } else {
        res.status(400).json({
            "message": "both email & phoneNumber are null"
        })
    }
}

export default { getWelcomeMessage, findIdentity };