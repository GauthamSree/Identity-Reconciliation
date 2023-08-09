const insertContactQuery = `
    INSERT INTO contact 
    (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) 
    VALUES 
    ($1, $2, $3, $4, to_timestamp($5/1000.0), to_timestamp($6/1000.0))
    RETURNING *
`

const getLinkedContactsByIDQuery = `
    SELECT * 
    FROM contact 
    WHERE linkedId = $1 OR id = $1
`

const findContactByEmailOrPhoneQuery = `
    SELECT * 
    FROM contact 
    WHERE email=$1 OR phoneNumber=$2
`

const findContactByEmailQuery = `
    SELECT * 
    FROM contact 
    WHERE email = $1
`

const findContactByPhoneQuery = `
    SELECT * 
    FROM contact 
    WHERE phoneNumber = $1
`

const updatePrimaryQuery = `
    UPDATE contact
    SET linkPrecedence = $1, linkedId = $2, updatedAt = to_timestamp($3/1000.0)
    WHERE id = $4
`;

const updateSecondaryQuery = `
    UPDATE contact
    SET linkedId = $1
    WHERE id = ANY($2::int[])
`;


export default {
    insertContactQuery,
    getLinkedContactsByIDQuery,
    findContactByEmailOrPhoneQuery,
    findContactByEmailQuery,
    findContactByPhoneQuery,
    updatePrimaryQuery,
    updateSecondaryQuery
}