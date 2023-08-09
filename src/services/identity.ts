import { QueryResult } from 'pg';
import pool from '../db.js';
import queries from "../models/queries.js";
import { Contact } from '../models/identity.js';


const insertContact = async (email: string, phoneNumber: number, linkedId?: number) => {
    const linkPrecedence = linkedId ? 'secondary' : 'primary';
    const createdAt = Date.now();
    
    return await pool.query(
        queries.insertContactQuery,
        [phoneNumber, email, linkedId, linkPrecedence, createdAt, createdAt]
    );
}

const findContactByEmailOrPhone = async (email: string, phoneNumber: number) => {
    return await pool.query(
        queries.findContactByEmailOrPhoneQuery, 
        [email, phoneNumber]
    );
}

const findContactByEmail = async (email: string) => {
    return await pool.query(
        queries.findContactByEmailQuery, 
        [email]
    );
}

const findContactByPhone = async (phoneNumber: number) => {
    return await pool.query(
        queries.findContactByPhoneQuery, 
        [phoneNumber]
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
    await pool.query(
        queries.updatePrimaryQuery, 
        ['secondary', oldestPrimaryContact.id, updatedAt, targetPrimaryContact.id]);

    if (targetSecondaryContactIds.length > 0) {
        await pool.query(
            queries.updateSecondaryQuery, 
            [oldestPrimaryContact.id, targetSecondaryContactIds]);
    }

    return oldestPrimaryContact.id;
};


const getLinkedContactsByID = (primaryContactId: number) => {    
    return pool.query(
        queries.getLinkedContactsByIDQuery, 
        [primaryContactId]
    )
}

const findPrimaryContactId = (results: QueryResult) => {
    const primaryContact = results.rows.find(row => row.linkprecedence === 'primary');

    if (primaryContact) {
        return primaryContact.id;
    } else if (results.rows.length > 0) {
        return results.rows[0].linkedid;
    }
    
    return -1;
};


const constructIdentityResponse = (results: QueryResult) => {
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
            if (phoneNumber && !contact.phoneNumbers.includes(phoneNumber)) contact.phoneNumbers.push(phoneNumber);
            if (email && !contact.emails.includes(email)) contact.emails.push(email);
            contact.secondaryContactIds.push(row.id);
        }
    });

    return contact;
}

export {
    insertContact,
    findContactByEmailOrPhone,
    findContactByEmail,
    findContactByPhone,
    findAndUpdateMissingContactInfo,
    handleContactRecordUpdate,
    getLinkedContactsByID,
    findPrimaryContactId,
    constructIdentityResponse
}