import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Modern 2026 ES Module way to get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'songs.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("Connected to SQLite database.");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();


const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_TOKEN = process.env.AUTH_TOKEN ;//|| "your_secret_token";
const dbPath = path.join(__dirname, 'songs.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware to check X-Auth-Token
const authenticateToken = (req, res, next) => {
    const token = req.headers['x-auth-token'];
    
    // Check if AUTH_TOKEN is actually set in the environment
    if (!AUTH_TOKEN) {
        console.error("Security Warning: AUTH_TOKEN is not set in environment variables!");
        return res.status(500).json({ error: "Server configuration error" });
    }

    // Check if the provided token matches
    if (token !== AUTH_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};


// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the SQLite database
//const db = new sqlite3.Database('./songs.sqlite');

// Create a new user
app.post('/api/category',authenticateToken, (req, res) => {
    const { type_id, name } = req.body;
    const sql = 'INSERT INTO songs_category (type_id, name) VALUES (?, ?)';
    db.run(sql, [type_id, name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Get all users
app.get('/api/category',authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM songs_category';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ categories: rows });
    });
});

// Get a single user by ID
app.get('/api/category/:id',authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM songs_category WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// Update a user by ID
app.put('/api/category/:id', authenticateToken,(req, res) => {
    const { id } = req.params;
    const {type_id, name } = req.body;
    const sql = 'UPDATE songs_category SET type_id = ?, name = ? WHERE id = ?';
    db.run(sql, [ type_id,name, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ updated: this.changes });
    });
});

// Delete a user by ID
app.delete('/api/category/:id',authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM songs_category WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ deleted: this.changes });
    });
});


app.post('/api/song',authenticateToken, (req, res) => {
    const {title,content,create_time,update_time,is_custom,is_locked,author,state,version_number,songurl,category_id } = req.body;
    const sql = 'INSERT INTO songs_song (title,content,create_time,update_time,is_custom,is_locked,author,state,version_number,songurl) VALUES ( ?,?,?,?,?,?,?,?,?,?)';
    db.run(sql, [title,content,create_time,update_time,is_custom,is_locked,author,state,version_number,songurl,], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const songId = this.lastID;
        const catSql = 'INSERT INTO songs_song_categories (song_id, category_id) VALUES (?, ?)';
        db.run(catSql, [songId,category_id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: songId, category_id: this.lastID });
        });
    });
});

app.put('/api/song/:id',authenticateToken, (req, res) => {
    const { id } = req.params;
    const {title,content,update_time,is_custom,is_locked,state,version_number,songurl} = req.body;
    const sql = 'UPDATE songs_song SET title=?,content=?,update_time=?,is_custom=?,is_locked=?,state=?,version_number=?,songurl=? WHERE id = ?';
    db.run(sql, [ title,content,update_time,is_custom,is_locked,state,version_number,songurl, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json({ updated: this.changes });
    });
});

app.get('/api/song/:id',authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM songs_song WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(row);
    });
});

app.get('/api/song',authenticateToken, (req, res) => {
   
    const sql = 'SELECT * FROM songs_song ';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ songs: rows });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

