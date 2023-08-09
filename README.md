# Identity Reconciliation

A way to identify and keep track of a customer's identity across multiple purchases. - BiteSpeed

## Tech Stack

- Node.js
- Express.js
- Postgres
- TypeScript

## Installation (Easiest Way)

- Using `ThunderClient/Postman` and using the URL: `https://identity-reconciliation-api.onrender.com/`

## Installation (locally)


1. Clone the repository:

   ```zsh
   git clone https://github.com/GauthamSree/Identity-Reconciliation.git
   cd Identity-Reconciliation
   ```


2. Set up your Postgres database and update the `.env` file with your database configuration.
    ```SQL
    TABLE Contact {
	    id                   Int                   
        phoneNumber          String?
        email                String?
        linkedId             Int? // the ID of another Contact linked to this one
        linkPrecedence       "secondary"|"primary" // "primary" if its the first Contact in the link
        createdAt            DateTime              
        updatedAt            DateTime              
        deletedAt            DateTime?
    }

    CREATE TABLE Contact ( 
        id SERIAL PRIMARY KEY, 
        phoneNumber VARCHAR(10), 
        email VARCHAR (255), 
        linkedId INT, 
        linkPrecedence VARCHAR (25),
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL,
        deletedAt TIMESTAMP);
    ```

3. Build and run the TypeScript code:
    ```zsh
    npm install
    npm run dev
    ```

## API Endpoints

* **GET `/welcome`**
    - Returns a welcome message.
* **POST `/findIdentity`**
    - Accepts JSON data with `email` and `phoneNumber`, and returns contact information.
    

## Directory Structure

* `src/` - Contains the TypeScript source code.
* `src/models/` - Contains the data models.
* `src/routes/` - Contains the API routes.
* `src/services/` - Contains the business logic.
* `src/db.js` - Configuration for connecting to the database.
* `package.json` - Project configuration and dependencies.
* `tsconfig.json` - TypeScript compiler configuration.


## Contributing

Contributions are welcome! Please create an issue or pull request for any improvements or bug fixes.