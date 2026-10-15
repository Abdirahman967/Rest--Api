# REST API Checkpoint

A REST API for users, built with Express and Mongoose.

## Folder structure
```
config/
  .env            your settings (create it from .env.example, not pushed to GitHub)
  .env.example    template
models/
  User.js         Mongoose schema + model
server.js         Express server and the four routes
postman_collection.json
```

## Setup
```bash
npm install
cp config/.env.example config/.env
```
Edit `config/.env` and set `MONGO_URI` to your local MongoDB or Atlas URI.

## Run
```bash
npm start
```

## Routes
| Method | URL | What it does | Mongoose method |
|--------|-----|--------------|-----------------|
| GET | `/users` | Return all users | `User.find()` |
| POST | `/users` | Add a new user | `new User().save()` |
| PUT | `/users/:id` | Edit a user by id | `User.findByIdAndUpdate()` |
| DELETE | `/users/:id` | Remove a user by id | `User.findByIdAndDelete()` |

Example body for POST:
```json
{ "name": "Jane Doe", "email": "jane@example.com", "age": 27 }
```

## Testing with Postman
1. In Postman, click **Import** and choose `postman_collection.json`.
2. Run **POST add a user** first. It saves the new user's id automatically.
3. Then run **GET**, **PUT** and **DELETE**.
