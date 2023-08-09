import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { IdentityRequest, Contact } from '../models/identity.js';
import { 
    insertContact, 
    findAndUpdateMissingContactInfo, 
    handleContactRecordUpdate, 
    getLinkedContactsByID, 
    findPrimaryContactId, 
    constructIdentityResponse, 
    findContactByEmailOrPhone,
    findContactByEmail,
    findContactByPhone
} from '../services/identity.js';


const getWelcomeMessage = (req: Request, res: Response) => {
    res.status(200).json({
        "status": "Success",
        "message": "Hello World! Kindly view the README.md"
    })
}

const findIdentity = async (req: Request<{}, {}, IdentityRequest>, res: Response) => {
    const { email, phoneNumber } = JSON.parse(JSON.stringify(req.body));
    
    let results: QueryResult;
    if (email && phoneNumber) {
        results = await findContactByEmailOrPhone(email, phoneNumber);
        if (results.rowCount == 0) {
            results = await insertContact(email, phoneNumber)
        } else {
            await findAndUpdateMissingContactInfo(results, email, phoneNumber)
            const primaryContactId = await handleContactRecordUpdate(results)
            results = await getLinkedContactsByID(primaryContactId)
        }
    } else {
        if (!email && !phoneNumber) {
            res.status(400).json({
                message: 'Both email and phoneNumber are null'
            });
            return;
        }
        results = email 
        ? await findContactByEmail(email)
        : await findContactByPhone(phoneNumber);
       
        if (results.rowCount == 0) {
            results = await insertContact(email, phoneNumber)
        } else {
            const primaryContactId: number = findPrimaryContactId(results) 
            results = await getLinkedContactsByID(primaryContactId)
        }
    }

    const result: Contact = constructIdentityResponse(results)
    res.status(200).json({
        contact: result
    });
}

export default { getWelcomeMessage, findIdentity };