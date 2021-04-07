# Spaced repetition API!

Live Application: [https://spaced-client-psi.vercel.app/](https://spaced-client-psi.vercel.app/)

Client Repo: [https://github.com/Nishat322/spaced-client](https://github.com/Nishat322/spaced-client) 

## API Documentation

### Thoughtful Endpoints 

#### /api/user
    POST : used to register an account

#### /api/auth
    POST : requests authorization for logging in and registering an account

#### /api/language
    GET : Returns the language and the array of words being practiced

### /api/language/head
    GET : Returns next word, utilizes Linked List data structures

### /api/language/guess
    POST : Manages the user's guess and the resulting feedback
    
## Tech Stack
### Backend

- RESTful API
- Node & Express
- Knex
- Supertest
- Mocha & Chai
- Deployed Heroku
