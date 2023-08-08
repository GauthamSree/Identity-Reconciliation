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
    const linkPrecedence = linkedId ? 'secondary' : 'primary';
    const createdAt = Date.now();
    return await pool.query(
        'INSERT INTO CONTACT (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES ($1, $2, $3, $4, to_timestamp($5/1000.0), to_timestamp($6/1000.0))',
        [phoneNumber, email, linkedId, linkPrecedence, createdAt, createdAt]
    );
}

const findAndUpdateMissingContactInfo = async (results: QueryResult, email: string, phoneNumber: number) => {
    let primaryContactId: number;
    let unrecordedPhoneNumber: boolean = true;
    let unrecordedEmail: boolean = true;
    
    results.rows.forEach((row) => {
        if (row.linkprecedence === 'primary') {
            primaryContactId = row.id
        }
        unrecordedPhoneNumber = unrecordedPhoneNumber && (!row.phonenumber && row.phonenumber != phoneNumber) 
        unrecordedEmail = unrecordedEmail && (!row.email || row.email !== email);
    })

    if (!unrecordedEmail && !unrecordedPhoneNumber) return;
    
    await insertContact(email, phoneNumber, primaryContactId);
}

const handleContactRecordUpdate = async (results: QueryResult) => {
    const primaryContacts = results.rows.filter((row) => row.linkprecedence === 'primary');

    if (primaryContacts.length < 2) {
        return findPrimaryContactId(results);
    }

    primaryContacts.sort((a, b) => a.createdat - b.createdat);
    const [oldestPrimaryContact, targetPrimaryContact] = primaryContacts;

    const targetSecondaryContactIds = results.rows
        .filter((row) => row.linkprecedence === 'secondary' && row.linkedId === targetPrimaryContact.id)
        .map((row) => row.id);

    const updatedAt = Date.now();
    await pool.query("UPDATE contact SET linkPrecedence = $1, linkedId = $2, updatedAt = $3 WHERE id = $4", 
        ['secondary', oldestPrimaryContact.id, updatedAt, targetPrimaryContact.id]);

    if (targetSecondaryContactIds.length > 0) {
        await pool.query("UPDATE contact SET linkedId = $1 WHERE id = ANY($2::int[])", 
            [oldestPrimaryContact.id, targetSecondaryContactIds]);
    }

    return oldestPrimaryContact.id;
};

const findPrimaryContactId = (results: QueryResult) => {
    return results.rows[0].linkprecedence === 'primary' ? results.rows[0].id : results.rows[0].linkedid;
};

const findRecords = (primaryContactId: number) => {    
    return pool.query(
        "SELECT * FROM contact WHERE linkedId = $1 OR id = $1", 
        [primaryContactId]
    )
}


const processResults = (results: QueryResult) => {
    let contact: Contact = {
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
        primaryContactId: -1
    };
    
    results.rows.forEach(row => {
        const linkPrecedence = row.linkprecedence;
        const phoneNumber = row.phonenumber ? row.phonenumber.toString() : null;
        const email = row.email;

        if (linkPrecedence === 'primary') {
            contact.primaryContactId = row.id;
            if (phoneNumber) contact.phoneNumbers.unshift(phoneNumber);
            if (email) contact.emails.unshift(email);
        } else {
            if (phoneNumber) contact.phoneNumbers.push(phoneNumber);
            if (email) contact.emails.push(email);
            contact.secondaryContactIds.push(row.id);
        }
    });

    return contact;
}


const findIdentity = async (req: Request<{}, {}, IdentityRequest>, res: Response) => {
    const { email, phoneNumber } = req.body;   
    
    let results: QueryResult;
    if (email && phoneNumber) {
        results = await pool.query("SELECT * FROM contact WHERE email=$1 OR phoneNumber=$2", [email, phoneNumber]);
        if (results.rowCount == 0) {
            results = await insertContact(email, phoneNumber)
        } else {
            await findAndUpdateMissingContactInfo(results, email, phoneNumber)
            const primaryContactId = await handleContactRecordUpdate(results)
            results = await findRecords(primaryContactId)
        }
    } else {
        if (!email && !phoneNumber) {
            res.status(400).json({
                message: 'Both email and phoneNumber are null'
            });
            return;
        }
        results = email 
        ? await pool.query('SELECT * FROM CONTACT WHERE email = $1', [email])
        : await pool.query('SELECT * FROM CONTACT WHERE phoneNumber = $1', [phoneNumber]);
       
        if (results.rowCount == 0) {
            results = await insertContact(email, phoneNumber)
        } else {
            const primaryContactId: number = findPrimaryContactId(results) 
            results = await findRecords(primaryContactId)
        }
    }

    const result: Contact = processResults(results)
    res.status(200).json({
        contact: result
    });
}

export default { getWelcomeMessage, findIdentity };