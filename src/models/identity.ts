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


export {
    IdentityRequest,
    Contact
};