# Identity Reconciliation

A way to identify and keep track of a customer's identity across multiple purchases. - BiteSpeed

## Tech Stack

- Node.js
- Express.js
- Postgres
- TypeScript

## Installation (Easiest Way)

- Go to Website


## Installation (locally)


1. Clone the repository:

   ```zsh
   git clone https://github.com/GauthamSree/Identity-Reconciliation.git
   cd Identity-Reconciliation
   ```


2. Set up your Postgres database and update the db.js file with your database configuration.

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
* `src/db.js` - Configuration for connecting to the database.
* `package.json` - Project configuration and dependencies.
* `tsconfig.json` - TypeScript compiler configuration.


## Contributing

Contributions are welcome! Please create an issue or pull request for any improvements or bug fixes.